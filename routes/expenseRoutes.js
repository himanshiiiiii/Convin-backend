const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const Expense = require('../models/expense');
const User = require('../models/user');
const {jwtAuthMiddleware,generateToken}=require('../jwt');
const mongoose = require('mongoose');


// Add expense
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    const { description, amount, participants = [], splitMethod, shares = [] } = req.body;

    // Validate description and amount
    if (!description || !amount || !splitMethod) {
      return res.status(400).json({ error: 'Description, amount, and splitMethod are required' });
    }

    // Ensure participants are valid ObjectId
    const validParticipants = participants.map(id => new mongoose.Types.ObjectId(id));

    // Calculate shares for "equal" split method
    let calculatedShares = [];
    if (splitMethod === 'equal') {
      const equalAmount = amount / participants.length;
      calculatedShares = validParticipants.map(userId => ({
        user: userId,
        amount: equalAmount,
        percentage: (equalAmount / amount) * 100
      }));
    }

    // Validate shares if splitMethod is percentage
    if (splitMethod === 'percentage') {
      const totalPercentage = shares.reduce((acc, share) => acc + share.percentage, 0);
      if (totalPercentage !== 100) {
        return res.status(400).json({ error: 'Percentages must add up to 100%' });
      }
    }

    const expense = new Expense({
      description,
      amount,
      participants: validParticipants,
      splitMethod,
      shares: splitMethod === 'equal' ? calculatedShares : shares.map(share => ({
        user: new mongoose.Types.ObjectId(share.user),
        percentage: share.percentage,
        amount: share.amount
      }))
    });

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
router.get('/download', async (req, res) => {
  try {
      const expenses = await Expense.find().populate('participants').populate('shares.user');
      if (expenses.length === 0) {
          return res.status(400).json({ error: 'No expenses found to download' });
      }

      const fields = [
          { label: 'Description', value: 'description' },
          { label: 'Amount', value: 'amount' },
          { label: 'Date', value: 'date' },
          { label: 'Participants', value: row => row.participants.map(p => p.name).join(', ') },
          { label: 'Split Method', value: 'splitMethod' },
          { label: 'Shares', value: row => row.shares.map(s => `${s.user.name}: ${s.percentage ? s.percentage + '%' : s.amount}`).join(', ') }
      ];

      const json2csvParser = new Parser({ fields });
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
