import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { toggleFavorite, isPromptFavorited } from '../../firebase/firestore';
import { Heart, Star, Eye, ShoppingCart, User } from 'lucide-react';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const PromptCard = ({ prompt, onFavorite }) => {
  const { user } = useAuth();
  const { addItem, isInCart } = useCart();
  const [isFavorited, setIsFavorited] = useState(prompt.isFavorited || false);
  const [favoriteCount, setFavoriteCount] = useState(prompt.favorites || 0);
  const [loading, setLoading] = useState(false);

  // Check if prompt is favorited when user changes
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && prompt.id) {
        try {
          const favorited = await isPromptFavorited(user.uid, prompt.id);
          setIsFavorited(favorited);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      } else {
        setIsFavorited(false);
      }
    };

    checkFavoriteStatus();
  }, [user, prompt.id]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    if (isInCart(prompt.id)) {
      toast.error('Item already in cart');
      return;
    }

    addItem({
      id: prompt.id,
      title: prompt.title,
      price: prompt.price,
      imageUrl: prompt.imageUrl,
      category: prompt.category
    });
    
    toast.success('Added to cart!');
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to favorite prompts');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const newFavoriteStatus = await toggleFavorite(user.uid, prompt.id);
      setIsFavorited(newFavoriteStatus);

      // Update favorite count
      setFavoriteCount(prev => newFavoriteStatus ? prev + 1 : prev - 1);

      // Call parent callback if provided
      if (onFavorite) {
        onFavorite(prompt.id, newFavoriteStatus);
      }

      toast.success(newFavoriteStatus ? 'Added to favorites!' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  const getAIToolBadge = (aiTool) => {
    const colors = {
      'chatgpt': 'bg-accent-500/20 text-accent-400',
      'midjourney': 'bg-secondary-500/20 text-secondary-400',
      'dalle': 'bg-accent-600/20 text-accent-300',
      'stable-diffusion': 'bg-secondary-600/20 text-secondary-300'
    };

    return colors[aiTool?.toLowerCase()] || 'bg-primary-600/20 text-primary-400';
  };

  return (
    <Link to={`/prompt/${prompt.id}`} className="block group">
      <div className="card card-hover overflow-hidden h-full">
        {/* Image */}
        <div className="relative">
          {prompt.imageUrl ? (
            <img
              src={prompt.imageUrl}
              alt={prompt.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-primary-700 flex items-center justify-center">
              <span className="text-primary-400 text-sm">No Preview</span>
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            disabled={loading}
            className={`absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart size={16} className={isFavorited ? 'fill-red-500 text-red-500' : ''} />
          </button>

          {/* AI Tool Badge */}
          {prompt.aiTool && (
            <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getAIToolBadge(prompt.aiTool)}`}>
              {prompt.aiTool}
            </div>
          )}

          {/* Free Badge */}
          {prompt.price === 0 && (
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-accent-500 text-white rounded-full text-xs font-medium shadow-lg">
              FREE
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-primary-50 line-clamp-2 group-hover:text-accent-400 transition-colors">
              {prompt.title}
            </h3>
          </div>

          <p className="text-primary-300 text-sm mb-4 line-clamp-2">
            {prompt.description}
          </p>

          {/* Author */}
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center mr-2">
              <User size={12} className="text-primary-200" />
            </div>
            <span className="text-primary-400 text-sm">
              {prompt.authorName || 'Anonymous'}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-primary-400 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Eye size={14} className="mr-1" />
                <span>{prompt.views || 0}</span>
              </div>
              <div className="flex items-center">
                <Heart size={14} className="mr-1" />
                <span>{favoriteCount}</span>
              </div>
              {prompt.rating > 0 && (
                <div className="flex items-center text-yellow-400">
                  <Star size={14} className="mr-1 fill-current" />
                  <span>{prompt.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-accent-400">
              {formatPrice(prompt.price)}
            </span>
            
            {user && user.uid !== prompt.userId && (
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={isInCart(prompt.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ShoppingCart size={14} className="mr-1" />
                {isInCart(prompt.id) ? 'In Cart' : 'Add to Cart'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PromptCard;
