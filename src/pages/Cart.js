import React from 'react';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { items, total, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <ShoppingCart size={64} className="mx-auto text-primary-600 mb-4" />
            <h1 className="text-3xl font-bold text-primary-50 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-primary-300 mb-8">
              Browse our marketplace to find amazing AI prompts
            </p>
            <Link to="/marketplace">
              <Button>Browse Prompts</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-primary-50 mb-8">
          Shopping Cart ({items.length} items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-primary-50">{item.title}</h3>
                    <p className="text-primary-300 text-sm">{item.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-accent-400 font-semibold">
                    ${item.price}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-primary-50 mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-primary-300">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-primary-300">
                  <span>Processing Fee</span>
                  <span>$0.00</span>
                </div>
                <hr className="border-primary-600" />
                <div className="flex justify-between text-primary-50 font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link to="/checkout">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
