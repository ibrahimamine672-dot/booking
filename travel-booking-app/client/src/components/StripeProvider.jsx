import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function StripeProvider({ children, clientSecret }) {
  if (!clientSecret) return children;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#1e3a5f',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            borderRadius: '8px',
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}
