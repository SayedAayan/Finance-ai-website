import React, { createContext, useContext, useState, useEffect } from 'react';

const CmsContext = createContext();

export const defaultCmsConfig = {
  global: {
    siteLogo: '',
    siteName: 'StockBuzz',
    siteTagline: "Let's Build Wealth, Together.",
    favicon: '/favicon.png',
    primaryColor: '#7c3aed', // violet-600
    enableProSubscriptions: true,
    showBannerAds: false,
    adSlots: [] // { id, location, content }
  },
  navbar: {
    navItems: [
      { id: '1', label: 'Home', path: '/' },
      { id: '4', label: 'Pro Book', path: '/investors-strategy' },
      { id: '2', label: 'Compare', path: '/compare' },
      { id: '3', label: 'Watchlist', path: '/watchlist' },
      { id: '5', label: 'Others ▾', subItems: [
        { id: '5-6', label: 'News', path: '/news' },
        { id: '5-5', label: 'Calculators', path: '/calculators' },
        { id: '5-3', label: 'Stock Profile', path: '/stock' },
        { id: '5-4', label: 'Fund Profile', path: '/fund' },
        { id: '5-1', label: 'Markets Overview', path: '/markets' }
      ]}
    ],
    tickers: ['NIFTY 50', 'SENSEX', 'NIFTY BANK', 'USDINR=X'],
    askAiLabel: 'Ask AI',
    defaultCurrency: '₹ INR'
  },
  pages: {
    home: {
      hero: {
        icon: '',
        heading: 'What do you want to research?',
        subheading: 'Stockbuzz AI helps you analyze stocks, mutual funds, and market trends with real-time data and smart insights.',
        searchPlaceholder: 'Ask Stockbuzz AI about stocks, mutual funds, or finance...',
        promptChips: [
          { id: 'p1', label: 'What is P/E ratio?', icon: 'TrendingUp' },
          { id: 'p2', label: 'Tell me about Reliance', icon: 'Search' },
          { id: 'p3', label: 'HDFC Flexi Cap Fund', icon: 'PieChart' },
          { id: 'p4', label: 'Compare TCS vs Reliance', icon: 'Activity' }
        ]
      },
      features: {
        showMarketSnapshot: true,
        showTrendingStocks: true,
        showMarketMovers: true,
        showMarketPulse: true,
        showFeaturedNews: true
      },
      marketSnapshot: {
        title: 'Market Snapshot',
        metrics: ['NIFTY 50', 'SENSEX', 'NIFTY BANK', 'USDINR=X'],
        buttonLabel: 'View Markets',
        buttonLink: '/markets'
      },
      trending: {
        title: 'Trending Stocks',
        buttonLabel: 'View all',
        buttonLink: '/markets',
        stocks: ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'SBIN.NS']
      },
      marketMovers: {
        title: 'Market Movers',
        buttonLabel: 'View all',
        buttonLink: '/markets',
        tabs: ['Top Gainers', 'Top Losers']
      },
      marketPulse: {
        title: 'Market Pulse',
        buttonLabel: 'View all',
        buttonLink: '/news',
        news: [
          { id: 'n1', source: 'NSE', badge: 'Alert', headline: 'Market hits new all-time high', time: '10m ago', link: '#' }
        ]
      },
      topStory: {
        image: '',
        badge: "TODAY'S TOP STORY",
        source: 'The Times of India',
        headline: 'RBI leaves repo rate unchanged at 6.5%',
        summary: 'The Monetary Policy Committee voted to keep the policy repo rate unchanged, maintaining its focus on withdrawal of accommodation.',
        link: '/news'
      },
      stockCards: [
        { id: 's1', ticker: 'RELIANCE.NS', name: 'Reliance Industries', peLabel: 'P/E: 28.5' },
        { id: 's2', ticker: 'TCS.NS', name: 'Tata Consultancy Services', peLabel: 'P/E: 31.2' },
        { id: 's3', ticker: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', peLabel: 'P/E: 16.4' },
        { id: 's4', ticker: 'INFY.NS', name: 'Infosys Limited', peLabel: 'P/E: 24.8' }
      ]
    },
    chat: {
      title: 'AI Research Assistant',
      introText: 'Ask complex financial questions, compare assets, or analyze trends.',
      inputPlaceholder: 'Message Stockbuzz AI...',
      features: {
        allowFileUpload: true,
        allowVoiceInput: true,
        showLiveMarketData: true
      }
    },
    news: {
      title: 'Financial News Hub',
      introText: 'Latest updates from Indian and global markets.',
      featuredSources: ['Mint', 'The Economic Times', 'Moneycontrol'],
      features: {
        showGlobalNews: true,
        showMarketMovers: true,
        allowSearch: true
      }
    },
    markets: {
      title: 'Markets Overview',
      introText: 'Track indices, sectors, and top movers in real-time.',
      sectors: ['Nifty Bank', 'Nifty IT', 'Nifty Auto', 'Nifty Pharma', 'Nifty FMCG'],
      features: {
        showSectorPerformance: true,
        showTopGainers: true,
        showGlobalIndices: true
      }
    }
  },
  footer: {
    logo: '',
    tagline: 'Your intelligent companion for the Indian markets. We deliver objective insights, clear comparisons, and deep research to empower your financial decisions.',
    columns: [
      { id: 'c1', title: 'Features', links: [ { id: 'l1', label: 'Markets Overview', path: '/markets' }, { id: 'l2', label: 'Stock Profiles', path: '/stock' }, { id: 'l3', label: 'Fund Profiles', path: '/fund' }, { id: 'l4', label: 'AMC Database', path: '/amcs' } ] },
      { id: 'c2', title: 'Tools & Resources', links: [ { id: 'l5', label: 'Compare Assets', path: '/compare' }, { id: 'l6', label: 'Watchlist', path: '/watchlist' }, { id: 'l7', label: 'Wealth Bucket', path: '/wealth' }, { id: 'l8', label: 'Market News', path: '/news' } ] },
      { id: 'c3', title: 'Company', links: [ { id: 'l9', label: 'About Us', path: '#' }, { id: 'l10', label: 'Compliance Center', path: '#' }, { id: 'l11', label: 'Privacy Policy', path: '#' }, { id: 'l12', label: 'Terms of Use', path: '#' } ] }
    ],
    disclaimerTitle: 'IMPORTANT DISCLAIMER',
    disclaimerText: 'StockBuzz is a technology platform, not a registered investment advisor. All information is provided for educational purposes only. Do not make investment decisions based solely on this platform. Data is provided "as is" and may be delayed.',
    copyright: '© 2026 StockBuzz Technologies Pvt. Ltd. All rights reserved. Data sourced from NSE, BSE, AMFI, and public regulatory filings.'
  },
  pricing: {
    plans: [
      {
        id: 'plan_free',
        name: 'Basic',
        price: '0',
        billingCycle: 'Monthly',
        features: ['Basic stock quotes', 'Limited AI chats per day', 'End-of-day news'],
        buttonLabel: 'Current Plan'
      },
      {
        id: 'plan_pro',
        name: 'Pro',
        price: '499',
        billingCycle: 'Monthly',
        features: ['Real-time NSE/BSE data', 'Unlimited AI chats', 'Advanced charting', 'Priority support'],
        buttonLabel: 'Upgrade to Pro'
      },
      {
        id: 'plan_ultra_pro',
        name: 'Ultra Pro',
        price: '999',
        billingCycle: 'Monthly',
        features: ['Real-time NSE/BSE data', 'Unlimited AI chats', 'Advanced charting', 'Priority support', '1-on-1 advisor calls', 'Direct API access'],
        buttonLabel: 'Upgrade to Ultra Pro'
      }
    ]
  }
};

export const CmsProvider = ({ children }) => {
  const [cmsConfig, setCmsConfig] = useState(defaultCmsConfig);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCms = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/cms');
      if (res.ok) {
        const data = await res.json();
        // Merge fetched data with defaults to ensure missing fields exist
        setCmsConfig((prev) => deepMerge(prev, data));
      }
    } catch (err) {
      console.error('Failed to fetch CMS config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCms();
  }, []);

  return (
    <CmsContext.Provider value={{ cmsConfig, setCmsConfig, isLoading, refreshCms: fetchCms }}>
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => useContext(CmsContext);

// Utility to deep merge objects so we don't lose default schema keys
function deepMerge(target, source) {
  if (typeof target !== 'object' || target === null) return source;
  if (typeof source !== 'object' || source === null) return target;
  
  if (Array.isArray(target) && Array.isArray(source)) {
    return source; // overwrite arrays completely rather than merging by index
  }

  const output = { ...target };
  Object.keys(source).forEach(key => {
    if (source[key] !== undefined) {
      if (typeof source[key] === 'object' && source[key] !== null) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    }
  });
  return output;
}
