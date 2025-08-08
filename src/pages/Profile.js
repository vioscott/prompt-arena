import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPrompts } from '../firebase/firestore';
import {
  User,
  Star,
  Calendar,
  MapPin,
  Globe,
  Mail,
  Award,
  ShoppingBag
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PromptCard from '../components/prompts/PromptCard';
import Button from '../components/ui/Button';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();

  const [userProfile, setUserProfile] = useState(null);
  const [userPrompts, setUserPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('prompts');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        // Get user's prompts
        const { prompts } = await getPrompts({ userId }, null, 50);
        setUserPrompts(prompts);

        // Create mock user profile based on prompts data
        if (prompts.length > 0) {
          const firstPrompt = prompts[0];
          const totalViews = prompts.reduce((sum, p) => sum + (p.views || 0), 0);
          const totalSales = prompts.reduce((sum, p) => sum + (p.sales || 0), 0);
          const totalFavorites = prompts.reduce((sum, p) => sum + (p.favorites || 0), 0);
          const avgRating = prompts.reduce((sum, p) => sum + (p.rating || 0), 0) / prompts.length;

          setUserProfile({
            id: userId,
            name: firstPrompt.authorName || 'Anonymous User',
            email: 'user@example.com',
            bio: 'AI prompt creator and enthusiast. Creating high-quality prompts for various AI tools.',
            location: 'Global',
            website: 'https://promptarena.com',
            joinDate: new Date('2024-01-01'),
            stats: {
              totalPrompts: prompts.length,
              totalViews: totalViews,
              totalSales: totalSales,
              totalFavorites: totalFavorites,
              averageRating: avgRating,
              totalEarnings: prompts.reduce((sum, p) => sum + ((p.sales || 0) * (p.price || 0)), 0)
            },
            badges: [
              { name: 'Top Seller', icon: Award, color: 'text-yellow-400' },
              { name: 'Verified Creator', icon: Star, color: 'text-accent-400' }
            ]
          });
        } else {
          // Default profile for users with no prompts
          setUserProfile({
            id: userId,
            name: 'User Profile',
            email: 'user@example.com',
            bio: 'New to Prompt Arena',
            location: 'Global',
            website: '',
            joinDate: new Date(),
            stats: {
              totalPrompts: 0,
              totalViews: 0,
              totalSales: 0,
              totalFavorites: 0,
              averageRating: 0,
              totalEarnings: 0
            },
            badges: []
          });
        }

      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long'
    }).format(date);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              {error || 'User Not Found'}
            </h1>
            <p className="text-primary-300 mb-6">
              The user profile you're looking for doesn't exist or couldn't be loaded.
            </p>
            <Link to="/marketplace">
              <Button>Back to Marketplace</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.uid === userId;

  return (
    <div className="min-h-screen bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="card p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg">
                <User size={32} className="text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-primary-50 mb-2">
                    {userProfile.name}
                  </h1>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {userProfile.badges.map((badge, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full bg-primary-700 ${badge.color}`}
                      >
                        <badge.icon size={14} />
                        <span className="text-sm font-medium">{badge.name}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-primary-300 mb-4 max-w-2xl">
                    {userProfile.bio}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-primary-400">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      <span>Joined {formatDate(userProfile.joinDate)}</span>
                    </div>
                    {userProfile.location && (
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-1" />
                        <span>{userProfile.location}</span>
                      </div>
                    )}
                    {userProfile.website && (
                      <div className="flex items-center">
                        <Globe size={16} className="mr-1" />
                        <a
                          href={userProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-accent-400 transition-colors"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                  {isOwnProfile ? (
                    <Button variant="outline">
                      Edit Profile
                    </Button>
                  ) : (
                    <Button variant="outline">
                      <Mail size={16} className="mr-2" />
                      Contact
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-accent-400 mb-1">
              {userProfile.stats.totalPrompts}
            </div>
            <div className="text-primary-400 text-sm">Prompts</div>
          </div>

          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-secondary-400 mb-1">
              {userProfile.stats.totalViews.toLocaleString()}
            </div>
            <div className="text-primary-400 text-sm">Views</div>
          </div>

          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-accent-300 mb-1">
              {userProfile.stats.totalSales}
            </div>
            <div className="text-primary-400 text-sm">Sales</div>
          </div>

          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">
              {userProfile.stats.totalFavorites}
            </div>
            <div className="text-primary-400 text-sm">Favorites</div>
          </div>

          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {userProfile.stats.averageRating > 0 ? userProfile.stats.averageRating.toFixed(1) : '—'}
            </div>
            <div className="text-primary-400 text-sm">Rating</div>
          </div>

          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-accent-500 mb-1">
              {formatCurrency(userProfile.stats.totalEarnings)}
            </div>
            <div className="text-primary-400 text-sm">Earned</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card p-6">
          <div className="flex space-x-8 border-b border-primary-600 mb-6">
            <button
              onClick={() => setActiveTab('prompts')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'prompts'
                  ? 'border-accent-400 text-accent-400'
                  : 'border-transparent text-primary-400 hover:text-primary-200'
              }`}
            >
              Prompts ({userProfile.stats.totalPrompts})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reviews'
                  ? 'border-accent-400 text-accent-400'
                  : 'border-transparent text-primary-400 hover:text-primary-200'
              }`}
            >
              Reviews
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'prompts' && (
            <div>
              {userPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPrompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag size={24} className="text-primary-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary-50 mb-2">
                    No Prompts Yet
                  </h3>
                  <p className="text-primary-300 mb-6">
                    {isOwnProfile
                      ? "You haven't created any prompts yet. Start selling your AI prompts today!"
                      : "This user hasn't created any prompts yet."
                    }
                  </p>
                  {isOwnProfile && (
                    <Link to="/sell">
                      <Button>Create Your First Prompt</Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={24} className="text-primary-300" />
              </div>
              <h3 className="text-lg font-semibold text-primary-50 mb-2">
                Reviews Coming Soon
              </h3>
              <p className="text-primary-300">
                User reviews and ratings will be displayed here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
