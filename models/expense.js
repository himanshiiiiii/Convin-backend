const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  percentage: Number,
  amount: Number,
});

const ExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  splitMethod: { type: String, enum: ['equal', 'exact', 'percentage'], required: true },
  shares: [ShareSchema],
});

const Expense = mongoose.model('Expense', ExpenseSchema);
module.exports = Expense;
