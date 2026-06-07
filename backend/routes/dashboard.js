const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// GET /api/dashboard
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });

    // Total
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Monthly
    const now = new Date();
    const monthly = expenses
      .filter(e => {
        const d = new Date(e.expenseDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);

    // Recent 5
    const recent = await Expense.find({ user: req.user.id })
      .sort({ expenseDate: -1 })
      .limit(5);

    // Category breakdown (for pie chart)
    const categoryBreakdown = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    // Monthly trend - last 6 months (for line chart)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthTotal = expenses
        .filter(e => {
          const ed = new Date(e.expenseDate);
          return ed.getMonth() === d.getMonth() && ed.getFullYear() === year;
        })
        .reduce((sum, e) => sum + e.amount, 0);
      monthlyTrend.push({ month: monthName, amount: monthTotal });
    }

    res.json({ total, monthly, recent, categoryBreakdown, monthlyTrend });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;