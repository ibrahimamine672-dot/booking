import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';

export default function StripeCheckout({ onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setStatus('processing');
    setMessage('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setStatus('error');
      setMessage(error.message);
      onError?.(error.message);
    } else {
      setStatus('success');
      setMessage(t('payment.success'));
      onSuccess?.();
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <p className="text-sm font-medium text-green-700 dark:text-green-300">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <CreditCard className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t('payment.cardDetails') || 'Card Details'}
        </span>
      </div>

      <PaymentElement />

      {status === 'error' && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-red-700 dark:text-red-300">{message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || status === 'processing'}
        className="btn-primary w-full text-sm"
      >
        {status === 'processing' ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('payment.processing') || 'Processing...'}
          </span>
        ) : (
          t('payment.pay') || 'Pay Now'
        )}
      </button>
    </form>
  );
}
