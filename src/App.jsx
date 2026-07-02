import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import StockProfile from './pages/StockProfile';
import MutualFundProfile from './pages/MutualFundProfile';
import Compare from './pages/Compare';
import Watchlist from './pages/Watchlist';

function Layout() {
  const loc = useLocation();
  const isHome = loc.pathname === '/';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: isHome ? '100vh' : 'auto', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: isHome ? 'hidden' : 'visible' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stock/:id" element={<StockProfile />} />
          <Route path="/fund/:id" element={<MutualFundProfile />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/watchlist" element={<Watchlist />} />
        </Routes>
      </main>
      {!isHome && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
