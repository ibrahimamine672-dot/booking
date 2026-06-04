import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StickyNote, Send, Clock, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';
import { getNotes, createNote } from '../services/api';

export default function Notes() {
  const { t, i18n } = useTranslation();
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const inputRef = useRef(null);
  const listEndRef = useRef(null);

  // Fetch notes on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchNotes() {
      try {
        setError(null);
        const data = await getNotes();
        if (!cancelled) setNotes(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchNotes();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    const optimisticNote = {
      _id: `temp-${Date.now()}`,
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setNotes(prev => [optimisticNote, ...prev]);
    setContent('');

    try {
      const saved = await createNote(trimmed);
      setNotes(prev => prev.map(n => n._id === optimisticNote._id ? saved : n));
    } catch (err) {
      setNotes(prev => prev.filter(n => n._id !== optimisticNote._id));
      setSubmitError(err.message || 'Failed to save note. Please try again.');
    } finally {
      setSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('notes.justNow');
    if (diffMins < 60) return `${diffMins}${t('notes.m_ago')}`;
    if (diffHrs < 24) return `${diffHrs}${t('notes.h_ago')}`;
    if (diffDays < 7) return `${diffDays}${t('notes.d_ago')}`;

    return date.toLocaleDateString(i18n.language, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const charCount = content.length;
  const charLimit = 500;

  return (
    <div className="page-container py-8 md:py-10 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-800 dark:bg-primary-700 rounded-lg mb-4">
          <StickyNote className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('notes.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {t('notes.subtitle')}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Note Form */}
        <div className="booking-card p-4 md:p-5 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <textarea
                ref={inputRef}
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= charLimit) {
                    setContent(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={t('notes.writeNote')}
                rows={3}
                disabled={submitting}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-sm focus:outline-none focus:border-primary-600 dark:focus:border-primary-400 focus:ring-1 focus:ring-primary-600/20 disabled:opacity-50 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none transition-colors"
                aria-label="Write a note"
              />
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs ${charCount > charLimit * 0.9 ? 'text-red-500 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                  {charCount}/{charLimit}
                </span>
                {submitError && (
                  <span className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    {submitError}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={!content.trim() || submitting}
                className="btn-primary text-sm"
              >
                {submitting ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('notes.posting')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    {t('notes.addNote')}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Notes List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="booking-card p-4">
                <div className="skeleton h-4 w-3/4 mb-2" />
                <div className="skeleton h-3 w-1/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="booking-card p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 dark:text-red-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary text-sm">
              {t('destinationDetails.tryAgain')}
            </button>
          </div>
        ) : notes.length === 0 ? (
          <div className="booking-card p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
              <MessageSquare className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('notes.noNotesYet')}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{t('notes.beFirst')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note._id}
                className="booking-card p-4 md:p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors animate-fade-in"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-sm flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={listEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
