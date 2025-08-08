import React, { useState } from 'react';
import { seedPrompts, seedCategories } from '../utils/seedData';
import Button from '../components/ui/Button';
import { Database, CheckCircle, AlertCircle } from 'lucide-react';

const SeedData = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (message, type = 'info') => {
    setResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleSeedPrompts = async () => {
    setLoading(true);
    try {
      addResult('Starting to seed prompts...', 'info');
      await seedPrompts();
      addResult('✅ Successfully seeded prompts!', 'success');
    } catch (error) {
      addResult(`❌ Error seeding prompts: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedCategories = async () => {
    setLoading(true);
    try {
      addResult('Starting to seed categories...', 'info');
      await seedCategories();
      addResult('✅ Successfully seeded categories!', 'success');
    } catch (error) {
      addResult(`❌ Error seeding categories: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAll = async () => {
    setLoading(true);
    setResults([]);
    try {
      addResult('Starting to seed all data...', 'info');
      
      await seedCategories();
      addResult('✅ Categories seeded successfully!', 'success');
      
      await seedPrompts();
      addResult('✅ Prompts seeded successfully!', 'success');
      
      addResult('🎉 All data seeded successfully!', 'success');
    } catch (error) {
      addResult(`❌ Error seeding data: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-primary-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <Database size={64} className="mx-auto text-accent-400 mb-4" />
          <h1 className="text-3xl font-bold text-primary-50 mb-2">
            Database Seeding Tool
          </h1>
          <p className="text-primary-300">
            Add sample data to your Firestore database for testing and development
          </p>
        </div>

        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold text-primary-50 mb-4">
            Seed Database
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button
              onClick={handleSeedCategories}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Seed Categories
            </Button>
            
            <Button
              onClick={handleSeedPrompts}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Seed Prompts
            </Button>
            
            <Button
              onClick={handleSeedAll}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Seeding...' : 'Seed All Data'}
            </Button>
          </div>

          <div className="text-sm text-primary-400">
            <p className="mb-2">
              <strong>Categories:</strong> Adds 8 sample categories (Text, Image, Code, Marketing, etc.)
            </p>
            <p className="mb-2">
              <strong>Prompts:</strong> Adds 10 sample prompts across different categories
            </p>
            <p>
              <strong>Seed All:</strong> Adds both categories and prompts in the correct order
            </p>
          </div>
        </div>

        {results.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-50">
                Seeding Results
              </h3>
              <Button
                onClick={clearResults}
                variant="ghost"
                size="sm"
              >
                Clear
              </Button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 p-3 rounded-lg ${
                    result.type === 'success'
                      ? 'bg-green-500/10 border border-green-500/20'
                      : result.type === 'error'
                      ? 'bg-red-500/10 border border-red-500/20'
                      : 'bg-primary-800 border border-primary-600'
                  }`}
                >
                  {result.type === 'success' ? (
                    <CheckCircle size={16} className="text-green-400 mt-0.5" />
                  ) : result.type === 'error' ? (
                    <AlertCircle size={16} className="text-red-400 mt-0.5" />
                  ) : (
                    <Database size={16} className="text-accent-400 mt-0.5" />
                  )}
                  
                  <div className="flex-1">
                    <p className={`text-sm ${
                      result.type === 'success'
                        ? 'text-green-300'
                        : result.type === 'error'
                        ? 'text-red-300'
                        : 'text-primary-200'
                    }`}>
                      {result.message}
                    </p>
                    <p className="text-xs text-primary-500 mt-1">
                      {result.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle size={20} className="text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-yellow-300 font-medium mb-2">Important Notes:</h4>
              <ul className="text-yellow-200 text-sm space-y-1">
                <li>• This tool is for development and testing purposes only</li>
                <li>• Make sure you're connected to the correct Firebase project</li>
                <li>• Seeding will add new documents to your Firestore database</li>
                <li>• You can run this multiple times, but it will create duplicate data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeedData;
