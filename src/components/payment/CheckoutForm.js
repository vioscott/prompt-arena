import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { createOrder } from '../../firebase/firestore';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const CheckoutForm = ({ clientSecret, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentReady, setPaymentReady] = useState(false);

  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }

    // Check if payment element is ready
    const paymentElement = elements.getElement('payment');
    if (paymentElement) {
      setPaymentReady(true);
    }
  }, [stripe, elements]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Confirm payment
      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
        },
        redirect: 'if_required'
      });

      if (paymentError) {
        throw paymentError;
      }

      if (paymentIntent.status === 'succeeded') {
        // Create order records for each item
        const orderPromises = items.map(item => 
          createOrder({
            promptId: item.id,
            promptTitle: item.title,
            buyerId: user.uid,
            sellerId: item.sellerId || 'system',
            amount: item.price,
            paymentIntentId: paymentIntent.id,
            status: 'completed'
          })
        );

        await Promise.all(orderPromises);
        
        // Clear cart
        clearCart();
        
        toast.success('Payment successful! You can now access your prompts.');
        
        if (onSuccess) {
          onSuccess(paymentIntent);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment');
      
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!stripe || !elements) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Security Notice */}
      <div className="flex items-center space-x-2 text-sm text-primary-300 bg-primary-800/50 p-3 rounded-lg">
        <Lock size={16} className="text-green-400" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      {/* Payment Element */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary-50 flex items-center">
          <CreditCard size={20} className="mr-2" />
          Payment Information
        </h3>
        
        <div className="p-4 border border-primary-600 rounded-lg bg-primary-800">
          <PaymentElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#f8f9fa',
                  '::placeholder': {
                    color: '#6c757d',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-primary-800/50 p-4 rounded-lg">
        <h4 className="font-medium text-primary-50 mb-3">Order Summary</h4>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-primary-300 truncate mr-2">{item.title}</span>
              <span className="text-primary-50">${item.price.toFixed(2)}</span>
            </div>
          ))}
          <hr className="border-primary-600" />
          <div className="flex justify-between font-medium">
            <span className="text-primary-50">Total</span>
            <span className="text-accent-400">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={loading}
        disabled={loading || !paymentReady}
      >
        {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </Button>

      {/* Terms */}
      <p className="text-xs text-primary-400 text-center">
        By completing your purchase, you agree to our{' '}
        <a href="/terms" className="text-accent-400 hover:text-accent-300">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-accent-400 hover:text-accent-300">
          Privacy Policy
        </a>
      </p>
    </form>
  );
};

export default CheckoutForm;
