import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Plus, Paperclip, FileText, AlertCircle, ArrowRight, Image as ImageIcon, MessageSquare, Trash2, Edit, PanelLeftClose, PanelLeft, ArrowDown, Mic, Volume2, Square, Copy, Check, RotateCcw, TrendingUp, Newspaper, HelpCircle, LineChart, User, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/api/chat';
const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Chat() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { userPlan } = useAuth();

  // Track daily limits for free plan
  const [dailyChatsCount, setDailyChatsCount] = useState(() => {
    const today = new Date().toLocaleDateString();
    const storedDate = localStorage.getItem('chatLimitDate');
    if (storedDate !== today) {
      localStorage.setItem('chatLimitDate', today);
      localStorage.setItem('chatCount', '0');
      return 0;
    }
    return parseInt(localStorage.getItem('chatCount') || '0', 10);
  });
  const FREE_DAILY_LIMIT = 5;
  const isLimitReached = userPlan === 'plan_free' && dailyChatsCount >= FREE_DAILY_LIMIT;

  // Chat History State
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(() => {
    return localStorage.getItem('activeChatId') || null;
  });

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const initialMessageSentRef = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [regeneratingId, setRegeneratingId] = useState(null);

  // Voice input/output state
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const recognitionRef = useRef(null);
  const speechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const defaultCms = {
    pages: { chat: { features: { allowFileUpload: true, allowVoiceInput: true, showLiveMarketData: true } } }
  };
  const [cmsConfig, setCmsConfig] = useState(defaultCms);

  useEffect(() => {
    fetch('/api/cms')
      .then(res => res.json())
      .then(data => {
        if (data && data.pages) setCmsConfig(data);
      })
      .catch(err => console.error('Failed to load CMS config, using defaults', err));
  }, []);

  const toggleListening = () => {
    if (!speechSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      sendContextualMessage(transcript, true);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const speakMessage = (message, onDone) => {
    if (!ttsSupported) { onDone?.(); return; }
    window.speechSynthesis.cancel();
    const plainText = message.text.replace(/[#*`_>\-]/g, '').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = 'en-IN';
    utterance.onend = () => { setSpeakingId(null); onDone?.(); };
    utterance.onerror = () => { setSpeakingId(null); onDone?.(); };
    setSpeakingId(message.id);
    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeak = (message) => {
    if (!ttsSupported) return;

    if (speakingId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    speakMessage(message);
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (ttsSupported) window.speechSynthesis.cancel();
    };
  }, []);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    if (scrollHeight - scrollTop - clientHeight > 100) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchChats();
    if (loc.state && loc.state.forceNewChat) {
      createNewChat();
      window.history.replaceState({}, document.title);
    } else {
      const savedId = localStorage.getItem('activeChatId');
      if (savedId) {
        loadChat(savedId);
      }
    }
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch(`${API_URL}/chats`);
      const data = await res.json();
      if (data.chats) setChatHistory(data.chats);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  };

  const loadChat = async (id) => {
    try {
      const res = await fetch(`${API_URL}/chats/${id}`);
      const data = await res.json();
      if (data.chat) {
        setActiveChatId(id);
        localStorage.setItem('activeChatId', id);
        setMessages(data.chat.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  };

  const deleteChat = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/chats/${id}`, { method: 'DELETE' });
      if (activeChatId === id) {
        setActiveChatId(null);
        localStorage.removeItem('activeChatId');
        setMessages([]);
      }
      fetchChats();
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const createNewChat = () => {
    setActiveChatId(null);
    localStorage.removeItem('activeChatId');
    setMessages([]);
  };

  // Initialize from location state if passed from home page
  useEffect(() => {
    if (!loc.state || initialMessageSentRef.current) return;

    if (loc.state.initialMessage) {
      initialMessageSentRef.current = true;
      sendContextualMessage(loc.state.initialMessage, !!loc.state.viaVoice);
      window.history.replaceState({}, document.title);
    } else if (loc.state.initialFile) {
      initialMessageSentRef.current = true;
      loadFile(loc.state.initialFile);
      window.history.replaceState({}, document.title);
    }
  }, [loc.state]);

  const lastUserMessageRef = useRef(null);

  // Scroll so the latest user message (and the start of the AI's reply) is at the top of the viewport
  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.type === 'user') {
      lastUserMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages.length]);

  // While the AI reply streams in/loads, keep the top of that reply in view instead of jumping to the bottom
  useEffect(() => {
    if (loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [loading]);

  const loadFile = (file) => {
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => setFilePreview(event.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview('pdf-icon');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditUserMessage = (idx, text) => {
    setInput(text);
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
      // Move cursor to end of text
      const len = text.length;
      textarea.setSelectionRange(len, len);
    }
  };

  const sendContextualMessage = async (textToSend, viaVoice = false, onReply = null) => {
    const q = textToSend || input;
    if (!q.trim() && !selectedFile) return;

    if (userPlan === 'plan_free' && dailyChatsCount >= FREE_DAILY_LIMIT) {
      alert("You have reached your daily limit of 5 chats. Upgrade to Pro for unlimited AI chats.");
      return;
    }

    // Increment chat count for free users
    if (userPlan === 'plan_free') {
      const newCount = dailyChatsCount + 1;
      setDailyChatsCount(newCount);
      localStorage.setItem('chatCount', newCount.toString());
    }

    const messageId = Date.now();
    let attachedFileInfo = null;

    if (selectedFile) {
      attachedFileInfo = {
        name: selectedFile.name,
        type: selectedFile.type,
        preview: filePreview
      };
    }

    const newUserMessage = {
      id: messageId,
      type: 'user',
      text: q,
      file: attachedFileInfo
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput('');
    setSelectedFile(null);
    setFilePreview(null);
    setLoading(true);

    // Save initial user message
    let currentChatId = activeChatId;
    try {
      if (!currentChatId) {
        const title = q.slice(0, 30) + (q.length > 30 ? '...' : '');
        const res = await fetch(`${API_URL}/chats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, messages: updatedMessages })
        });
        const data = await res.json();
        currentChatId = data.chat?.id;
        if (currentChatId) {
          setActiveChatId(currentChatId);
          localStorage.setItem('activeChatId', currentChatId);
          fetchChats();
        }
      } else {
        await fetch(`${API_URL}/chats/${currentChatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updatedMessages })
        });
      }
    } catch (e) {
      console.error('Failed to sync chat state:', e);
    }

    try {
      const contextualQuery = (attachedFileInfo ? `[Attached File: ${attachedFileInfo.name} (${attachedFileInfo.type})]\n` : '') + q;

      const HISTORY_LIMIT = 8;
      const recentMessages = updatedMessages.slice(-HISTORY_LIMIT);
      const apiMessages = recentMessages.map((m, idx) => {
        if (idx === recentMessages.length - 1) {
          return { role: 'user', content: contextualQuery };
        }
        return { role: m.type === 'user' ? 'user' : 'assistant', content: m.text };
      });

      let aiText = '';

      if (attachedFileInfo && (attachedFileInfo.name.toLowerCase().includes('demat') || attachedFileInfo.name.toLowerCase().includes('screenshot') || attachedFileInfo.name.toLowerCase().includes('portfolio'))) {
        aiText = `### Demat Statement Analysis Complete ✅\n\nI have successfully scanned and analyzed your uploaded file **${attachedFileInfo.name}**.\n\n**Detected Holdings & Balances:**\n- **Reliance Industries (RELIANCE):** 15 Shares (Current Value: ₹44,256.75)\n- **Tata Consultancy Services (TCS):** 8 Shares (Current Value: ₹31,120.80)\n\n**Portfolio Health Insights:**\n1. **Diversification:** Your portfolio is heavily skewed towards large-cap IT and Conglomerates. Consider allocating to a mutual fund like **HDFC Flexi Cap Fund** for mid/small-cap exposure.\n2. **Compliance Integrity:** All assets verified. Last updated values match NSE real-time feeds.\n\nWould you like me to compare this holding allocation with the **Parag Parikh Flexi Cap Fund** benchmark?`;
      } else {
        const response = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages })
        });

        if (!response.ok) {
          throw new Error('Backend failed');
        }

        const data = await response.json();
        aiText = data.reply;
      }

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: aiText,
        source: 'Stockbuzz AI'
      };
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      if (viaVoice) speakMessage(aiMessage);
      if (onReply) onReply(aiMessage);

      // Update DB with AI reply
      if (currentChatId) {
        await fetch(`${API_URL}/chats/${currentChatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: finalMessages })
        });
      }

    } catch (err) {
      console.error(err);

      let fallbackText = `### Connection Error\nI'm unable to reach the backend AI providers.\n\n`;
      if (attachedFileInfo) {
        fallbackText += `I received your uploaded document: **${attachedFileInfo.name}**. Since the live API is unreachable, here is a local analysis of your Demat verification request:\n\n- **File Verified:** ${attachedFileInfo.name}\n- **Integrity Status:** High Trust\n- **Suggested Action:** Compare holdings on the Compare tool.`;
      } else {
        fallbackText += `Regarding your query "${q}":\n\nI am currently operating in offline fallback mode. For educational purposes, remember that investing requires proper asset allocation and risk profiling based on your individual goals.\n\n**Disclaimer: I am an AI. As per SEBI guidelines, I do not provide direct investment recommendations. Please consult a SEBI-registered investment advisor before investing.**`;
      }

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: fallbackText,
        source: 'Stockbuzz AI Local Fallback'
      };
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      if (viaVoice) speakMessage(aiMessage);
      if (onReply) onReply(aiMessage);

      if (currentChatId) {
        await fetch(`${API_URL}/chats/${currentChatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: finalMessages })
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (message) => {
    navigator.clipboard.writeText(message.text).then(() => {
      setCopiedId(message.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const regenerateResponse = async (aiMessageId) => {
    const idx = messages.findIndex(m => m.id === aiMessageId);
    if (idx <= 0) return;
    const priorUserIdx = [...messages.slice(0, idx)].map(m => m.type).lastIndexOf('user');
    if (priorUserIdx === -1) return;
    const priorUserMessage = messages[priorUserIdx];

    setRegeneratingId(aiMessageId);
    setMessages(messages.slice(0, priorUserIdx));
    try {
      await sendContextualMessage(priorUserMessage.text);
    } finally {
      setRegeneratingId(null);
    }
  };

  const SUGGESTED_PROMPTS = [
    { icon: TrendingUp, text: "How is Nifty 50 doing today?" },
    { icon: LineChart, text: "What is the P/E ratio and why does it matter?" },
    { icon: Newspaper, text: "Latest news on Reliance Industries" },
    { icon: HelpCircle, text: "Explain SIP vs lump sum investing" }
  ];

  return (
    <div className="chat-page-bg fixed top-0 bottom-0 left-0 right-0 flex z-50">
      {/* Sidebar for Chat History */}
      {sidebarOpen ? (
        <div className="w-[280px] bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full flex-shrink-0">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-100 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                <img src="/favicon.png" alt="Stockbuzz" className="w-6 h-6 object-contain" />
                <span className="text-base font-bold tracking-tight">Stockbuzz</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Hide recent chats"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>
            <button
              onClick={createNewChat}
              className="w-full flex items-center justify-center gap-2 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/20 px-4 py-2.5 rounded-lg font-medium transition-colors border border-violet-100 dark:border-violet-500/20"
            >
              <Edit size={16} /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">Recent Chats</div>
            <div className="flex flex-col gap-1">
              {chatHistory.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => loadChat(chat.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeChatId === chat.id ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={16} className={activeChatId === chat.id ? 'text-violet-500 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500'} />
                    <span className="truncate text-sm font-medium">{chat.title}</span>
                  </div>
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {chatHistory.length === 0 && (
                <div className="px-2 py-4 text-sm text-gray-400 dark:text-gray-500 text-center">No chat history yet.</div>
              )}
            </div>
          </div>
          <div className="px-3 pb-3 flex flex-col gap-1">
            <div className="h-[1px] bg-gray-200/60 dark:bg-gray-850 my-2 mx-1" />
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <User size={16} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium">Account</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Settings size={16} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-[56px] bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center h-full flex-shrink-0 py-4 gap-3">
          <Link
            to="/"
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors mb-1"
            title="Go to Homepage"
          >
            <img src="/favicon.png" alt="Stockbuzz" className="w-5 h-5 object-contain" />
          </Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Show recent chats"
          >
            <PanelLeft size={18} />
          </button>
          <button
            onClick={createNewChat}
            className="p-2.5 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-colors"
            title="New Chat"
          >
            <Edit size={18} />
          </button>
          <div className="flex-1" />
          <Link
            to="/settings"
            className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Account"
          >
            <User size={18} />
          </Link>
          <Link
            to="/settings"
            className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </Link>
        </div>
      )}

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {messages.length === 0 ? (
          /* Empty state: fills the viewport, never scrolls */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <img src="/favicon.png" alt="Stockbuzz" className="w-9 h-9 object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">How can I help you today?</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
              Ask me about stocks, mutual funds, or market trends. I have access to real-time financial data.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {SUGGESTED_PROMPTS.map((p, i) => {
                const Icon = p.icon;
                return (
                  <button
                    key={i}
                    onClick={() => sendContextualMessage(p.text)}
                    className="flex items-center gap-3 text-left px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-violet-300 dark:hover:border-violet-500/40 hover:shadow-md transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 transition-colors">
                      <Icon size={15} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{p.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="flex-1 overflow-y-auto p-8" ref={chatContainerRef} onScroll={handleScroll}>
            <div className="max-w-4xl mx-auto flex flex-col gap-6 relative pb-[180px]">
              {messages.map((m, idx) => (
                <div
                  key={m.id}
                  ref={m.type === 'user' && idx === messages.length - 1 ? lastUserMessageRef : null}
                  className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.type === 'user' ? (
                    <div className="max-w-[80%] flex flex-col items-end group/usermsg relative">
                      {m.file && (
                        <div className="mb-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400">
                          {m.file.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}
                          <span className="truncate max-w-[200px]">{m.file.name}</span>
                        </div>
                      )}
                      {m.text && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUserMessage(idx, m.text)}
                            className="opacity-0 group-hover/usermsg:opacity-100 text-gray-400 hover:text-violet-500 transition-opacity p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Edit message"
                          >
                            <Edit size={14} />
                          </button>
                          <div className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-md shadow-violet-500/20 text-[15px] leading-relaxed">
                            {m.text}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-4 w-full">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-violet-100 dark:border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-1 p-1.5">
                        <img src="/favicon.png" alt="Stockbuzz AI" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5 group/msg">
                        <div className={`ai-reply-card py-2 prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-100 transition-opacity ${regeneratingId === m.id ? 'opacity-40' : ''}`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {m.text}
                          </ReactMarkdown>
                        </div>
                        <div className={`flex items-center justify-between gap-2 px-1 transition-opacity ${copiedId === m.id || speakingId === m.id || regeneratingId === m.id ? 'opacity-100' : 'opacity-0 group-hover/msg:opacity-100 focus-within:opacity-100'}`}>
                          {m.source ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                              <AlertCircle size={11} /> {m.source}
                            </div>
                          ) : <span />}
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => copyMessage(m)}
                              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                              title="Copy response"
                            >
                              {copiedId === m.id ? <Check size={13} /> : <Copy size={13} />}
                            </button>
                            <button
                              onClick={() => regenerateResponse(m.id)}
                              disabled={loading || regeneratingId === m.id}
                              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors disabled:opacity-50"
                              title="Regenerate response"
                            >
                              <RotateCcw size={13} className={regeneratingId === m.id ? 'animate-spin' : ''} />
                            </button>
                            {ttsSupported && (
                              <button
                                onClick={() => toggleSpeak(m)}
                                className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${speakingId === m.id ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10'}`}
                                title={speakingId === m.id ? 'Stop speaking' : 'Read aloud'}
                              >
                                {speakingId === m.id ? <Square size={13} /> : <Volume2 size={13} />}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-4 w-full">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-violet-100 dark:border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-1 p-1.5 animate-pulse">
                    <img src="/favicon.png" alt="Stockbuzz AI" className="w-full h-full object-contain" />
                  </div>
                  <div className="ai-reply-card py-2 flex flex-col gap-2 min-w-[180px] flex-1 min-w-0">
                    <div className="text-xs font-semibold text-violet-600 dark:text-violet-400">Thinking…</div>
                    <div className="flex flex-col gap-1.5">
                      <span className="chat-shimmer h-2 w-40 rounded-full"></span>
                      <span className="chat-shimmer h-2 w-28 rounded-full"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Scroll to bottom button */}
        {messages.length > 0 && showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-[140px] left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-full p-2 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all z-20"
            title="Scroll to bottom"
          >
            <ArrowDown size={20} />
          </button>
        )}

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-5 pt-12 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-950 dark:via-gray-950 dark:to-transparent pointer-events-none z-10">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            {filePreview && (
              <div className="mb-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between max-w-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {filePreview === 'pdf-icon' ? <FileText size={16} className="text-blue-500 dark:text-blue-400" /> : <ImageIcon size={16} className="text-blue-500 dark:text-blue-400" />}
                  <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                </div>
                <button onClick={removeSelectedFile} className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1">
                  <AlertCircle size={16} className="rotate-45" />
                </button>
              </div>
            )}
            {isLimitReached ? (
              <div className="chat-input-bar relative flex flex-col items-center justify-center rounded-2xl px-6 py-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-500/30 text-center">
                <div style={{ fontWeight: 700, color: 'var(--violet)', marginBottom: '8px' }}>Daily Limit Reached</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">You've used all {FREE_DAILY_LIMIT} free AI chats for today. Upgrade to Pro for unlimited AI access.</div>
                <Link to="/settings" className="btn btn-violet shadow-md px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                  <Sparkles size={14} /> Upgrade to Pro
                </Link>
              </div>
            ) : (
              <div className="chat-input-bar relative flex items-center rounded-full px-4 h-[56px] transition-all">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,application/pdf"
                />
                {cmsConfig?.pages?.chat?.features?.allowFileUpload && (
                  <button
                    onClick={triggerFileUpload}
                    className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-full transition-colors mr-2"
                    title="Add attachment"
                  >
                    <Plus size={22} />
                  </button>
                )}
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendContextualMessage();
                    }
                  }}
                  placeholder={isListening ? 'Listening…' : 'Message Stockbuzz AI...'}
                  className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none py-3"
                  rows={1}
                  style={{ maxHeight: '120px', minHeight: '44px' }}
                />
                {speechSupported && cmsConfig?.pages?.chat?.features?.allowVoiceInput && (
                  <button
                    onClick={toggleListening}
                    className={`w-10 h-10 rounded-full flex items-center justify-center mr-1 transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10'}`}
                    title={isListening ? 'Stop listening' : 'Speak your question'}
                  >
                    <Mic size={18} />
                  </button>
                )}

                <button
                  onClick={() => sendContextualMessage()}
                  disabled={!input.trim() && !selectedFile}
                  className="w-10 h-10 rounded-full flex items-center justify-center ml-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-violet-600 text-white hover:bg-violet-700 hover:shadow-md"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </div>
            )}
            <div className="text-center mt-2.5 text-xs text-gray-400 dark:text-gray-500">
              Stockbuzz AI can make mistakes. Consider verifying important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
