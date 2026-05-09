// Utility functions for currency conversion and location detection

// Function to get user's country based on IP
export const getUserCountry = async () => {
  try {
    // Use a free IP geolocation service
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country || 'US'; // Default to US if no country detected
  } catch (error) {
    console.error('Error detecting user country:', error);
    return 'US'; // Default to US on error
  }
};

// Function to determine currency based on user location
export const getUserCurrency = async () => {
  const country = await getUserCountry();
  
  // Countries that use INR or have strong ties to India
  const indianSubcontinentCountries = ['IN', 'NP', 'BT', 'LK'];
  
  if (indianSubcontinentCountries.includes(country)) {
    return 'INR';
  }
  
  // You can expand this list with other regional currencies as needed
  // For now, default to USD for all other countries
  return 'USD';
};

// Function to convert price based on currency
export const convertPrice = (price, fromCurrency, toCurrency) => {
  // For now, we'll use fixed conversion rates for demo purposes
  // In a real application, you'd fetch real-time rates from an API
  
  if (fromCurrency === toCurrency) {
    return price;
  }
  
  // Simple conversion rates (these should be fetched from an API in production)
  const conversionRates = {
    'USD_TO_INR': 83.00, // 1 USD = 83 INR (approximate)
    'INR_TO_USD': 0.012, // 1 INR = 0.012 USD (approximate)
  };
  
  if (fromCurrency === 'USD' && toCurrency === 'INR') {
    return price * conversionRates['USD_TO_INR'];
  } else if (fromCurrency === 'INR' && toCurrency === 'USD') {
    return price * conversionRates['INR_TO_USD'];
  }
  
  // If no conversion is known, return the original price
  return price;
};

// Function to format price with currency
export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
};