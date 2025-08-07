import React from 'react';
import { Filter, X } from 'lucide-react';
import Button from '../ui/Button';

const SearchFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'text', label: 'Text Generation' },
    { value: 'image', label: 'Image Generation' },
    { value: 'code', label: 'Code Generation' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'creative', label: 'Creative Writing' },
    { value: 'business', label: 'Business' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' }
  ];

  const aiTools = [
    { value: '', label: 'All Tools' },
    { value: 'chatgpt', label: 'ChatGPT' },
    { value: 'midjourney', label: 'Midjourney' },
    { value: 'dalle', label: 'DALL-E' },
    { value: 'stable-diffusion', label: 'Stable Diffusion' },
    { value: 'claude', label: 'Claude' },
    { value: 'gemini', label: 'Gemini' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Highest Rated' },
    { value: 'sales-desc', label: 'Most Popular' },
    { value: 'views-desc', label: 'Most Viewed' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handlePriceRangeChange = (key, value) => {
    onFiltersChange({
      ...filters,
      priceRange: {
        ...filters.priceRange,
        [key]: Number(value)
      }
    });
  };

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split('-');
    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder
    });
  };

  const hasActiveFilters = () => {
    return filters.category || 
           filters.aiTool || 
           filters.priceRange.min > 0 || 
           filters.priceRange.max < 1000;
  };

  return (
    <div className="card p-6 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary-50 flex items-center">
          <Filter size={20} className="mr-2" />
          Filters
        </h3>
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-primary-400 hover:text-primary-200"
          >
            <X size={16} className="mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-primary-200 mb-2">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full bg-primary-800 border border-primary-600 rounded-lg px-3 py-2 text-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* AI Tool Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-primary-200 mb-2">
          AI Tool
        </label>
        <select
          value={filters.aiTool}
          onChange={(e) => handleFilterChange('aiTool', e.target.value)}
          className="w-full bg-primary-800 border border-primary-600 rounded-lg px-3 py-2 text-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
        >
          {aiTools.map(tool => (
            <option key={tool.value} value={tool.value}>{tool.label}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-primary-200 mb-2">
          Price Range
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange.min || ''}
              onChange={(e) => handlePriceRangeChange('min', e.target.value)}
              className="w-full bg-primary-800 border border-primary-600 rounded px-2 py-1 text-primary-50 text-sm focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
            <span className="text-primary-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max || ''}
              onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              className="w-full bg-primary-800 border border-primary-600 rounded px-2 py-1 text-primary-50 text-sm focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </div>
          <div className="flex items-center space-x-2 text-xs text-primary-400">
            <button
              onClick={() => onFiltersChange({
                ...filters,
                priceRange: { min: 0, max: 0 }
              })}
              className="hover:text-primary-200 transition-colors"
            >
              Free Only
            </button>
            <span>•</span>
            <button
              onClick={() => onFiltersChange({
                ...filters,
                priceRange: { min: 0, max: 1000 }
              })}
              className="hover:text-primary-200 transition-colors"
            >
              All Prices
            </button>
          </div>
        </div>
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-primary-200 mb-2">
          Sort By
        </label>
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full bg-primary-800 border border-primary-600 rounded-lg px-3 py-2 text-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Quick Filters */}
      <div>
        <label className="block text-sm font-medium text-primary-200 mb-2">
          Quick Filters
        </label>
        <div className="space-y-2">
          <button
            onClick={() => onFiltersChange({
              ...filters,
              priceRange: { min: 0, max: 0 }
            })}
            className="w-full text-left px-3 py-2 text-sm text-primary-300 hover:text-primary-50 hover:bg-primary-700 rounded-lg transition-colors"
          >
            Free Prompts
          </button>
          <button
            onClick={() => onFiltersChange({
              ...filters,
              sortBy: 'rating',
              sortOrder: 'desc'
            })}
            className="w-full text-left px-3 py-2 text-sm text-primary-300 hover:text-primary-50 hover:bg-primary-700 rounded-lg transition-colors"
          >
            Top Rated
          </button>
          <button
            onClick={() => onFiltersChange({
              ...filters,
              sortBy: 'createdAt',
              sortOrder: 'desc'
            })}
            className="w-full text-left px-3 py-2 text-sm text-primary-300 hover:text-primary-50 hover:bg-primary-700 rounded-lg transition-colors"
          >
            Recently Added
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
