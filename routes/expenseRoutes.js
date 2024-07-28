const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const Expense = require('../models/expense');
const User = require('../models/user');
const {jwtAuthMiddleware,generateToken}=require('../jwt');

// Add expense
router.post('/',jwtAuthMiddleware, async (req, res) => {
  try {
    const { description, amount, participants, splitMethod, shares } = req.body;

    if (splitMethod === 'percentage') {
      const totalPercentage = shares.reduce((acc, share) => acc + share.percentage, 0);
      if (totalPercentage !== 100) {
        return res.status(400).json({ error: 'Percentages must add up to 100%' });
      }
    }

    const expense = new Expense({ description, amount, participants, splitMethod, shares });
    await expense.save();
    res.status(201).json({ expense });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve overall expenses
router.get('/',jwtAuthMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find().populate('participants shares.user');
    res.status(200).json({ expenses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get overall expenses
router.get('/total',jwtAuthMiddleware, async (req, res) => {
  try {
    const totalExpenses = await Expense.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);
    res.status(200).json({ totalExpenses });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download balance sheet
router.get('/download',jwtAuthMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find().populate('participants').populate('shares.user');
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(expenses);

    res.header('Content-Type', 'text/csv');
    res.attachment('balance-sheet.csv');
    res.status(200).send(csv);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
})


module.exports = router;
