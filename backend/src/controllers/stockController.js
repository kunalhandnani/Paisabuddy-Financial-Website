import { getMarketOverview } from '../services/stockService.js';

export async function getStocksOverview(_req, res) {
  try {
    const overview = await getMarketOverview();
    return res.json(overview);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load market overview.' });
  }
}
