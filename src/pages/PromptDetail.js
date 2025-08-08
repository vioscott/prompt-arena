import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getPromptById, getPrompts, incrementPromptViews, toggleFavorite, getUserOrders } from '../firebase/firestore';
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Star,
  Eye,
  User,
  Calendar,
  Tag,
  Copy,
  Check,
  CheckCircle,
  Share2
} from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PromptCard from '../components/prompts/PromptCard';
import toast from 'react-hot-toast';

const PromptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, isInCart } = useCart();

  const [prompt, setPrompt] = useState(null);
  const [relatedPrompts, setRelatedPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [hasUserPurchased, setHasUserPurchased] = useState(false);

  useEffect(() => {
    const fetchPromptDetails = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Get prompt details
        const promptData = await getPromptById(id);
        if (!promptData) {
          setError('Prompt not found');
          return;
        }

        setPrompt(promptData);
        setIsFavorited(promptData.isFavorited || false);

        // Increment view count (disabled due to permissions)
        try {
          await incrementPromptViews(id);
        } catch (error) {
          console.log('View increment failed (permissions):', error.message);
        }

        // Get related prompts (same category, different prompt)
        const { prompts: related } = await getPrompts({
          category: promptData.category
        }, null, 4);

        // Filter out current prompt and limit to 3
        const filteredRelated = related
          .filter(p => p.id !== id)
          .slice(0, 3);

        setRelatedPrompts(filteredRelated);

        // Check if user has purchased this prompt
        if (user && promptData.price > 0) {
          try {
            const userOrders = await getUserOrders(user.uid);
            const hasPurchased = userOrders.some(order =>
              order.promptId === id && order.status === 'completed'
            );
            setHasUserPurchased(hasPurchased);
          } catch (error) {
            console.error('Error checking purchase status:', error);
            setHasUserPurchased(false);
          }
        }

      } catch (err) {
        console.error('Error fetching prompt details:', err);
        setError('Failed to load prompt details');
      } finally {
        setLoading(false);
      }
    };

    fetchPromptDetails();
  }, [id, user]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
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
      category: prompt.category,
      sellerId: prompt.userId
    });

    toast.success('Added to cart!');
  };

  const handleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to favorite prompts');
      navigate('/login');
      return;
    }

    try {
      const newFavoriteStatus = await toggleFavorite(user.uid, prompt.id);
      setIsFavorited(newFavoriteStatus);

      // Update prompt state
      setPrompt(prev => ({
        ...prev,
        favorites: (prev.favorites || 0) + (newFavoriteStatus ? 1 : -1),
        isFavorited: newFavoriteStatus
      }));

      toast.success(newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    toast.success('Prompt copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: prompt.title,
        text: prompt.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              {error || 'Prompt Not Found'}
            </h1>
            <p className="text-primary-300 mb-6">
              The prompt you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/marketplace')}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Marketplace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user && user.uid === prompt.userId;
  const canPurchase = user && !isOwner && prompt.price > 0;
  const canAddToCart = canPurchase && !isInCart(prompt.id);

  return (
    <div className="min-h-screen bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-primary-300 hover:text-primary-50 transition-colors mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="card p-6 mb-6">
              <div className="flex flex-wrap items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-primary-50 mb-2">
                    {prompt.title}
                  </h1>
                  <p className="text-primary-300 text-lg">
                    {prompt.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={handleFavorite}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorited
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-primary-700 text-primary-400 hover:text-red-400'
                    }`}
                  >
                    <Heart size={20} className={isFavorited ? 'fill-current' : ''} />
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-primary-700 text-primary-400 hover:text-primary-200 transition-colors"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Tags and Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAIToolBadge(prompt.aiTool)}`}>
                  {prompt.aiTool}
                </span>

                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-600/20 text-primary-300">
                  {prompt.category}
                </span>

                {prompt.price === 0 && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-accent-500 text-white">
                    FREE
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-primary-400">
                <div className="flex items-center">
                  <Eye size={16} className="mr-1" />
                  <span>{prompt.views || 0} views</span>
                </div>
                <div className="flex items-center">
                  <Heart size={16} className="mr-1" />
                  <span>{prompt.favorites || 0} favorites</span>
                </div>
                {prompt.rating > 0 && (
                  <div className="flex items-center text-yellow-400">
                    <Star size={16} className="mr-1 fill-current" />
                    <span>{prompt.rating.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  <span>{new Date(prompt.createdAt?.toDate()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Preview Image */}
            {prompt.imageUrl && (
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-semibold text-primary-50 mb-4">Preview</h2>
                <img
                  src={prompt.imageUrl}
                  alt={prompt.title}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Prompt Content */}
            <div className="card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-primary-50">Prompt</h2>
                {(isOwner || prompt.price === 0 || (user && hasUserPurchased)) && (
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center space-x-2 px-3 py-2 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="text-green-400" />
                        <span className="text-green-400 text-sm">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="text-primary-300" />
                        <span className="text-primary-300 text-sm">Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="bg-primary-800 rounded-lg p-4 border border-primary-600">
                {isOwner || prompt.price === 0 || (user && hasUserPurchased) ? (
                  <>
                    <pre className="text-primary-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {prompt.prompt}
                    </pre>
                    {user && hasUserPurchased && (
                      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center text-green-400 text-sm">
                          <CheckCircle size={16} className="mr-2" />
                          <span>You own this prompt - Full access granted</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart size={24} className="text-primary-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-primary-50 mb-2">
                        Purchase Required
                      </h3>
                      <p className="text-primary-300 mb-6">
                        You need to purchase this prompt to view the full content.
                      </p>
                      {user ? (
                        <Button onClick={handleAddToCart} className="mx-auto">
                          <ShoppingCart size={16} className="mr-2" />
                          Add to Cart - {formatPrice(prompt.price)}
                        </Button>
                      ) : (
                        <Button onClick={() => navigate('/login')} className="mx-auto">
                          Sign In to Purchase
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-primary-50 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-700 text-primary-300"
                    >
                      <Tag size={12} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Purchase Card */}
            <div className="card p-6 mb-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-accent-400 mb-2">
                  {formatPrice(prompt.price)}
                </div>
                {prompt.sales > 0 && (
                  <p className="text-primary-400 text-sm">
                    {prompt.sales} sales
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {canAddToCart && (
                  <Button
                    onClick={handleAddToCart}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    Add to Cart
                  </Button>
                )}

                {isInCart(prompt.id) && (
                  <Button
                    onClick={() => navigate('/cart')}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    View Cart
                  </Button>
                )}

                {prompt.price === 0 && !isOwner && (
                  <Button
                    onClick={handleCopyPrompt}
                    className="w-full"
                    size="lg"
                  >
                    <Copy size={16} className="mr-2" />
                    Copy Prompt
                  </Button>
                )}

                {isOwner && (
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    Edit Prompt
                  </Button>
                )}
              </div>

              {/* Author Info */}
              <div className="mt-6 pt-6 border-t border-primary-600">
                <h3 className="text-sm font-medium text-primary-200 mb-3">Created by</h3>
                <Link
                  to={`/profile/${prompt.userId}`}
                  className="flex items-center space-x-3 hover:bg-primary-700 rounded-lg p-2 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-primary-200" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-50">
                      {prompt.authorName || 'Anonymous'}
                    </p>
                    <p className="text-primary-400 text-sm">View Profile</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related Prompts */}
        {relatedPrompts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary-50 mb-6">
              Related Prompts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPrompts.map((relatedPrompt) => (
                <PromptCard
                  key={relatedPrompt.id}
                  prompt={relatedPrompt}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptDetail;
