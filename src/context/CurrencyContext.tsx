import React, { createContext, useContext, useState, useEffect } from 'react';

interface CurrencyContextType {
  userCurrency: string;
  exchangeRate: number;
  formatPrice: (priceString?: string) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userCurrency, setUserCurrency] = useState<string>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        // 1. Get user's currency based on IP
        const geoResponse = await fetch('https://ipwho.is/');
        const geoData = await geoResponse.json();
        
        let targetCurrency = 'USD';
        if (geoData && geoData.currency && geoData.currency.code) {
          targetCurrency = geoData.currency.code;
        }
        setUserCurrency(targetCurrency);

        // 2. Get exchange rates (base USD)
        if (targetCurrency !== 'USD') {
          const ratesResponse = await fetch('https://open.er-api.com/v6/latest/USD');
          const ratesData = await ratesResponse.json();
          
          if (ratesData && ratesData.rates && ratesData.rates[targetCurrency]) {
            setExchangeRate(ratesData.rates[targetCurrency]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch currency data:', error);
        // Fallback to USD is already set in state
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrencyData();
  }, []);

  const formatPrice = (priceString?: string) => {
    if (!priceString) return '';
    
    // Extract numeric value from string (e.g., "$89.99" -> 89.99)
    const numericMatch = priceString.match(/[\d,.]+/);
    if (!numericMatch) return priceString; // Return original if no numbers found
    
    const numericValue = parseFloat(numericMatch[0].replace(/,/g, ''));
    if (isNaN(numericValue)) return priceString;

    // Convert to local currency (assuming base price in DB is USD)
    const convertedValue = numericValue * exchangeRate;

    // Format using Intl.NumberFormat
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: userCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedValue);
    } catch (e) {
      // Fallback if currency code is invalid
      return `${userCurrency} ${convertedValue.toFixed(2)}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ userCurrency, exchangeRate, formatPrice, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
