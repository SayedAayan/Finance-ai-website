import { Link } from 'react-router-dom';
import { TrendingUp, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <div className="logo-mark"><TrendingUp size={15} color="#fff" strokeWidth={2.5} /></div>
              <span className="footer-logo-text">StockBuzz</span>
            </div>
            <p className="footer-desc">AI-powered research for Indian retail investors. We explain, compare, and source every answer — never recommend.</p>
          </div>
          <div>
            <div className="footer-heading">Research</div>
            <Link to="/"          className="footer-link">Stocks</Link>
            <Link to="/"          className="footer-link">Mutual Funds</Link>
            <Link to="/compare"   className="footer-link">Compare</Link>
            <Link to="/watchlist" className="footer-link">Watchlist</Link>
          </div>
          <div>
            <div className="footer-heading">Learn</div>
            <a className="footer-link" href="#">What is P/E Ratio?</a>
            <a className="footer-link" href="#">Direct vs Regular Plans</a>
            <a className="footer-link" href="#">Understanding Risk</a>
            <a className="footer-link" href="#">Expense Ratio Explained</a>
          </div>
          <div>
            <div className="footer-heading">Company</div>
            <a className="footer-link" href="#">About</a>
            <a className="footer-link" href="#">Compliance Center</a>
            <a className="footer-link" href="#">Privacy Policy</a>
            <a className="footer-link" href="#">Terms of Use</a>
          </div>
        </div>

        <div className="footer-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Shield size={13} color="rgba(255,255,255,0.35)" />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Important Disclaimer</span>
          </div>
          <p className="footer-disclaimer">
            StockBuzz is a research and education platform — not a SEBI-registered investment advisor. All content is for informational and educational purposes only. We do not provide personalized investment advice, buy/sell/hold recommendations, or guarantee any returns. Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully. Past performance is not indicative of future returns.
          </p>
          <p className="footer-disclaimer" style={{ marginTop: '10px' }}>
            © 2026 StockBuzz Technologies Pvt. Ltd. All rights reserved. Data sourced from NSE, BSE, AMFI, and public regulatory filings.
          </p>
        </div>
      </div>
    </footer>
  );
}
