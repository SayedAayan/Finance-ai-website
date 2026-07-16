import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CurrencyContext = createContext();

export function useCurrency() {
  return useContext(CurrencyContext);
}

export const CURRENCIES = {
  INR: { symbol: '₹', label: 'Indian Rupee', locale: 'en-IN' },
  USD: { symbol: '$', label: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', label: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', label: 'British Pound', locale: 'en-GB' },
  AED: { symbol: 'د.إ', label: 'UAE Dirham', locale: 'ar-AE' },
  SAR: { symbol: 'ر.س', label: 'Saudi Riyal', locale: 'ar-SA' },
  KWD: { symbol: 'د.ك', label: 'Kuwaiti Dinar', locale: 'ar-KW' },
  JPY: { symbol: '¥', label: 'Japanese Yen', locale: 'ja-JP' },
  AUD: { symbol: 'A$', label: 'Australian Dollar', locale: 'en-AU' },
  CAD: { symbol: 'C$', label: 'Canadian Dollar', locale: 'en-CA' },
  SGD: { symbol: 'S$', label: 'Singapore Dollar', locale: 'en-SG' },
  CHF: { symbol: 'Fr', label: 'Swiss Franc', locale: 'de-CH' },
  CNY: { symbol: '¥', label: 'Chinese Yuan', locale: 'zh-CN' }
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

  // Converts an amount (denominated in sourceCurrency, default INR) into the selected currency
  const convert = useCallback((amount, sourceCurrency = 'INR') => {
    if (typeof amount !== 'number' || Number.isNaN(amount)) return null;
    // Normalize to INR first if the source isn't already INR (rates are INR -> target)
    const sourceRate = rates[sourceCurrency] ?? 1;
    const amountInInr = sourceCurrency === 'INR' ? amount : amount / sourceRate;
    const rate = rates[currency] ?? 1;
    return amountInInr * rate;
  }, [rates, currency]);

  // Formats an amount (denominated in sourceCurrency, default INR) as a localized string in the selected currency
  const formatPrice = useCallback((amount, options = {}, sourceCurrency = 'INR') => {
    const converted = convert(amount, sourceCurrency);
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
