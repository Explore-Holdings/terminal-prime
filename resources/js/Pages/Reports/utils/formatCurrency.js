const USD_RATE = 300;

export function formatCurrency(amount, currency = 'LKR') {
    const num = Number(amount);
    if (currency === 'USD') {
        return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `Rs. ${num.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function toBaseCurrency(amount, currency) {
    return currency === 'USD' ? amount * USD_RATE : amount;
}
