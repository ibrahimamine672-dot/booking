import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { chatAI } from '../services/api';

export default function AIChat() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
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
      const data = await chatAI(userMsg);
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
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 bg-primary-800 dark:bg-primary-700 text-white rounded-full shadow-lg hover:bg-primary-900 dark:hover:bg-primary-600 hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95"
        aria-label={isOpen ? t('aiChat.close') : t('aiChat.open')}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-[340px] sm:w-[380px] h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-primary-800 dark:bg-primary-700 text-white px-4 py-3 flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                {t('aiChat.title')}
                <Sparkles className="w-3 h-3 text-accent-400" />
              </h3>
              <p className="text-[0.625rem] text-blue-200/70">{t('aiChat.subtitle')}</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-sm hover:bg-white/10 text-blue-200 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-600' : 'bg-primary-700 dark:bg-primary-600'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <Bot className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className={`px-3 py-2 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-700 dark:bg-primary-600 text-white rounded-lg rounded-br-sm'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-600 rounded-lg rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-700 dark:bg-primary-600 flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-600">
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
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('aiChat.placeholder')}
                disabled={loading}
                className="flex-1 px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-sm focus:outline-none focus:border-primary-600 dark:focus:border-primary-400 focus:ring-1 focus:ring-primary-600/20 disabled:opacity-50 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-8 h-8 bg-primary-800 dark:bg-primary-700 hover:bg-primary-900 dark:hover:bg-primary-600 disabled:bg-gray-200 dark:disabled:bg-gray-600 text-white rounded-sm transition-all duration-200 flex items-center justify-center active:scale-95 disabled:active:scale-100"
                aria-label={t('aiChat.send')}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
