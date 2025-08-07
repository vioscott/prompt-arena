import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getStripe, createPaymentIntent } from '../utils/stripe';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Button from '../components/ui/Button';
import CheckoutForm from '../components/payment/CheckoutForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const { user } = useAuth();
  const { items, total } = useCart();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const stripePromise = getStripe();

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    // Redirect if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Create payment intent
    const initializePayment = async () => {
      setLoading(true);
      try {
        const { clientSecret } = await createPaymentIntent(items, user.uid);
        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Error initializing payment:', err);
        setError('Failed to initialize payment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [items, user, navigate]);

  const handlePaymentSuccess = (paymentIntent) => {
    navigate('/orders?success=true');
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    setError(error.message || 'Payment failed. Please try again.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-primary-50 mb-4">
              Checkout Error
            </h1>
            <p className="text-primary-300 mb-6">
              {error}
            </p>
            <div className="space-x-4">
              <Link to="/cart">
                <Button variant="outline">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Cart
                </Button>
              </Link>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#ff7676',
      colorBackground: '#343a40',
      colorText: '#f8f9fa',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-primary-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center text-primary-300 hover:text-primary-50 transition-colors mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-primary-50">
            Checkout
          </h1>
          <p className="text-primary-300 mt-2">
            Complete your purchase to access your prompts
          </p>
        </div>

        {/* Checkout Form */}
        <div className="card p-6">
          {clientSecret && stripePromise && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-primary-400">
            🔒 Payments are processed securely by Stripe
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
