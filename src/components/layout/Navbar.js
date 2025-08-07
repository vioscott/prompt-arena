import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Settings,
  Plus,
  Heart,
  Package
} from 'lucide-react';
import Button from '../ui/Button';

const Navbar = () => {
  const { user, userProfile, signOut } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const cartItemCount = getItemCount();

  return (
    <nav className="glass border-b border-primary-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold gradient-text">Prompt Arena</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-primary-800 border border-primary-600 rounded-lg text-primary-50 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/marketplace"
              className="text-primary-300 hover:text-primary-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Marketplace
            </Link>

            {user ? (
              <>
                <Link
                  to="/sell"
                  className="flex items-center space-x-1 text-primary-300 hover:text-primary-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  <span>Sell</span>
                </Link>

                <Link
                  to="/cart"
                  className="relative p-2 text-primary-300 hover:text-primary-50 transition-colors"
                >
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-primary-800 transition-colors"
                  >
                    {userProfile?.photoURL ? (
                      <img
                        src={userProfile.photoURL}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <User size={16} className="text-primary-200" />
                      </div>
                    )}
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-primary-800/95 backdrop-blur-md rounded-md shadow-xl border border-primary-600/50 py-1 z-50">
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-primary-200 hover:bg-primary-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings size={16} className="mr-2" />
                        Dashboard
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-2 text-sm text-primary-200 hover:bg-primary-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Package size={16} className="mr-2" />
                        Orders
                      </Link>
                      <Link
                        to="/favorites"
                        className="flex items-center px-4 py-2 text-sm text-primary-200 hover:bg-primary-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Heart size={16} className="mr-2" />
                        Favorites
                      </Link>
                      <hr className="my-1 border-primary-600" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-primary-200 hover:bg-primary-700"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-primary-300 hover:text-primary-50 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-primary-800 border border-primary-600 rounded-lg text-primary-50 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-primary-700 bg-primary-900">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/marketplace"
              className="block px-3 py-2 text-primary-300 hover:text-primary-50 hover:bg-primary-800 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Marketplace
            </Link>

            {user ? (
              <>
                <Link
                  to="/sell"
                  className="block px-3 py-2 text-primary-300 hover:text-primary-50 hover:bg-primary-800 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sell Prompts
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center justify-between px-3 py-2 text-primary-300 hover:text-primary-50 hover:bg-primary-800 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Cart</span>
                  {cartItemCount > 0 && (
                    <span className="bg-secondary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-primary-300 hover:text-primary-50 hover:bg-primary-800 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/orders"
                  className="block px-3 py-2 text-primary-300 hover:text-primary-50 hover:bg-primary-800 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Orders
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-primary-300 hover:text-primary-50 hover:bg-primary-800 rounded-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-primary-300 hover:text-primary-50 hover:bg-primary-800 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-primary-300 hover:text-primary-50 hover:bg-primary-800 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
