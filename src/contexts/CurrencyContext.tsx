'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal' },
];

// Map browser locale to currency code
function localeToCurrency(locale: string): string {
  const map: Record<string, string> = {
    'en-US': 'USD', 'en-GB': 'GBP', 'en-AU': 'AUD', 'en-CA': 'CAD',
    'en-SG': 'SGD', 'en-NZ': 'NZD', 'en-ZA': 'ZAR', 'en-IN': 'INR',
    'de': 'EUR', 'fr': 'EUR', 'it': 'EUR', 'es': 'EUR', 'pt-BR': 'BRL',
    'ja': 'JPY', 'zh': 'CNY', 'zh-HK': 'HKD', 'ko': 'KRW',
    'ar-AE': 'AED', 'ar-SA': 'SAR', 'ar-QA': 'QAR', 'ar-EG': 'EGP',
    'hi': 'INR', 'si': 'LKR', 'ms': 'MYR', 'th': 'THB',
    'tr': 'TRY', 'sv': 'SEK', 'nb': 'NOK', 'da': 'DKK',
    'nl': 'EUR', 'pl': 'EUR', 'cs': 'EUR', 'hu': 'EUR',
    'id': 'IDR', 'ur': 'PKR', 'yo': 'NGN', 'ig': 'NGN',
  };
  // Try full locale, then language only
  return map[locale] || map[locale.split('-')[0]] || 'USD';
}

interface CurrencyContextValue {
  currency: string;
  setCurrency: (code: string) => void;
  convert: (amount: number, fromCurrency: string) => number;
  formatConverted: (amount: number, fromCurrency: string) => string;
  ratesLoaded: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'USD',
  setCurrency: () => {},
  convert: (a) => a,
  formatConverted: (a) => String(a),
  ratesLoaded: false,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState('USD');
  const [rates, setRates] = useState<Record<string, number>>({});
  const [ratesLoaded, setRatesLoaded] = useState(false);

  // Detect user's locale currency on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferredCurrency');
    if (saved && CURRENCIES.find((c) => c.code === saved)) {
      setCurrencyState(saved);
    } else {
      const locale = navigator.language || 'en-US';
      setCurrencyState(localeToCurrency(locale));
    }
  }, []);

  // Fetch exchange rates (base USD)
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((r) => r.json())
      .then((data) => {
        if (data.rates) {
          setRates(data.rates);
          setRatesLoaded(true);
        }
      })
      .catch(() => {
        // fallback: no conversion, show as-is
        setRatesLoaded(true);
      });
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    localStorage.setItem('preferredCurrency', code);
  }, []);

  const convert = useCallback(
    (amount: number, fromCurrency: string): number => {
      if (!ratesLoaded || fromCurrency === currency) return amount;
      const fromRate = rates[fromCurrency] ?? 1;
      const toRate = rates[currency] ?? 1;
      return (amount / fromRate) * toRate;
    },
    [rates, currency, ratesLoaded],
  );

  const formatConverted = useCallback(
    (amount: number, fromCurrency: string): string => {
      const converted = convert(amount, fromCurrency);
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'JPY' || currency === 'KRW' || currency === 'IDR' ? 0 : 2,
      }).format(converted);
    },
    [convert, currency],
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, formatConverted, ratesLoaded }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
