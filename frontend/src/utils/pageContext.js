// Extracts a plain-text and structured visual snapshot of what's currently visible on screen,
// enabling the STOCKBUZZ AI Guardian ("Lens" and "Assistant" modules) to perform visual sweeps,
// entity identification, and metric extraction.

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH', 'IFRAME']);
const MAX_CHARS = 4000;

const KNOWN_TICKERS = [
  'NIFTY 50', 'NIFTY50', 'SENSEX', 'BANKNIFTY', 'NIFTY BANK', 'NIFTY IT',
  'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'BHARTIARTL',
  'ITC', 'KOTAKBANK', 'LT', 'HINDUNILVR', 'AXISBANK', 'TATAMOTORS', 'SUNPHARMA',
  'MARUTI', 'NTPC', 'POWERGRID', 'TITAN', 'BAJFINANCE', 'ADANIENT', 'ADANIPORTS',
  'TSLA', 'AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN'
];

function isVisible(el) {
  if (!(el instanceof Element)) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function isInViewport(el, buffer = 400) {
  const rect = el.getBoundingClientRect();
  return rect.bottom > -buffer && rect.top < window.innerHeight + buffer;
}

// Walks the DOM under `root`, collecting short text fragments from leaf-ish elements
function collectText(root, { viewportOnly } = {}) {
  const lines = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(el) {
      if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT;
      if (!isVisible(el)) return NodeFilter.FILTER_REJECT;
      if (viewportOnly && !isInViewport(el)) return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let node = walker.currentNode;
  while (node) {
    const direct = Array.from(node.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent.trim())
      .filter(Boolean)
      .join(' ');

    if (direct) {
      const tag = node.tagName;
      if (/^H[1-6]$/.test(tag)) lines.push(`# ${direct}`);
      else if (tag === 'BUTTON' || node.getAttribute('role') === 'button') lines.push(`[button] ${direct}`);
      else if (tag === 'LABEL') lines.push(`${direct}:`);
      else if (tag === 'INPUT' || tag === 'TEXTAREA') { /* handled separately below */ }
      else lines.push(direct);
    }

    node = walker.nextNode();
  }

  return lines;
}

function collectFormValues(root) {
  const values = [];
  root.querySelectorAll('input, select, textarea').forEach(el => {
    if (!isVisible(el)) return;
    const label = el.getAttribute('aria-label') || el.placeholder || el.name || '';
    if (el.type === 'range') return; // paired number input captures the value
    const val = el.value;
    if (val === '' || val == null) return;
    values.push(`${label ? label + ' = ' : ''}${val}`.trim());
  });
  return values;
}

// Extracts visible stock tickers and financial entities
function extractVisibleTickers(textLines) {
  const found = new Set();
  const fullText = textLines.join(' ');

  for (const ticker of KNOWN_TICKERS) {
    const regex = new RegExp(`\\b${ticker.replace(/\s+/g, '\\s*')}\\b`, 'i');
    if (regex.test(fullText)) {
      found.add(ticker.toUpperCase());
    }
  }

  // Also check URL parameters or path (e.g., /stock/RELIANCE or /fund/HDFC)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2 && (pathParts[0] === 'stock' || pathParts[0] === 'fund' || pathParts[0] === 'pro-book')) {
    found.add(decodeURIComponent(pathParts[1]).toUpperCase());
  }

  return Array.from(found);
}

// Extracts key financial metrics visible on the screen
function extractMetrics(textLines) {
  const metrics = {};
  const fullText = textLines.join('\n');

  // Price match (e.g. ₹2,950.45 or 2950.45 or $150.20)
  const priceMatch = fullText.match(/(?:₹|\$|INR)\s*([\d,]+\.?\d*)/i);
  if (priceMatch) metrics.price = priceMatch[1];

  // Change % match (e.g. +1.24% or -0.85%)
  const changeMatch = fullText.match(/([+-]?\d+\.?\d*)\s*%/);
  if (changeMatch) metrics.change = changeMatch[0];

  // P/E ratio match
  const peMatch = fullText.match(/P\/E(?:\s*Ratio)?[:\s]+([\d\.]+)/i);
  if (peMatch) metrics.pe_ratio = peMatch[1];

  // RSI match
  const rsiMatch = fullText.match(/RSI(?:\s*\(14\))?[:\s]+([\d\.]+)/i);
  if (rsiMatch) metrics.rsi = rsiMatch[1];

  // Volume match
  const volumeMatch = fullText.match(/Volume[:\s]+([\d,\.]+\s*[KMBCr]?)/i);
  if (volumeMatch) metrics.volume = volumeMatch[1];

  return metrics;
}

/**
 * Returns a compact description of the current page along with structured
 * visual context for the Stockbuzz AI Guardian.
 */
export function getVisiblePageContext() {
  const main = document.querySelector('main') || document.body;
  const title = document.title || '';

  const textLines = collectText(main);
  const formValues = collectFormValues(main);

  const deduped = [];
  const seen = new Set();
  for (const line of textLines) {
    const key = line.slice(0, 120);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(line);
  }

  let body = deduped.join('\n');
  if (formValues.length) {
    body += `\n\nCurrent input values:\n${formValues.join('\n')}`;
  }

  if (body.length > MAX_CHARS) {
    body = body.slice(0, MAX_CHARS) + '\n…(truncated)';
  }

  const visibleTickers = extractVisibleTickers(deduped);
  const extractedMetrics = extractMetrics(deduped);

  const visual_context = {
    current_url: window.location.href,
    visible_tickers: visibleTickers,
    extracted_metrics: extractedMetrics,
    body_snapshot: body.slice(0, 1500)
  };

  return {
    title,
    url: window.location.pathname,
    body,
    visual_context
  };
}
