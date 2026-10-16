/*
 * Background service worker.
 * Fetches rates for all supported currencies vs RUB from open.er-api.com,
 * caches them in chrome.storage.local, and persists rate snapshots to Supabase.
 */

const RATE_CACHE_MS = 60 * 60 * 1000; // 1 hour

// Currencies to fetch rates for (all except RUB which is the target).
// open.er-api.com returns rates relative to a base currency.
// We fetch RUB as base and invert: if 1 RUB = 0.0123 USD, then 1 USD = 1/0.0123 RUB.
const API_URL = "https://open.er-api.com/v6/latest/RUB";

const SUPPORTED_CURRENCIES = [
  "KZT", "USD", "EUR", "GBP", "TRY", "UAH", "PLN", "CNY", "INR",
  "BRL", "JPY", "KRW", "CHF", "CAD", "AUD", "MXN", "SGD", "HKD",
  "TWD", "THB",
];

const SUPABASE_URL = "https://tlikeuiwwupjawyzhxaj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaWtldWl3d3VwamF3eXpoeGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxODA5MDYsImV4cCI6MjEwNzc1NjkwNn0.Vg91kEqZUkle2DdYI9Vjbqh-lGPQn1DFm9CKNAIe_rw";

async function persistToSupabase(rates) {
  try {
    const rows = Object.entries(rates).map(([code, rate]) => ({
      currency_code: code,
      rate: rate,
      source: "open.er-api.com",
    }));
    const response = await fetch(`${SUPABASE_URL}/rest/v1/exchange_rates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(rows),
    });
    if (!response.ok) {
      console.warn("Steam Conv: Supabase persist failed", response.status);
    }
  } catch (e) {
    console.warn("Steam Conv: Supabase persist error", e);
  }
}

async function fetchRates() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    if (data && data.rates) {
      const rubRates = {};
      for (const code of SUPPORTED_CURRENCIES) {
        if (data.rates[code] && data.rates[code] > 0) {
          rubRates[code] = 1 / data.rates[code];
        }
      }
      const timestamp = Date.now();
      const payload = { rates: rubRates, timestamp };
      await chrome.storage.local.set(payload);
      persistToSupabase(rubRates);
      return payload;
    }
  } catch (e) {
    console.error("Steam Conv: failed to fetch rates", e);
  }
  return null;
}

chrome.runtime.onInstalled.addListener(() => {
  fetchRates();
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "getRates") {
    chrome.storage.local.get(["rates", "timestamp"], async (result) => {
      const stale =
        !result.rates ||
        !result.timestamp ||
        Date.now() - result.timestamp > RATE_CACHE_MS;
      if (stale) {
        const fresh = await fetchRates();
        sendResponse(fresh || result);
      } else {
        sendResponse(result);
      }
    });
    return true;
  }

  if (msg.type === "refreshRates") {
    fetchRates().then((fresh) => {
      sendResponse(fresh);
    });
    return true;
  }
});
