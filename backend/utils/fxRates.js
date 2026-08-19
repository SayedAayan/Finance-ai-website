import fetch from 'node-fetch';

// In-memory FX Rates Cache with last-good-rate fallback
let cachedRates = {
  base: 'INR',
  timestamp: Date.now(),
  rates: {
    INR: 1,
    USD: 0.0116,    // ~ 1 USD = 86.2 INR
    GBP: 0.0092,    // ~ 1 GBP = 108.7 INR
    EUR: 0.0107     // ~ 1 EUR = 93.4 INR
  },
  pairs: {
    'USD/INR': 86.20,
    'GBP/INR': 108.70,
    'EUR/INR': 93.40,
    'INR/USD': 0.0116,
    'INR/GBP': 0.0092,
    'INR/EUR': 0.0107
  }
};

let lastFetch = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function getLiveFxRates() {
  const now = Date.now();
  if (now - lastFetch < CACHE_TTL_MS && Object.keys(cachedRates.rates).length > 0) {
    return cachedRates;
  }

  try {
    // Attempt fetching live USD/INR and GBP/INR from open exchange API or Yahoo chart
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { timeout: 3500 });
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && data.rates.INR) {
        const usdToInr = data.rates.INR;
        const gbpToUsd = data.rates.GBP; // e.g. 0.79
        const eurToUsd = data.rates.EUR; // e.g. 0.92
        const gbpToInr = usdToInr / (gbpToUsd || 0.79);
        const eurToInr = usdToInr / (eurToUsd || 0.92);

        cachedRates = {
          base: 'INR',
          timestamp: now,
          rates: {
            INR: 1,
            USD: +(1 / usdToInr).toFixed(6),
            GBP: +(1 / gbpToInr).toFixed(6),
            EUR: +(1 / eurToInr).toFixed(6)
          },
          pairs: {
            'USD/INR': +usdToInr.toFixed(2),
            'GBP/INR': +gbpToInr.toFixed(2),
            'EUR/INR': +eurToInr.toFixed(2),
            'INR/USD': +(1 / usdToInr).toFixed(6),
            'INR/GBP': +(1 / gbpToInr).toFixed(6),
            'INR/EUR': +(1 / eurToInr).toFixed(6)
          }
        };
        lastFetch = now;
      }
    }
  } catch (err) {
    console.warn('[FX Rates] Error updating live rates, serving cached last-good-rate:', err.message);
  }

  return cachedRates;
}

// Background scheduler
const timer = setInterval(() => {
  getLiveFxRates().catch(() => {});
}, CACHE_TTL_MS);
if (timer.unref) timer.unref();

