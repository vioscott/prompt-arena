import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPrompts } from '../firebase/firestore';
import {
  Search,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
  Brain
} from 'lucide-react';
import Button from '../components/ui/Button';
import CategoryGrid from '../components/marketplace/CategoryGrid';
import PromptCard from '../components/prompts/PromptCard';

const Home = () => {
  const { user } = useAuth();
  const [featuredPrompts, setFeaturedPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFeaturedPrompts = async () => {
      try {
        const { prompts } = await getPrompts({ sortBy: 'rating', sortOrder: 'desc' }, null, 6);
        setFeaturedPrompts(prompts);
      } catch (error) {
        console.error('Error fetching featured prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPrompts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "High-Quality Prompts",
      description: "Curated prompts from expert AI creators that produce better outputs"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Save Time & Money",
      description: "Skip the trial-and-error process and reduce your API costs"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Expert Community",
      description: "Learn from and connect with top prompt engineers worldwide"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Monetize Your Skills",
      description: "Sell your prompts and earn from your AI expertise"
    }
  ];



  return (
    <div className="min-h-screen bg-primary-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-50 mb-6">
              The World's Largest
              <span className="block gradient-text">AI Prompt Marketplace</span>
            </h1>
            <p className="text-xl text-primary-300 mb-8 max-w-3xl mx-auto">
              Discover 210,000+ curated AI prompts made by expert creators. 
              Produce better outputs, save time & API costs, or sell your own prompts.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search for prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-32 py-4 text-lg bg-primary-800 border border-primary-600 rounded-full text-primary-50 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                />
                <Search className="absolute left-4 top-4 h-6 w-6 text-primary-400" />
                <Button
                  type="submit"
                  className="absolute right-2 top-2 rounded-full"
                  size="lg"
                >
                  Search
                </Button>
              </form>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/marketplace">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Prompts
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {!user && (
                <Link to="/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Start Selling
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gradient-to-br from-primary-800/30 to-primary-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-50 mb-4">
              Browse by Category
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Find the perfect prompts for your specific needs
            </p>
          </div>

          <CategoryGrid />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-50 mb-4">
              Why Choose PromptBase?
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Join thousands of creators and businesses using our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-accent-400 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary-50 mb-2">
                  {feature.title}
                </h3>
                <p className="text-primary-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Prompts Section */}
      <section className="py-16 bg-gradient-to-br from-primary-800/20 to-accent-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-primary-50 mb-4">
                Featured Prompts
              </h2>
              <p className="text-primary-300">
                Top-rated prompts from our community
              </p>
            </div>
            <Link to="/marketplace">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-6">
                  <div className="skeleton h-48 mb-4"></div>
                  <div className="skeleton h-4 mb-2"></div>
                  <div className="skeleton h-4 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-50 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-300 mb-8">
            Join thousands of creators and businesses using AI prompts to enhance their work
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/marketplace">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Prompts
              </Button>
            </Link>
            <Link to={user ? "/sell" : "/register"}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {user ? "Start Selling" : "Join as Seller"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
