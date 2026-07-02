import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Search, Bell, Sparkles, BookmarkPlus } from 'lucide-react';

export default function Navbar() {
  const loc = useLocation();
  const active = (p) => loc.pathname === p;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="nav-logo">
          <div className="logo-mark">
            <TrendingUp size={17} color="#fff" strokeWidth={2.5} />
          </div>
          StockBuzz
        </Link>

        <div className="nav-links">
          <Link to="/"          className={`nav-link ${active('/')          ? 'active' : ''}`}>Home</Link>
          <Link to="/compare"   className={`nav-link ${active('/compare')   ? 'active' : ''}`}>Compare</Link>
          <Link to="/watchlist" className={`nav-link ${active('/watchlist') ? 'active' : ''}`}>Watchlist</Link>
          <Link to="/"          className="nav-link">Markets</Link>
          <Link to="/"          className="nav-link">News</Link>
        </div>

        <div className="nav-right">
          <div className="nav-search">
            <Search size={14} color="var(--text-3)" />
            <input placeholder="Search stocks, funds…" />
          </div>
          <button className="btn btn-ghost btn-sm" style={{ borderRadius: 'var(--r-md)', padding: '7px 9px' }}>
            <Bell size={15} color="var(--text-2)" />
          </button>
          <button className="btn btn-violet btn-sm">
            <Sparkles size={13} /> Ask AI
          </button>
        </div>
      </div>
    </nav>
  );
}
