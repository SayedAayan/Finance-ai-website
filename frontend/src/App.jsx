import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BackToTop from './components/layout/BackToTop';
import Home from './pages/Home';
import StockProfile from './pages/StockProfile';
import MutualFundProfile from './pages/MutualFundProfile';
import Compare from './pages/Compare';
import Watchlist from './pages/Watchlist';
import News from './pages/News';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import Markets from './pages/Markets';
import WealthBucket from './pages/WealthBucket';
import AmcDatabase from './pages/AmcDatabase';
import Login from './pages/Login';
import AIChatSidebar from './components/features/AIChatSidebar';

function Layout() {
  const loc = useLocation();
  const isLogin = loc.pathname === '/login';
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  useEffect(() => {
    const handleOpenAIChat = () => setIsAIChatOpen(true);
    window.addEventListener('open-ai-chat', handleOpenAIChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenAIChat);
  }, []);

  if (isLogin) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <Navbar onToggleAIChat={() => setIsAIChatOpen(true)} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home onOpenAIChat={() => setIsAIChatOpen(true)} />} />
          <Route path="/stock/:id" element={<StockProfile />} />
          <Route path="/fund/:id" element={<MutualFundProfile />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/wealth" element={<WealthBucket />} />
          <Route path="/amcs" element={<AmcDatabase />} />
          <Route path="/news" element={<News />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>

      {loc.pathname !== '/chat' && <Footer />}

      {/* Global Context-Aware AI Chat Sidebar */}
      <AIChatSidebar isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />

      <BackToTop />
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
