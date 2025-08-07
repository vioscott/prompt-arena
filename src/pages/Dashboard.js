import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPrompts, getUserOrders } from '../firebase/firestore';
import { 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Heart,
  Package,
  Plus,
  Settings,
  BarChart3
} from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalSales: 0,
    totalViews: 0,
    totalPrompts: 0
  });
  const [recentPrompts, setRecentPrompts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch user's prompts
        const { prompts } = await getPrompts({ userId: user.uid }, null, 5);
        setRecentPrompts(prompts);

        // Calculate stats from prompts
        const totalViews = prompts.reduce((sum, prompt) => sum + (prompt.views || 0), 0);
        const totalSales = prompts.reduce((sum, prompt) => sum + (prompt.sales || 0), 0);
        const totalEarnings = prompts.reduce((sum, prompt) => 
          sum + ((prompt.sales || 0) * (prompt.price || 0)), 0
        );

        setStats({
          totalEarnings,
          totalSales,
          totalViews,
          totalPrompts: prompts.length
        });

        // Fetch recent orders
        const orders = await getUserOrders(user.uid);
        setRecentOrders(orders.slice(0, 5));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const statCards = [
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings.toFixed(2)}`,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'text-accent-400'
    },
    {
      title: 'Total Sales',
      value: stats.totalSales,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-secondary-400'
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: <Eye className="h-6 w-6" />,
      color: 'text-accent-300'
    },
    {
      title: 'Active Prompts',
      value: stats.totalPrompts,
      icon: <Package className="h-6 w-6" />,
      color: 'text-secondary-300'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-50 mb-2">
              Welcome back, {userProfile?.displayName || user?.displayName || 'Creator'}!
            </h1>
            <p className="text-primary-300">
              Here's what's happening with your prompts
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Link to="/sell">
              <Button>
                <Plus size={16} className="mr-2" />
                New Prompt
              </Button>
            </Link>
            <Button variant="outline">
              <Settings size={16} className="mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-400 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-primary-50 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Prompts */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary-50">
                Recent Prompts
              </h2>
              <Link to="/marketplace?user=me">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {recentPrompts.length === 0 ? (
              <div className="text-center py-8">
                <Package size={48} className="mx-auto text-primary-600 mb-4" />
                <h3 className="text-lg font-medium text-primary-50 mb-2">
                  No prompts yet
                </h3>
                <p className="text-primary-300 mb-4">
                  Start by creating your first prompt
                </p>
                <Link to="/sell">
                  <Button size="sm">
                    <Plus size={16} className="mr-2" />
                    Create Prompt
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPrompts.map((prompt) => (
                  <div key={prompt.id} className="flex items-center justify-between p-4 bg-primary-800 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-primary-50 mb-1">
                        {prompt.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-primary-400">
                        <span>${prompt.price}</span>
                        <span>{prompt.views || 0} views</span>
                        <span>{prompt.sales || 0} sales</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prompt.status === 'approved'
                          ? 'bg-accent-500/20 text-accent-400'
                          : prompt.status === 'pending'
                          ? 'bg-secondary-500/20 text-secondary-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {prompt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary-50">
                Recent Purchases
              </h2>
              <Link to="/orders">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Heart size={48} className="mx-auto text-primary-600 mb-4" />
                <h3 className="text-lg font-medium text-primary-50 mb-2">
                  No purchases yet
                </h3>
                <p className="text-primary-300 mb-4">
                  Browse the marketplace to find amazing prompts
                </p>
                <Link to="/marketplace">
                  <Button size="sm">
                    Browse Prompts
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-primary-800 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-primary-50 mb-1">
                        {order.promptTitle}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-primary-400">
                        <span>${order.amount}</span>
                        <span>{new Date(order.createdAt?.toDate()).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed'
                          ? 'bg-accent-500/20 text-accent-400'
                          : order.status === 'pending'
                          ? 'bg-secondary-500/20 text-secondary-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-primary-50 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/sell" className="card card-hover p-6 text-center">
              <Plus size={32} className="mx-auto text-accent-400 mb-3" />
              <h3 className="font-medium text-primary-50 mb-2">Create New Prompt</h3>
              <p className="text-primary-400 text-sm">Start selling your AI prompts</p>
            </Link>

            <Link to="/marketplace" className="card card-hover p-6 text-center">
              <BarChart3 size={32} className="mx-auto text-secondary-400 mb-3" />
              <h3 className="font-medium text-primary-50 mb-2">Browse Marketplace</h3>
              <p className="text-primary-400 text-sm">Discover new prompts to buy</p>
            </Link>

            <Link to="/profile" className="card card-hover p-6 text-center">
              <Settings size={32} className="mx-auto text-secondary-300 mb-3" />
              <h3 className="font-medium text-primary-50 mb-2">Edit Profile</h3>
              <p className="text-primary-400 text-sm">Update your profile information</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
