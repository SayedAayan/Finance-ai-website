import Fuse from 'fuse.js';
import { loadNseCompanies } from './loadNse.js';
import { loadBseCompanies } from './loadBse.js';
import { loadUsCompanies } from './loadUs.js';
import { loadAmfiData } from './loadAmfi.js';

const REFRESH_MS = 12 * 60 * 60 * 1000; // 12h — these sources publish at most once daily

let state = {
  fetchedAt: 0,
  companies: [],   // NSE + BSE + US
  schemes: [],     // mutual fund schemes
  amcs: [],        // mutual fund AMCs
  fuseCompanies: null,
  fuseSchemes: null,
  fuseAmcs: null,
  loading: null
};

function buildFuse(list, keys) {
  return new Fuse(list, {
    keys,
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2
  });
}

async function refresh() {
  console.log('  🔄 Refreshing company/fund search database...');
  const results = await Promise.allSettled([
    loadNseCompanies(),
    loadBseCompanies(),
    loadUsCompanies(),
    loadAmfiData()
  ]);

  const [nseR, bseR, usR, amfiR] = results;
  const nse = nseR.status === 'fulfilled' ? nseR.value : [];
  const bse = bseR.status === 'fulfilled' ? bseR.value : [];
  const us = usR.status === 'fulfilled' ? usR.value : [];
  const amfi = amfiR.status === 'fulfilled' ? amfiR.value : { amcs: [], schemes: [] };

  if (nseR.status === 'rejected') console.log(`  ⚠ NSE load failed: ${nseR.reason?.message}`);
  if (bseR.status === 'rejected') console.log(`  ⚠ BSE load failed: ${bseR.reason?.message}`);
  if (usR.status === 'rejected') console.log(`  ⚠ US load failed: ${usR.reason?.message}`);
  if (amfiR.status === 'rejected') console.log(`  ⚠ AMFI load failed: ${amfiR.reason?.message}`);

  // Dedupe: prefer NSE over BSE for companies cross-listed on both (same ISIN)
  const seenIsin = new Set(nse.filter(c => c.isin).map(c => c.isin));
  const bseDeduped = bse.filter(c => !c.isin || !seenIsin.has(c.isin));

  const companies = [...nse, ...bseDeduped, ...us];

  state = {
    fetchedAt: Date.now(),
    companies,
    schemes: amfi.schemes,
    amcs: amfi.amcs,
    fuseCompanies: buildFuse(companies, ['name', 'symbol']),
    fuseSchemes: buildFuse(amfi.schemes, ['name', 'amc']),
    fuseAmcs: buildFuse(amfi.amcs, ['name']),
    loading: null
  };

  console.log(`  ✅ Search database ready: ${companies.length} companies (NSE ${nse.length}, BSE ${bseDeduped.length}, US ${us.length}), ${amfi.schemes.length} schemes, ${amfi.amcs.length} AMCs`);
}

export async function ensureIndexReady() {
  const isStale = Date.now() - state.fetchedAt > REFRESH_MS;
  if (!isStale && state.companies.length > 0) return state;

  if (!state.loading) {
    state.loading = refresh().catch(err => {
      console.error('  ❌ Search database refresh failed:', err.message);
      state.loading = null;
      throw err;
    });
  }
  await state.loading;
  return state;
}

export function scheduleIndexRefresh() {
  ensureIndexReady().catch(() => { });
  setInterval(() => {
    ensureIndexReady().catch(() => { });
  }, REFRESH_MS);
}

export async function search(query, { limit = 8 } = {}) {
  const q = (query || '').trim();
  if (q.length < 2) return { stocks: [], funds: [], amcs: [] };

  const { fuseCompanies, fuseSchemes, fuseAmcs } = await ensureIndexReady();

  const stocks = fuseCompanies.search(q, { limit }).map(r => r.item);
  const funds = fuseSchemes.search(q, { limit }).map(r => r.item);
  const amcs = fuseAmcs.search(q, { limit: Math.min(limit, 5) }).map(r => r.item);

  return { stocks, funds, amcs };
}

export async function getCompanyById(id) {
  const { companies } = await ensureIndexReady();
  return companies.find(c => c.id === id) || null;
}

export async function getSchemeById(id) {
  const { schemes } = await ensureIndexReady();
  return schemes.find(s => s.id === id) || null;
}
