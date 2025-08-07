import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPrompts, searchPrompts, toggleFavorite } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Grid, List, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PromptCard from '../components/prompts/PromptCard';
import SearchFilters from '../components/marketplace/SearchFilters';
import toast from 'react-hot-toast';

const Marketplace = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    aiTool: searchParams.get('tool') || '',
    priceRange: { min: 0, max: 100 },
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const searchQuery = searchParams.get('search') || '';

  const handleFavorite = async (promptId) => {
    if (!user) {
      toast.error('Please sign in to favorite prompts');
      return;
    }

    try {
      const isFavorited = await toggleFavorite(user.uid, promptId);

      // Update the prompt in the local state
      setPrompts(prev => prev.map(prompt =>
        prompt.id === promptId
          ? { ...prompt, isFavorited, favorites: (prompt.favorites || 0) + (isFavorited ? 1 : -1) }
          : prompt
      ));

      toast.success(isFavorited ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      try {
        let result;
        if (searchQuery) {
          result = await searchPrompts(searchQuery, filters);
          setPrompts(result);
        } else {
          const { prompts: fetchedPrompts } = await getPrompts(filters);
          setPrompts(fetchedPrompts);
        }
      } catch (error) {
        console.error('Error fetching prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [searchQuery, filters]);

  return (
    <div className="min-h-screen bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-50 mb-2">
              {searchQuery ? `Search results for "${searchQuery}"` : 'Marketplace'}
            </h1>
            <p className="text-primary-300">
              Discover high-quality AI prompts from expert creators
            </p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <SearchFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={() => setFilters({
                category: '',
                aiTool: '',
                priceRange: { min: 0, max: 1000 },
                sortBy: 'createdAt',
                sortOrder: 'desc'
              })}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : prompts.length === 0 ? (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold text-primary-50 mb-2">
                  No prompts found
                </h3>
                <p className="text-primary-300">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {prompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onFavorite={handleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
