import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserOrders } from '../firebase/firestore';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Calendar,
  Download,
  Star,
  CheckCircle,
  Clock,
  XCircle,
  Eye
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const Orders = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for success parameter from payment redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Payment successful! Your orders are ready.');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userOrders = await getUserOrders(user.uid);
        setOrders(userOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-400" />;
      case 'failed':
        return <XCircle size={16} className="text-red-400" />;
      default:
        return <Clock size={16} className="text-primary-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-primary-500/20 text-primary-400';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <ShoppingBag size={64} className="mx-auto text-primary-600 mb-4" />
            <h1 className="text-3xl font-bold text-primary-50 mb-4">
              Sign In Required
            </h1>
            <p className="text-primary-300 mb-8">
              Please sign in to view your order history
            </p>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Error Loading Orders
            </h1>
            <p className="text-primary-300 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <ShoppingBag size={64} className="mx-auto text-primary-600 mb-4" />
            <h1 className="text-3xl font-bold text-primary-50 mb-4">
              No Orders Yet
            </h1>
            <p className="text-primary-300 mb-8">
              You haven't made any purchases yet. Browse our marketplace to find amazing AI prompts!
            </p>
            <Link to="/marketplace">
              <Button>Browse Marketplace</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-50 mb-2">
            My Orders
          </h1>
          <p className="text-primary-300">
            View and manage your purchased prompts
          </p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-primary-50">
                      {order.promptTitle}
                    </h3>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-primary-400">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-accent-400 font-medium">
                        ${order.amount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    {order.paymentIntentId && (
                      <div className="text-xs text-primary-500">
                        Order ID: {order.paymentIntentId.slice(-8)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                  {order.status === 'completed' && (
                    <>
                      <Link to={`/prompt/${order.promptId}`}>
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-1" />
                          View Prompt
                        </Button>
                      </Link>
                      <Button size="sm">
                        <Download size={14} className="mr-1" />
                        Download
                      </Button>
                    </>
                  )}

                  {order.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      <Star size={14} className="mr-1" />
                      Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-8 card p-6">
          <h2 className="text-xl font-semibold text-primary-50 mb-4">
            Order Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-400 mb-1">
                {orders.length}
              </div>
              <div className="text-primary-400 text-sm">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {orders.filter(o => o.status === 'completed').length}
              </div>
              <div className="text-primary-400 text-sm">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-primary-400 text-sm">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-500 mb-1">
                ${orders.reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)}
              </div>
              <div className="text-primary-400 text-sm">Total Spent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
