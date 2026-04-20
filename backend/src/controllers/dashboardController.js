import { Investment } from '../models/Investment.js';

export async function getDashboard(req, res) {
  try {
    const { userId } = req.params;

    const investments = await Investment.find({ userId, status: 'active' }).sort({ currentValue: -1 });

    const totalInvested = investments.reduce((sum, investment) => sum + investment.amount, 0);
    const totalCurrentValue = investments.reduce((sum, investment) => sum + investment.currentValue, 0);
    const totalReturns = totalCurrentValue - totalInvested;

    const topHoldings = investments.slice(0, 3).map((investment) => ({
      id: investment._id.toString(),
      name: investment.name,
      category: investment.category,
      currentValue: investment.currentValue,
      changePercent:
        investment.amount === 0 ? 0 : Number((((investment.currentValue - investment.amount) / investment.amount) * 100).toFixed(2)),
    }));

    return res.json({
      totalInvested: Number(totalInvested.toFixed(2)),
      totalCurrentValue: Number(totalCurrentValue.toFixed(2)),
      totalReturns: Number(totalReturns.toFixed(2)),
      activeInvestments: investments.length,
      returnPercentage: totalInvested === 0 ? 0 : Number(((totalReturns / totalInvested) * 100).toFixed(2)),
      topHoldings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load dashboard summary.' });
  }
}
