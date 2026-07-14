import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Landmark, Search, TrendingUp, TrendingDown, Loader2, Layers } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function AmcDatabase() {
  const [tab, setTab] = useState('amcs'); // 'amcs' | 'companies'

  // AMC state
  const [amcs, setAmcs] = useState([]);
  const [amcsLoading, setAmcsLoading] = useState(true);
  const [amcsError, setAmcsError] = useState(null);
  const [amcQuery, setAmcQuery] = useState('');
  const [expandedAmc, setExpandedAmc] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [schemesLoading, setSchemesLoading] = useState(false);

  // Company state
  const [companies, setCompanies] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState(null);
  const [companyQuery, setCompanyQuery] = useState('');
  const [activeSector, setActiveSector] = useState('All');

  useEffect(() => {
    let active = true;
    setAmcsLoading(true);
    fetch(`${API_URL}/amcs`)
      .then(res => { if (!res.ok) throw new Error('Failed to fetch AMC list'); return res.json(); })
      .then(data => { if (active) { setAmcs(data.amcs || []); setAmcsError(null); } })
      .catch(err => { if (active) setAmcsError(err.message); })
      .finally(() => { if (active) setAmcsLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setCompaniesLoading(true);
    fetch(`${API_URL}/companies?live=true`)
      .then(res => { if (!res.ok) throw new Error('Failed to fetch company list'); return res.json(); })
      .then(data => { if (active) { setCompanies(data.companies || []); setSectors(data.sectors || []); setCompaniesError(null); } })
      .catch(err => { if (active) setCompaniesError(err.message); })
      .finally(() => { if (active) setCompaniesLoading(false); });
    return () => { active = false; };
  }, []);

  const toggleAmc = async (amcName) => {
    if (expandedAmc === amcName) { setExpandedAmc(null); return; }
    setExpandedAmc(amcName);
    setSchemesLoading(true);
    try {
      const res = await fetch(`${API_URL}/schemes?amc=${encodeURIComponent(amcName)}&limit=12`);
      const data = await res.json();
      setSchemes(data.schemes || []);
    } catch {
      setSchemes([]);
    } finally {
      setSchemesLoading(false);
    }
  };

  const filteredAmcs = useMemo(() => {
    if (!amcQuery.trim()) return amcs;
    const needle = amcQuery.toLowerCase();
    return amcs.filter(a => a.name.toLowerCase().includes(needle));
  }, [amcs, amcQuery]);

  const filteredCompanies = useMemo(() => {
    let list = companies;
    if (activeSector !== 'All') list = list.filter(c => c.sector === activeSector);
    if (companyQuery.trim()) {
      const needle = companyQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(needle) || c.ticker.toLowerCase().includes(needle));
    }
    return list;
  }, [companies, activeSector, companyQuery]);

  return (
    <div className="flex-1 bg-[#F8FAFC] dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">AMC &amp; Company Database</h1>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Layers size={16} /> Live from AMFI NAV feed &amp; curated NSE company roster
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full self-start sm:self-auto">
            <button
              onClick={() => setTab('amcs')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${tab === 'amcs' ? 'bg-white dark:bg-gray-700 text-primary dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'}`}
            >
              <Landmark size={16} /> AMCs
            </button>
            <button
              onClick={() => setTab('companies')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${tab === 'companies' ? 'bg-white dark:bg-gray-700 text-primary dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'}`}
            >
              <Building2 size={16} /> Companies
            </button>
          </div>
        </div>

        {/* ─── AMC Tab ─── */}
        {tab === 'amcs' && (
          <>
            <div className="relative mb-6 max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                value={amcQuery}
                onChange={(e) => setAmcQuery(e.target.value)}
                placeholder="Search AMCs…"
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            {amcsLoading && (
              <div className="flex items-center justify-center py-20 gap-3 text-gray-500 dark:text-gray-400">
                <Loader2 size={22} className="animate-spin" /> Loading AMFI registered AMCs…
              </div>
            )}

            {amcsError && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl border border-red-100 dark:border-red-500/20 font-medium">
                Error: {amcsError}
              </div>
            )}

            {!amcsLoading && !amcsError && (
              <>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">{filteredAmcs.length} of {amcs.length} AMFI-registered AMCs</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAmcs.map((amc) => (
                    <div key={amc.name} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                      <button
                        onClick={() => toggleAmc(amc.name)}
                        className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 shrink-0 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-primary dark:text-blue-400">
                            <Landmark size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 dark:text-gray-100 truncate">{amc.name}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">{amc.schemeCount} schemes</div>
                          </div>
                        </div>
                      </button>

                      {expandedAmc === amc.name && (
                        <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/60 dark:bg-gray-800/30">
                          {schemesLoading ? (
                            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 py-3">
                              <Loader2 size={14} className="animate-spin" /> Loading schemes…
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto">
                              {schemes.map(s => (
                                <div key={s.schemeCode} className="flex items-center justify-between gap-3 text-sm bg-white dark:bg-gray-900 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-800">
                                  <span className="text-gray-700 dark:text-gray-300 truncate">{s.name}</span>
                                  <span className="font-mono font-semibold text-gray-900 dark:text-gray-100 shrink-0">₹{s.nav.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ─── Companies Tab ─── */}
        {tab === 'companies' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  value={companyQuery}
                  onChange={(e) => setCompanyQuery(e.target.value)}
                  placeholder="Search companies or ticker…"
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {['All', ...sectors].map(s => (
                  <button
                    key={s}
                    onClick={() => setActiveSector(s)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeSector === s ? 'bg-primary text-white shadow-sm' : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:text-gray-800 dark:hover:text-gray-100'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {companiesLoading && (
              <div className="flex items-center justify-center py-20 gap-3 text-gray-500 dark:text-gray-400">
                <Loader2 size={22} className="animate-spin" /> Loading live company data…
              </div>
            )}

            {companiesError && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl border border-red-100 dark:border-red-500/20 font-medium">
                Error: {companiesError}
              </div>
            )}

            {!companiesLoading && !companiesError && (
              <>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">{filteredCompanies.length} companies</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCompanies.map((c) => {
                    const isPositive = parseFloat(c.changePercent) >= 0;
                    return (
                      <div
                        key={c.ticker}
                        className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">{c.name}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{c.ticker.replace('.NS', '')} · {c.sector}</div>
                          </div>
                          {c.changePercent != null && (
                            <div className={`p-1.5 rounded-lg shrink-0 ${isPositive ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            </div>
                          )}
                        </div>
                        {c.price != null ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100 font-mono">₹{c.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            <span className={`text-xs font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {isPositive ? '+' : ''}{c.changePercent}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">Price unavailable</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}
