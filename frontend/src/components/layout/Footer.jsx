import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useCms } from '../../context/CmsContext';

export default function Footer() {
  const { cmsConfig } = useCms();
  const footerConfig = cmsConfig?.footer || {};
  const globalConfig = cmsConfig?.global || {};

  const footerLogo = footerConfig.logo || globalConfig.siteLogo || logo;
  const tagline = footerConfig.tagline || 'AI-powered research for Indian retail investors. We explain, compare, and source every answer — never recommend.';
  const disclaimerTitle = footerConfig.disclaimerTitle || 'IMPORTANT DISCLAIMER';
  const disclaimerText = footerConfig.disclaimerText || 'STOCKBUZZ™ is a technology software and analytical research tool. It is not a SEBI-registered Investment Adviser (RIA), Research Analyst (RA), or Brokerage. The platform does not provide buy/sell recommendations, price targets, or personalized financial advice. All analysis is generated algorithmically for educational and information-processing purposes only.';
  const copyright = footerConfig.copyright || '© 2026 StockBuzz Technologies Pvt. Ltd. All rights reserved. Data sourced from NSE, BSE, AMFI, and public regulatory filings.';

  const columns = footerConfig.columns || [
    { id: 'c1', title: 'Research', links: [{ id: 'l1', label: 'Stocks', path: '/' }, { id: 'l2', label: 'Mutual Funds', path: '/' }, { id: 'l3', label: 'Compare', path: '/compare' }, { id: 'l4', label: 'Watchlist', path: '/watchlist' }] },
    { id: 'c2', title: 'Learn', links: [{ id: 'l5', label: 'What is P/E Ratio?', path: '#' }, { id: 'l6', label: 'Direct vs Regular Plans', path: '#' }, { id: 'l7', label: 'Understanding Risk', path: '#' }, { id: 'l8', label: 'Expense Ratio Explained', path: '#' }] },
    { id: 'c3', title: 'Company', links: [{ id: 'l9', label: 'About', path: '#' }, { id: 'l10', label: 'Compliance Center', path: '#' }, { id: 'l11', label: 'Privacy Policy', path: '#' }, { id: 'l12', label: 'Terms of Use', path: '#' }] }
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <img src={footerLogo} alt="StockBuzz" style={{ width: '220px', height: 'auto', objectFit: 'contain', margin: '-60px 0 -60px -15px' }} />
            </div>
            <p className="footer-desc">{tagline}</p>
          </div>

          {columns.map(col => (
            <div key={col.id}>
              <div className="footer-heading">{col.title}</div>
              {col.links.map(link => (
                link.path.startsWith('/')
                  ? <Link key={link.id} to={link.path} className="footer-link">{link.label}</Link>
                  : <a key={link.id} href={link.path} className="footer-link">{link.label}</a>
              ))}
            </div>
          ))}

        </div>

        <div className="footer-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Shield size={13} color="rgba(255,255,255,0.35)" />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{disclaimerTitle}</span>
          </div>
          <p className="footer-disclaimer">
            {disclaimerText}
          </p>
          <p className="footer-disclaimer" style={{ marginTop: '10px' }}>
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
