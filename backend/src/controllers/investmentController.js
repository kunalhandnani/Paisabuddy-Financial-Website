import { Investment } from '../models/Investment.js';
import { investmentOptions } from '../services/defaultOptions.js';

function mapInvestment(investment) {
  const gainLoss = investment.currentValue - investment.amount;
  const gainLossPercent = investment.amount === 0 ? 0 : (gainLoss / investment.amount) * 100;

  return {
    id: investment._id.toString(),
    name: investment.name,
    category: investment.category,
    amount: investment.amount,
    currentValue: investment.currentValue,
    riskLevel: investment.riskLevel,
    status: investment.status,
    notes: investment.notes,
    startedOn: investment.startedOn,
    gainLoss: Number(gainLoss.toFixed(2)),
    gainLossPercent: Number(gainLossPercent.toFixed(2)),
  };
}

export async function getInvestments(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }

    const investments = await Investment.find({ userId }).sort({ createdAt: -1 });

    return res.json({
      recommendedOptions: investmentOptions,
      activeInvestments: investments.filter((investment) => investment.status === 'active').map(mapInvestment),
      allInvestments: investments.map(mapInvestment),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load investments.' });
  }
}

export async function createInvestment(req, res) {
  try {
    const { userId, name, category, amount, currentValue, riskLevel, status, notes, startedOn } = req.body;

    if (!userId || !name || !category || amount === undefined) {
      return res.status(400).json({ message: 'userId, name, category, and amount are required.' });
    }

    const investment = await Investment.create({
      userId,
      name: String(name).trim(),
      category: String(category).trim(),
      amount: Number(amount),
      currentValue: Number(currentValue || amount),
      riskLevel: riskLevel || 'Medium',
      status: status || 'active',
      notes: notes ? String(notes).trim() : '',
      startedOn: startedOn || new Date(),
    });

    return res.status(201).json({ investment: mapInvestment(investment) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to save investment.' });
  }
}
