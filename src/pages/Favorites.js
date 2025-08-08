import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserFavorites } from '../firebase/firestore';
import { Link } from 'react-router-dom';
import { Heart, Search, Filter } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PromptCard from '../components/prompts/PromptCard';
import Button from '../components/ui/Button';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userFavorites = await getUserFavorites(user.uid);
        setFavorites(userFavorites);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const handleFavoriteToggle = (promptId, isFavorited) => {
    if (isFavorited === false) {
      // Remove from favorites list when unfavorited
      setFavorites(prev => prev.filter(fav => fav.id !== promptId));
    }
  };

  // Filter favorites based on search and category
  const filteredFavorites = favorites.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from favorites
  const categories = [...new Set(favorites.map(prompt => prompt.category))];

  if (!user) {
    return (
      <div className="min-h-screen bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Heart size={64} className="mx-auto text-primary-600 mb-4" />
            <h1 className="text-3xl font-bold text-primary-50 mb-4">
              Sign In Required
            </h1>
            <p className="text-primary-300 mb-8">
              Please sign in to view your favorite prompts
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
              Error Loading Favorites
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

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Heart size={64} className="mx-auto text-primary-600 mb-4" />
            <h1 className="text-3xl font-bold text-primary-50 mb-4">
              No Favorites Yet
            </h1>
            <p className="text-primary-300 mb-8">
              Start exploring prompts and add them to your favorites by clicking the heart icon!
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-50 mb-2 flex items-center">
            <Heart size={32} className="mr-3 text-red-400" />
            My Favorites
          </h1>
          <p className="text-primary-300">
            {favorites.length} saved prompt{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400" />
              <input
                type="text"
                placeholder="Search your favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-primary-800 border border-primary-600 rounded-lg text-primary-50 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 bg-primary-800 border border-primary-600 rounded-lg text-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {searchTerm || selectedCategory !== 'all' ? (
          <div className="mb-6">
            <p className="text-primary-400">
              Showing {filteredFavorites.length} of {favorites.length} favorites
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </p>
          </div>
        ) : null}

        {/* Favorites Grid */}
        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onFavorite={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-primary-300" />
            </div>
            <h3 className="text-lg font-semibold text-primary-50 mb-2">
              No Results Found
            </h3>
            <p className="text-primary-300 mb-6">
              Try adjusting your search terms or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 card p-6">
          <h2 className="text-xl font-semibold text-primary-50 mb-4">
            Favorites Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">
                {favorites.length}
              </div>
              <div className="text-primary-400 text-sm">Total Favorites</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-400 mb-1">
                {categories.length}
              </div>
              <div className="text-primary-400 text-sm">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-400 mb-1">
                {favorites.filter(p => p.price === 0).length}
              </div>
              <div className="text-primary-400 text-sm">Free Prompts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-500 mb-1">
                ${favorites.reduce((sum, p) => sum + (p.price || 0), 0).toFixed(2)}
              </div>
              <div className="text-primary-400 text-sm">Total Value</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
