// Location and currency service
export const getCurrencyByLocation = async (): Promise<'INR' | 'USD'> => {
  try {
    // Try to get location from IP geolocation API
    const response = await fetch('https://ipapi.co/json/', { method: 'GET' });
    const data = await response.json();
    const country = data.country_code || '';
    
    // Return INR for India, USD for others
    return country === 'IN' ? 'INR' : 'USD';
  } catch (e) {
    // Fallback to USD if geolocation fails
    return 'USD';
  }
};

export const getCountryFromLocation = async (): Promise<string> => {
  try {
    const response = await fetch('https://ipapi.co/json/', { method: 'GET' });
    const data = await response.json();
    return data.country_code || 'US';
  } catch (e) {
    return 'US';
  }
};

export const convertCurrency = (amount: number, toCurrency: 'INR' | 'USD'): number => {
  // Conversion rate: 1 USD = 83 INR (approximate)
  if (toCurrency === 'INR') {
    return amount * 83;
  }
  return amount;
};

export const formatCurrency = (amount: number, currency: 'INR' | 'USD'): string => {
  const symbol = currency === 'INR' ? '₹' : '$';
  const formatted = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency, 
    maximumFractionDigits: 0 
  }).format(amount);
  return formatted;
};

export default {
  getCurrencyByLocation,
  getCountryFromLocation,
  convertCurrency,
  formatCurrency
};
