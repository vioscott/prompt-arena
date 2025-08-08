import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { createOrder } from '../../firebase/firestore';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const MockCheckoutForm = ({ onSuccess, onError }) => {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    setLoading(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock payment intent
      const mockPaymentIntent = {
        id: `pi_mock_${Date.now()}`,
        status: 'succeeded',
        amount: Math.round(total * 100),
        currency: 'usd'
      };

      // Create order records for each item
      const orderPromises = items.map(item => 
        createOrder({
          promptId: item.id,
          promptTitle: item.title,
          buyerId: user.uid,
          sellerId: item.sellerId || 'system',
          amount: item.price,
          paymentIntentId: mockPaymentIntent.id,
          status: 'completed'
        })
      );

      await Promise.all(orderPromises);
      
      // Clear cart
      clearCart();
      
      toast.success('Payment successful! You can now access your prompts.');
      
      if (onSuccess) {
        onSuccess(mockPaymentIntent);
      }

    } catch (error) {
      console.error('Mock payment error:', error);
      toast.error('Payment simulation failed. Please try again.');
      
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Development Notice */}
      <div className="flex items-center space-x-2 text-sm text-yellow-300 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
        <AlertCircle size={16} className="text-yellow-400" />
        <span>Development Mode: This is a simulated payment for testing purposes</span>
      </div>
      
      {/* Security Notice */}
      <div className="flex items-center space-x-2 text-sm text-primary-300 bg-primary-800/50 p-3 rounded-lg">
        <Lock size={16} className="text-green-400" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      {/* Mock Payment Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary-50 flex items-center">
          <CreditCard size={20} className="mr-2" />
          Payment Information
        </h3>
        
        <div className="p-4 border border-primary-600 rounded-lg bg-primary-800">
          <div className="text-center py-8">
            <CreditCard size={32} className="mx-auto text-primary-400 mb-4" />
            <p className="text-primary-300 mb-2">Development Mode</p>
            <p className="text-primary-400 text-sm">
              Click "Simulate Payment" below to complete your order
            </p>
          </div>
        </div>
      </div>

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
        disabled={loading}
      >
        {loading ? 'Processing...' : `Simulate Payment - $${total.toFixed(2)}`}
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

export default MockCheckoutForm;
