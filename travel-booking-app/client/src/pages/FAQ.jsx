import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendFAQContact } from '../services/api';
import {
  HelpCircle, ChevronDown, Mail, User, MessageSquare,
  CheckCircle, Send, AlertCircle, Loader2, Search,
  Shield, CreditCard, Plane, RefreshCw,
} from 'lucide-react';

const faqKeys = [
  {
    questionKey: 'faq.faq1_q',
    answerKey: 'faq.faq1_a',
    icon: Plane,
  },
  {
    questionKey: 'faq.faq2_q',
    answerKey: 'faq.faq2_a',
    icon: CreditCard,
  },
  {
    questionKey: 'faq.faq3_q',
    answerKey: 'faq.faq3_a',
    icon: RefreshCw,
  },
  {
    questionKey: 'faq.faq4_q',
    answerKey: 'faq.faq4_a',
    icon: Shield,
  },
];

function FAQItem({ faq, index, openIndex, setOpenIndex, t }) {
  const isOpen = openIndex === index;

  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 ${
        isOpen ? 'border-primary-200 dark:border-primary-600 shadow-sm' : 'hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
      }`}
    >
      <button
        onClick={() => setOpenIndex(isOpen ? null : index)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <faq.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </div>
        <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-200 pr-4">{t(faq.questionKey)}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-4 pl-14">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t(faq.answerKey)}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, email, message } = form;
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(t('faq.pleaseFillAll'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('faq.validEmail'));
      return;
    }

    setSubmitting(true);
    try {
      await sendFAQContact({ name: name.trim(), email: email.trim(), message: message.trim() });
      setSuccess(t('faq.thankYou'));
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.message || 'Failed to send your question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container py-8 md:py-10 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-800 dark:bg-primary-700 rounded-lg mb-4">
          <HelpCircle className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('faq.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {t('faq.subtitle')}
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* ================= FAQ SECTION ================= */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Search className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('faq.frequentlyAsked')}</h2>
          </div>
          <div className="space-y-3">
            {faqKeys.map((faq, i) => (
              <FAQItem
                key={i}
                faq={faq}
                index={i}
                openIndex={openIndex}
                setOpenIndex={setOpenIndex}
                t={t}
              />
            ))}
          </div>
        </section>

        {/* ================= CONTACT FORM ================= */}
        <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-accent-50 dark:bg-accent-900/30 rounded-lg mb-3">
                <MessageSquare className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('faq.stillNeedHelp')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {t('faq.contactDesc')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 sm:p-6 transition-colors duration-200">
              {/* Success Message */}
              {success && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-sm flex items-start gap-2 animate-fade-in-down">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">{success}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm flex items-start gap-2 animate-fade-in-down">
                  <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="faq-name" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    {t('faq.yourName')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    <input
                      id="faq-name"
                      type="text"
                      value={form.name}
                      onChange={updateField('name')}
                      placeholder="John Doe"
                      autoComplete="name"
                      className="booking-input pl-10 text-sm"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="faq-email" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    {t('faq.yourEmail')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    <input
                      id="faq-email"
                      type="email"
                      value={form.email}
                      onChange={updateField('email')}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="booking-input pl-10 text-sm"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="faq-message" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    {t('faq.yourQuestion')}
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    <textarea
                      id="faq-message"
                      value={form.message}
                      onChange={updateField('message')}
                      placeholder={t('faq.tellUs')}
                      rows={4}
                      className="booking-input pl-10 text-sm resize-none"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full text-sm"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('faq.sending')}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <Send className="w-4 h-4" />
                      {t('faq.sendQuestion')}
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
