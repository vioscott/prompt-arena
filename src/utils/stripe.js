import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const getStripe = () => stripePromise;

// Create payment intent for checkout
export const createPaymentIntent = async (items, userId) => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items,
        userId,
        currency: 'usd'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Process payment
export const processPayment = async (stripe, elements, clientSecret) => {
  try {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders`,
      },
      redirect: 'if_required'
    });

    if (error) {
      throw error;
    }

    return paymentIntent;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

// Calculate platform fee (20% for marketplace, 0% for direct sales)
export const calculateFees = (amount, isDirect = false) => {
  const platformFeeRate = isDirect ? 0 : 0.20; // 20% marketplace fee
  const stripeFeeRate = 0.029; // 2.9% + $0.30 Stripe fee
  const stripeFeeFixed = 0.30;
  
  const platformFee = amount * platformFeeRate;
  const stripeFee = (amount * stripeFeeRate) + stripeFeeFixed;
  const totalFees = platformFee + stripeFee;
  const sellerAmount = amount - totalFees;
  
  return {
    amount,
    platformFee,
    stripeFee,
    totalFees,
    sellerAmount
  };
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};
