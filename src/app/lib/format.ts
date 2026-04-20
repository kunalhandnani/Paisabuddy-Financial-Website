export function formatCurrency(value: number) {
  return `Rs. ${Math.round(value).toLocaleString('en-IN')}`;
}

export function formatPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}
