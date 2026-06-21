import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, Bot, User, Sparkles, Zap, Cpu } from 'lucide-react';
import { chatAI, chatFree } from '../services/api';

export default function AIChat() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState('free');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      let data;
      if (aiProvider === 'free') {
        data = await chatFree(userMsg);
      } else {
        data = await chatAI(userMsg);
      }
      const reply = data?.reply || data?.message || data?.text || t('aiChat.notSure');
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('token') || msg.includes('Session expired')) {
        if (!user) {
          setMessages(prev => [...prev, { role: 'assistant', text: t('aiChat.signInPrompt') }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', text: t('aiChat.sessionExpired') }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: t('aiChat.error') }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button - Floating Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label={isOpen ? t('aiChat.close') : t('aiChat.open')}
      >
        <div className="relative">
          {/* Pulse ring */}
          <div className={`absolute inset-0 rounded-full bg-primary-500/30 animate-ping ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
          {/* Button */}
          <div className={`relative flex items-center gap-2.5 px-5 py-3 rounded-full shadow-[0_8px_32px_rgba(0,59,149,0.25)] transition-all duration-300 hover:scale-105 active:scale-95 ${
            isOpen
              ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xl'
              : 'bg-gradient-to-r from-primary-500 to-primary-700 text-white hover:shadow-[0_12px_40px_rgba(0,59,149,0.35)]'
          }`}>
            {isOpen ? (
              <>
                <X className="w-4 h-4" />
                <span className="text-sm font-bold hidden sm:inline">{t('aiChat.close')}</span>
              </>
            ) : (
              <>
                <div className="relative">
                  <MessageCircle className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                </div>
                <span className="text-sm font-bold">{t('aiChat.open')}</span>
              </>
            )}
          </div>
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] sm:w-[400px] h-[540px] bg-white/90 backdrop-blur-2xl dark:bg-slate-900/95 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.12)] border border-slate-200/50 dark:border-slate-700/50 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white px-5 py-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    {t('aiChat.title')}
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h3>
                  {/* AI Provider Toggle */}
                  <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-xl p-0.5 gap-0.5">
                    <button
                      onClick={() => setAiProvider('free')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-[10px] text-[0.6rem] font-semibold transition-all duration-200 ${
                        aiProvider === 'free'
                          ? 'bg-emerald-400/40 text-white shadow-sm'
                          : 'text-white/60 hover:text-white/90'
                      }`}
                      title="Groq AI — Free (Llama 3.3)"
                    >
                      <Zap className="w-2.5 h-2.5" />
                      <span>{t('aiChat.free')}</span>
                    </button>
                    <button
                      onClick={() => setAiProvider('openai')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-[10px] text-[0.6rem] font-semibold transition-all duration-200 ${
                        aiProvider === 'openai'
                          ? 'bg-emerald-400/40 text-white shadow-sm'
                          : 'text-white/60 hover:text-white/90'
                      }`}
                      title="OpenAI GPT — Requires Credits"
                    >
                      <Cpu className="w-2.5 h-2.5" />
                      <span>{t('aiChat.gpt')}</span>
                    </button>
                  </div>
                </div>
                <p className="text-[0.65rem] text-white/70 font-medium mt-0.5">{t('aiChat.subtitle')}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                <div className={`flex gap-2.5 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-200 dark:bg-slate-700'
                      : 'bg-gradient-to-br from-primary-500 to-primary-700'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl rounded-br-sm shadow-md shadow-primary-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700/50 rounded-2xl rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="flex gap-2.5 max-w-[88%]">
                  <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm px-5 py-3.5 shadow-sm border border-slate-100 dark:border-slate-700/50">
                    <div className="flex gap-1.5">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50 flex-shrink-0">
            <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all duration-200 px-3 py-1.5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('aiChat.placeholder')}
                disabled={loading}
                className="flex-1 py-2 text-sm bg-transparent border-none focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-200 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-700 dark:disabled:to-slate-700 text-white disabled:text-slate-400 dark:disabled:text-slate-500 shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 disabled:shadow-none transition-all duration-200 flex items-center justify-center active:scale-90 disabled:active:scale-100"
                aria-label={t('aiChat.send')}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
