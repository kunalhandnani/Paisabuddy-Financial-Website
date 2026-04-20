export interface User {
  id: string;
  name: string;
  email: string;
}

export interface DashboardSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalReturns: number;
  activeInvestments: number;
  returnPercentage: number;
  topHoldings: Array<{
    id: string;
    name: string;
    category: string;
    currentValue: number;
    changePercent: number;
  }>;
}

export interface InvestmentOption {
  name: string;
  category: string;
  expectedReturns: string;
  minimumInvestment: string;
  description: string;
  highlights: string[];
}

export interface Investment {
  id: string;
  name: string;
  category: string;
  amount: number;
  currentValue: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  status: 'active' | 'paused' | 'closed';
  notes: string;
  startedOn: string;
  gainLoss: number;
  gainLossPercent: number;
}

export interface StockIndex {
  symbol: string;
  value: number;
  changePercent: number;
  previousClose: number;
}

export interface StockPoint {
  time: string;
  nifty: number | null;
  sensex: number | null;
}

export interface TopStock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: string;
}

export interface StocksOverview {
  marketDate: string;
  source: string;
  indices: StockIndex[];
  chart: StockPoint[];
  topStocks: TopStock[];
}
