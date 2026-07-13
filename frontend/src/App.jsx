import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
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
import AIChatSidebar from './components/features/AIChatSidebar';

function Layout() {
  const loc = useLocation();
  const isHome = loc.pathname === '/';
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

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
          <Route path="/news" element={<News />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>

      {!isHome && loc.pathname !== '/chat' && <Footer />}

      {/* Global Context-Aware AI Chat Sidebar */}
      <AIChatSidebar isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
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
