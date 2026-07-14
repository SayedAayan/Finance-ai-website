import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CurrencyContext = createContext();

export function useCurrency() {
  return useContext(CurrencyContext);
}

export const CURRENCIES = {
  INR: { symbol: '₹', label: 'Indian Rupee', locale: 'en-IN' },
  USD: { symbol: '$', label: 'US Dollar', locale: 'en-US' },
  AED: { symbol: 'د.إ', label: 'UAE Dirham', locale: 'ar-AE' },
  GBP: { symbol: '£', label: 'British Pound', locale: 'en-GB' },
  EUR: { symbol: '€', label: 'Euro', locale: 'de-DE' },
  SAR: { symbol: 'ر.س', label: 'Saudi Riyal', locale: 'ar-SA' },
  KWD: { symbol: 'د.ك', label: 'Kuwaiti Dinar', locale: 'ar-KW' }
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'INR');
  const [rates, setRates] = useState({ INR: 1 });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/fx-rates')
      .then(r => r.json())
      .then(data => { if (!cancelled && data.rates) setRates(data.rates); })
      .catch(() => { });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // Converts an INR-denominated amount into the selected currency
  const convert = useCallback((amountInInr) => {
    if (typeof amountInInr !== 'number' || Number.isNaN(amountInInr)) return null;
    const rate = rates[currency] ?? 1;
    return amountInInr * rate;
  }, [rates, currency]);

  // Formats an INR-denominated amount as a localized string in the selected currency
  const formatPrice = useCallback((amountInInr, options = {}) => {
    const converted = convert(amountInInr);
    if (converted === null) return '-';
    const { symbol, locale } = CURRENCIES[currency];
    const formatted = converted.toLocaleString(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2, ...options });
    return `${symbol}${formatted}`;
  }, [convert, currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, convert, formatPrice, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
}
