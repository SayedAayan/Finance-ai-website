import fetch from 'node-fetch';

const AMFI_URL = 'https://www.amfiindia.com/spages/NAVAll.txt';

function detectPlan(name) {
  if (/\bdirect\b/i.test(name)) return 'Direct';
  if (/\bregular\b/i.test(name)) return 'Regular';
  return 'Other';
}

function detectOption(name) {
  if (/\bidcw\b/i.test(name) || /\bdividend\b/i.test(name)) {
    if (/reinvest/i.test(name)) return 'IDCW Reinvestment';
    if (/payout/i.test(name)) return 'IDCW Payout';
    return 'IDCW';
  }
  if (/\bbonus\b/i.test(name)) return 'Bonus';
  if (/\bgrowth\b/i.test(name)) return 'Growth';
  return 'Other';
}

// Parses AMFI's daily NAVAll.txt feed into AMCs and schemes. Each scheme line has
// both ISIN columns (growth/payout and reinvestment) directly from AMFI — no
// separate ISIN file is needed since AMFI publishes it inline.
export function parseAmfiNav(text) {
  const lines = text.split('\n');
  const amcMap = new Map();
  const schemes = [];
  let currentCategory = '';
  let currentAmc = '';

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith('Open Ended') || line.startsWith('Close Ended') || line.startsWith('Interval')) {
      currentCategory = line.replace(/^Open Ended Schemes\(|^Close Ended Schemes\(|^Interval Income Fund\(|\)$/g, '').trim();
      continue;
    }

    if (line.includes(';')) {
      const cols = line.split(';');
      if (cols.length < 6 || cols[0] === 'Scheme Code') continue;
      const [schemeCode, isinGrowthPayout, isinReinvest, schemeName, nav, date] = cols;
      const navNum = parseFloat(nav);
      if (!currentAmc || !schemeName || Number.isNaN(navNum)) continue;

      schemes.push({
        id: `MF:${schemeCode}`,
        schemeCode,
        amc: currentAmc,
        category: currentCategory.split(' - ')[0]?.trim() || currentCategory,
        subCategory: currentCategory,
        name: schemeName.trim(),
        plan: detectPlan(schemeName),
        option: detectOption(schemeName),
        nav: navNum,
        date,
        isin: isinGrowthPayout && isinGrowthPayout !== '-' ? isinGrowthPayout : (isinReinvest !== '-' ? isinReinvest : null)
      });

      if (!amcMap.has(currentAmc)) amcMap.set(currentAmc, { name: currentAmc, schemeCount: 0, categories: new Set() });
      const entry = amcMap.get(currentAmc);
      entry.schemeCount += 1;
      if (currentCategory) entry.categories.add(currentCategory);
      continue;
    }

    if (/mutual fund$/i.test(line)) {
      currentAmc = line;
    }
  }

  const amcs = Array.from(amcMap.values())
    .map(a => ({ id: `AMC:${a.name}`, name: a.name, schemeCount: a.schemeCount, categories: Array.from(a.categories).slice(0, 6) }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { amcs, schemes };
}

export async function loadAmfiData() {
  const res = await fetch(AMFI_URL, { redirect: 'follow' });
  if (!res.ok) throw new Error(`AMFI fetch failed: HTTP ${res.status}`);
  const text = await res.text();
  return parseAmfiNav(text);
}
