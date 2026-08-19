import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BackToTop from './components/layout/BackToTop';
import Home from './pages/website/Home';
import StockProfile from './pages/website/StockProfile';
import MutualFundProfile from './pages/website/MutualFundProfile';
import Compare from './pages/website/Compare';
import Watchlist from './pages/website/Watchlist';
import News from './pages/website/News';
import Settings from './pages/website/Settings';
import Chat from './pages/website/Chat';
import Markets from './pages/website/Markets';
import WealthBucket from './pages/website/WealthBucket';
import AmcDatabase from './pages/website/AmcDatabase';
import Login from './pages/website/Login';
import Superadmin from './pages/admin/Superadmin';
import InvestorsStrategy from './pages/website/InvestorsStrategy';
import StrategyResults from './pages/website/StrategyResults';
import Checkout from './pages/website/Checkout';
import Calculators from './pages/website/Calculators';
import AIChatSidebar from './components/features/AIChatSidebar';
import AIPet from './components/features/AIPet';
import AIScreenShare from './components/features/AIScreenShare';
import { MarketProvider } from './context/MarketContext';
import JuniorApp from './junior/JuniorApp';

function Layout() {
  const loc = useLocation();
  const isLogin = loc.pathname === '/login';
  const isCheckout = loc.pathname === '/checkout';
  const isJunior = loc.pathname.startsWith('/junior');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isScreenShareOpen, setIsScreenShareOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  useEffect(() => {
    const handleOpenAIChat = () => setIsAIChatOpen(true);
    window.addEventListener('open-ai-chat', handleOpenAIChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenAIChat);
  }, []);

  const isSuperadminRoute = loc.pathname === '/superadmin';

  if (isJunior) {
    return <JuniorApp />;
  }

  if (isLogin || isSuperadminRoute || isCheckout) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/superadmin" element={<Superadmin />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    );
  }

  const isChat = loc.pathname === '/chat';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {!isChat && <Navbar onToggleAIChat={() => setIsAIChatOpen(true)} />}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home onOpenAIChat={() => setIsAIChatOpen(true)} />} />
          <Route path="/stock" element={<StockProfile />} />
          <Route path="/stock/:id" element={<StockProfile />} />
          <Route path="/fund" element={<MutualFundProfile />} />
          <Route path="/fund/:id" element={<MutualFundProfile />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/wealth" element={<WealthBucket />} />
          <Route path="/investors-strategy" element={<InvestorsStrategy />} />
          <Route path="/investors-strategy/:strategyId" element={<StrategyResults />} />
          <Route path="/amcs" element={<AmcDatabase />} />
          <Route path="/mutual-funds" element={<AmcDatabase />} />
          <Route path="/news" element={<News />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>

      {loc.pathname !== '/chat' && <Footer />}

      {/* Global Context-Aware AI Chat Sidebar */}
      <AIChatSidebar 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)} 
        onOpenVisualSearch={() => { setIsAIChatOpen(false); setIsScreenShareOpen(true); }}
      />

      {/* "Circle to Search"-style visual assistant — screenshots the page so the user can point at anything and ask */}
      <AIScreenShare isOpen={isScreenShareOpen} onClose={() => setIsScreenShareOpen(false)} />

      {/* Floating draggable AI pet — visible on every page, opens the Visual Screen Search assistant */}
      <AIPet onOpen={() => setIsScreenShareOpen(true)} hidden={isAIChatOpen || isScreenShareOpen || isChat} />

      <BackToTop />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MarketProvider>
        <Layout />
      </MarketProvider>
    </BrowserRouter>
  );
}

export default App;
