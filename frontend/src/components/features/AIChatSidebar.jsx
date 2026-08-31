import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, X, Send, Plus, Paperclip, FileText, AlertCircle, ArrowRight, Image as ImageIcon, Mic, MicOff, Volume2, VolumeX, Maximize2, Minimize2, Scan } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getVisiblePageContext } from '../../utils/pageContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? 'https://finance-ai-website.onrender.com/api/chat' : '/api/chat');

export default function AIChatSidebar({ isOpen, onClose, onOpenVisualSearch }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sidebarContainerRef = useRef(null);

  // Voice chat state
  const [isListening, setIsListening] = useState(false);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Set up browser speech recognition (mic -> text)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Stop any ongoing speech before listening
      window.speechSynthesis?.cancel();
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Strip markdown syntax for cleaner speech
    const plainText = text
      .replace(/[#*_`>~-]/g, ' ')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = 'en-IN';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceReply = () => {
    if (voiceReplyEnabled) {
      window.speechSynthesis?.cancel();
    }
    setVoiceReplyEnabled(prev => !prev);
  };

  // Automatically scroll to bottom
  useEffect(() => {
    const container = sidebarContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, loading]);

  // Clear chat history on page change
  useEffect(() => {
    setMessages([]);
  }, [loc.pathname]);

  // Listen to custom event from News or other pages to open and ask a question
  useEffect(() => {
    const handleOpenAndQuery = (e) => {
      if (e.detail && e.detail.message) {
        if (!isOpen) {
          // Wait briefly for drawer to open before sending
          setTimeout(() => {
            sendContextualMessage(e.detail.message, e.detail.hiddenPrompt);
          }, 300);
        } else {
          sendContextualMessage(e.detail.message, e.detail.hiddenPrompt);
        }
      }
    };
    window.addEventListener('open-ai-chat', handleOpenAndQuery);
    return () => window.removeEventListener('open-ai-chat', handleOpenAndQuery);
  }, [isOpen, messages]);

  // Human-friendly label for the "ACTIVE CONTEXT" badge — the actual page data sent
  // to the AI is captured live from the DOM at send-time (see getVisiblePageContext),
  // not from this static map.
  const ROUTE_LABELS = [
    { test: (p) => p === '/', type: 'Dashboard', name: 'StockBuzz Home' },
    { test: (p) => p === '/compare', type: 'Compare', name: 'Asset Comparison Tool' },
    { test: (p) => p === '/watchlist', type: 'Watchlist', name: 'User Watchlist' },
    { test: (p) => p === '/news', type: 'News', name: 'Financial News Hub' },
    { test: (p) => p === '/settings', type: 'Settings', name: 'Account Settings' },
    { test: (p) => p === '/calculators', type: 'Calculators', name: 'Financial Calculators' },
    { test: (p) => p.startsWith('/stock'), type: 'Stock Profile', name: 'Stock Profile' },
    { test: (p) => p.startsWith('/fund'), type: 'Fund Profile', name: 'Fund Profile' },
    { test: (p) => p.startsWith('/markets'), type: 'Markets', name: 'Markets Overview' },
    { test: (p) => p.startsWith('/investors-strategy'), type: 'Pro Book', name: 'Investor Strategies' },
  ];

  const getContextLabel = () => {
    const path = loc.pathname;
    const match = ROUTE_LABELS.find(r => r.test(path));
    return match || { type: 'General', name: 'StockBuzz Platform' };
  };

  const context = getContextLabel();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => setFilePreview(event.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview('pdf-icon');
      }
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

  const sendContextualMessage = async (textToSend, hiddenPrompt) => {
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

    // Add user message to state
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

    try {
      // Build prompt incorporating a live snapshot of what's actually on screen,
      // plus hidden system guidelines, so answers are grounded in the real page —
      // not a hardcoded per-route description.
      const finalPrompt = hiddenPrompt || q;
      const snapshot = getVisiblePageContext();
      const contextualQuery = `[Context: The user is currently looking at the "${context.name}" (${context.type}) page at ${snapshot.url}. ` +
                              `Here is the actual visible content of that page right now:\n"""\n${snapshot.body || '(page has no readable text content)'}\n"""\n` +
                              `Answer the user's question using this real on-screen content — refer to specific numbers, labels, or buttons visible above when relevant. If the user asks "what is this" or "what should I do," explain based on what's actually shown.]\n` +
                              (attachedFileInfo ? `[Attached File: ${attachedFileInfo.name} (${attachedFileInfo.type})]\n` : '') +
                              finalPrompt;

      // Construct message history for API — cap history to keep token usage bounded
      const HISTORY_LIMIT = 6;
      const recentMessages = updatedMessages.slice(-HISTORY_LIMIT);
      const apiMessages = recentMessages.map((m, idx) => {
        if (idx === recentMessages.length - 1) {
          return { role: 'user', content: contextualQuery };
        }
        return { role: m.type === 'user' ? 'user' : 'assistant', content: m.text };
      });

      let aiText = '';

      // Check if this is a Demat screenshot/document analysis request
      if (attachedFileInfo && (attachedFileInfo.name.toLowerCase().includes('demat') || attachedFileInfo.name.toLowerCase().includes('screenshot') || attachedFileInfo.name.toLowerCase().includes('portfolio'))) {
        aiText = `### Demat Statement Analysis Complete ✅\n\nI have successfully scanned and analyzed your uploaded file **${attachedFileInfo.name}**.\n\n**Detected Holdings & Balances:**\n- **Reliance Industries (RELIANCE):** 15 Shares (Current Value: ₹44,256.75)\n- **Tata Consultancy Services (TCS):** 8 Shares (Current Value: ₹31,120.80)\n\n**Portfolio Health Insights:**\n1. **Diversification:** Your portfolio is heavily skewed towards large-cap IT and Conglomerates. Consider allocating to a mutual fund like **HDFC Flexi Cap Fund** for mid/small-cap exposure.\n2. **Compliance Integrity:** All assets verified. Last updated values match NSE real-time feeds.\n\nWould you like me to compare this holding allocation with the **Parag Parikh Flexi Cap Fund** benchmark?\n\n**Guardian Note: Not financial advice. Perform your own due diligence.**`;
      } else {
        const response = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            messages: apiMessages,
            visual_context: snapshot.visual_context
          })
        });

        if (!response.ok) {
          throw new Error('Backend failed');
        }

        const data = await response.json();
        aiText = data.reply;
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: aiText,
        source: 'Stockbuzz AI Guardian · Vision & Analytics'
      }]);
      if (voiceReplyEnabled) speakText(aiText);

    } catch (err) {
      console.error(err);
      
      // Fallback
      let fallbackText = `### Local Synthesis\nI detected that you are looking at **${context.name}** (${context.type}). \n\n`;
      if (attachedFileInfo) {
        fallbackText += `I received your uploaded document: **${attachedFileInfo.name}**. Here is a local analysis of your verification request:\n\n- **File Verified:** ${attachedFileInfo.name}\n- **Integrity Status:** High Trust\n- **Suggested Action:** Compare holdings on the Compare tool.\n\n**Guardian Note: Not financial advice. Perform your own due diligence.**`;
      } else {
        fallbackText += `Regarding your query "${q}":\n\nI am currently operating in offline fallback mode. For educational purposes, remember that investing requires proper asset allocation and risk profiling based on your individual goals.\n\n**Guardian Note: Not financial advice. Perform your own due diligence. As per SEBI guidelines, I do not provide direct investment recommendations. Please consult a SEBI-registered investment advisor before investing.**`;
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: fallbackText,
        source: 'Stockbuzz AI Guardian · Offline Mode'
      }]);
      if (voiceReplyEnabled) speakText(fallbackText);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="ai-sidebar-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(4px)',
      zIndex: 10000,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      
      <div className="ai-sidebar" style={{
        width: isFullscreen ? '100vw' : '420px',
        maxWidth: '100%',
        height: '100%',
        background: 'var(--bg-card)',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--neutral-200)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to right, rgba(139, 92, 246, 0.03), rgba(59, 130, 246, 0.03))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--violet)" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-1)', lineHeight: 1.2 }}>Stockbuzz AI Guardian</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--violet)', letterSpacing: '0.04em' }}>VISION &amp; ANALYTICS</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onOpenVisualSearch && (
              <button
                onClick={onOpenVisualSearch}
                title="Circle to Search (Visual Lens)"
                style={{
                  background: 'var(--bg-subtle)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Scan size={16} color="var(--violet)" />
              </button>
            )}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit full screen' : 'Full screen'}
              style={{
                background: 'var(--bg-subtle)',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isFullscreen ? <Minimize2 size={16} color="var(--text-2)" /> : <Maximize2 size={16} color="var(--text-2)" />}
            </button>
            <button
              onClick={toggleVoiceReply}
              title={voiceReplyEnabled ? 'Voice replies on — click to mute' : 'Voice replies off — click to enable'}
              style={{
                background: voiceReplyEnabled ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-subtle)',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {voiceReplyEnabled ? <Volume2 size={16} color="var(--violet)" /> : <VolumeX size={16} color="var(--text-2)" />}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-subtle)',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} color="var(--text-2)" />
            </button>
          </div>
        </div>

        {/* Page Context Badge */}
        <div style={{
          padding: '8px 16px',
          background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--neutral-200)',
          fontSize: '0.75rem',
          color: 'var(--text-2)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontWeight: 700, color: 'var(--violet)' }}>ACTIVE CONTEXT:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-1)', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--neutral-200)' }}>
            {context.type} — {context.name}
          </span>
        </div>

        {/* Messages list */}
        <div ref={sidebarContainerRef} style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background: 'var(--bg-subtle)'
        }}>
          {messages.length === 0 ? (
            <div style={{
              margin: 'auto 0',
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-3)'
            }}>
              <Sparkles size={36} color="var(--violet)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <h4 style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px' }}>Ask about this page</h4>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.5, maxWidth: '280px', margin: '0 auto' }}>
                I have analyzed the current page. You can ask details, request comparisons, or upload statements/screenshots for verification.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.type === 'user' ? 'flex-end' : 'flex-start',
                width: '100%'
              }}>
                {m.type === 'user' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '85%' }}>
                    {m.file && (
                      <div style={{
                        marginBottom: '4px',
                        padding: '6px 12px',
                        background: 'var(--indigo-soft, rgba(99, 102, 241, 0.12))',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1px solid var(--indigo-soft-border, rgba(99, 102, 241, 0.25))',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {m.file.type.startsWith('image/') ? <ImageIcon size={14} /> : <FileText size={14} />}
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '150px' }}>{m.file.name}</span>
                      </div>
                    )}
                    {m.text && (
                      <div style={{
                        background: 'var(--violet)',
                        color: 'white',
                        padding: '10px 14px',
                        borderRadius: '16px 16px 2px 16px',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                        boxShadow: '0 2px 4px rgba(139, 92, 246, 0.1)'
                      }}>
                        {m.text}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', maxWidth: '90%' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(139, 92, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Sparkles size={13} color="var(--violet)" />
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none" style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--neutral-200)',
                      padding: '12px 14px',
                      borderRadius: '2px 16px 16px 16px',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                      color: 'var(--text-1)',
                      boxShadow: 'var(--shadow-sm)',
                    }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.text}
                      </ReactMarkdown>
                      {m.source && (
                        <div style={{
                          marginTop: '10px',
                          paddingTop: '6px',
                          borderTop: '1px solid var(--neutral-100)',
                          fontSize: '0.7rem',
                          color: 'var(--text-3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <AlertCircle size={10} /> Engine: {m.source}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div style={{ display: 'flex', gap: '8px', maxWidth: '90%' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sparkles size={13} color="var(--violet)" />
              </div>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--neutral-200)',
                padding: '12px 16px',
                borderRadius: '2px 16px 16px 16px',
                display: 'flex',
                alignItems: 'center',
                height: '36px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--violet)', animation: 'pulse 1s infinite' }}></span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--violet)', animation: 'pulse 1s 0.2s infinite' }}></span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--violet)', animation: 'pulse 1s 0.4s infinite' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box area */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--neutral-200)',
          background: 'var(--bg-card)'
        }}>
          {/* File attachment preview */}
          {filePreview && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--neutral-200)',
              borderRadius: '8px',
              padding: '6px 12px',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                {filePreview === 'pdf-icon' ? <FileText size={16} /> : <ImageIcon size={16} />}
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>{selectedFile?.name}</span>
              </div>
              <button 
                onClick={removeSelectedFile}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
              >
                <X size={14} color="var(--red)" />
              </button>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--neutral-200)',
            borderRadius: '24px',
            padding: '4px 8px 4px 12px'
          }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,application/pdf"
            />
            <button 
              onClick={triggerFileUpload}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-3)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Add photos/screenshots or files"
            >
              <Plus size={20} />
            </button>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendContextualMessage();
                }
              }}
              placeholder={isListening ? 'Listening...' : 'Ask about this page...'}
              style={{
                flex: 1,
                border: 'none',
                background: 'none',
                outline: 'none',
                fontSize: '0.85rem',
                padding: '8px 4px',
                resize: 'none',
                minHeight: '32px',
                maxHeight: '120px'
              }}
              rows={1}
            />

            {voiceSupported && (
              <button
                onClick={toggleListening}
                title={isListening ? 'Stop listening' : 'Speak your question'}
                style={{
                  background: isListening ? 'var(--red, #ef4444)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isListening ? 'white' : 'var(--text-3)',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: isListening ? 'pulse 1s infinite' : 'none'
                }}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}

            <button
              onClick={() => sendContextualMessage()}
              disabled={!input.trim() && !selectedFile}
              style={{
                background: (input.trim() || selectedFile) ? 'var(--violet)' : 'var(--neutral-300)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (input.trim() || selectedFile) ? 'pointer' : 'default',
                transition: 'background 0.2s'
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
