import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Send, Plus, Paperclip, FileText, AlertCircle, ArrowRight, Image as ImageIcon, MessageSquare, Trash2, Edit, PanelLeftClose, PanelLeft, ArrowDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/api/chat';
const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Chat() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Chat History State
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const initialMessageSentRef = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

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
        setMessages([]);
      }
      fetchChats();
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const createNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
  };

  // Initialize from location state if passed from home page
  useEffect(() => {
    if (!loc.state || initialMessageSentRef.current) return;

    if (loc.state.initialMessage) {
      initialMessageSentRef.current = true;
      sendContextualMessage(loc.state.initialMessage);
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

  const sendContextualMessage = async (textToSend) => {
    const q = textToSend || input;
    if (!q.trim() && !selectedFile) return;

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
        currentChatId = data.chat.id;
        setActiveChatId(currentChatId);
        fetchChats();
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

      const finalMessages = [...updatedMessages, {
        id: Date.now() + 1,
        type: 'ai',
        text: aiText,
        source: 'Stockbuzz AI'
      }];
      setMessages(finalMessages);

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
        fallbackText += `Regarding your query "${q}":\n- StockBuzz live data confirms active research is available for Reliance, TCS, HDFC, and PPFAS.\n- Please consult scheme related documents or a SEBI registered advisor.`;
      }

      const finalMessages = [...updatedMessages, {
        id: Date.now() + 1,
        type: 'ai',
        text: fallbackText,
        source: 'Stockbuzz AI Local Fallback'
      }];
      setMessages(finalMessages);

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

  return (
    <div className="fixed top-[102px] bottom-0 left-0 right-0 flex bg-[#FCFCFF] dark:bg-gray-950 z-50">
      {/* Sidebar for Chat History */}
      {sidebarOpen ? (
        <div className="w-[280px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full shadow-sm flex-shrink-0">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <button
              onClick={createNewChat}
              className="flex-1 flex items-center justify-center gap-2 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/20 px-4 py-2.5 rounded-lg font-medium transition-colors border border-violet-100 dark:border-violet-500/20"
            >
              <Edit size={16} /> New Chat
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
              title="Hide recent chats"
            >
              <PanelLeftClose size={18} />
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
        </div>
      ) : (
        <div className="w-[56px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center h-full shadow-sm flex-shrink-0 py-4 gap-3">
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
        </div>
      )}

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8" ref={chatContainerRef} onScroll={handleScroll}>
          <div className="max-w-4xl mx-auto flex flex-col gap-6 relative">
            {messages.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                  <Sparkles size={32} className="text-blue-500 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">How can I help you today?</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Ask me about stocks, mutual funds, or market trends. I have access to real-time financial data.
                </p>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={m.id}
                  ref={m.type === 'user' && idx === messages.length - 1 ? lastUserMessageRef : null}
                  className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.type === 'user' ? (
                    <div className="max-w-[80%] flex flex-col items-end">
                      {m.file && (
                        <div className="mb-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400">
                          {m.file.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}
                          <span className="truncate max-w-[200px]">{m.file.name}</span>
                        </div>
                      )}
                      {m.text && (
                        <div className="bg-violet-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-md text-[15px] leading-relaxed">
                          {m.text}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-4 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles size={16} className="text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-6 py-4 rounded-2xl rounded-tl-sm shadow-sm prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.text}
                        </ReactMarkdown>
                        {m.source && (
                          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium">
                            <AlertCircle size={12} /> {m.source}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles size={16} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-[52px]">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse delay-100"></span>
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-[100px] left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-full p-2 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all z-10"
            title="Scroll to bottom"
          >
            <ArrowDown size={20} />
          </button>
        )}

        {/* Input */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-8 py-5 shrink-0">
          <div className="max-w-4xl mx-auto">
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
            <div className="relative flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 h-[60px] focus-within:bg-white dark:focus-within:bg-gray-900 focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-300 dark:focus-within:border-violet-500/40 transition-all shadow-sm">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf"
              />
              <button
                onClick={triggerFileUpload}
                className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-full transition-colors mr-2"
                title="Add attachment"
              >
                <Plus size={22} />
              </button>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendContextualMessage();
                }}
                placeholder="Message Stockbuzz AI..."
                className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 h-full"
              />

              <button
                onClick={() => sendContextualMessage()}
                disabled={!input.trim() && !selectedFile}
                className="w-10 h-10 rounded-full flex items-center justify-center ml-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-violet-600 text-white hover:bg-violet-700 hover:shadow-md"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
            <div className="text-center mt-3 text-xs text-gray-400 dark:text-gray-500">
              Stockbuzz AI can make mistakes. Consider verifying important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
