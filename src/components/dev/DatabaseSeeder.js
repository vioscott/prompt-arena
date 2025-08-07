import React, { useState } from 'react';
import { seedPrompts, seedCategories } from '../../utils/seedData';
import { Database, Play, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

const DatabaseSeeder = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleSeedPrompts = async () => {
    setLoading(true);
    setError('');
    setStatus('Seeding prompts database...');
    
    try {
      await seedPrompts();
      setStatus('✅ Successfully seeded prompts database!');
    } catch (err) {
      setError(`❌ Error seeding prompts: ${err.message}`);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedCategories = async () => {
    setLoading(true);
    setError('');
    setStatus('Seeding categories database...');
    
    try {
      await seedCategories();
      setStatus('✅ Successfully seeded categories database!');
    } catch (err) {
      setError(`❌ Error seeding categories: ${err.message}`);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAll = async () => {
    setLoading(true);
    setError('');
    setStatus('Seeding all data...');
    
    try {
      await seedCategories();
      setStatus('Categories seeded, now seeding prompts...');
      await seedPrompts();
      setStatus('✅ Successfully seeded all data!');
    } catch (err) {
      setError(`❌ Error seeding data: ${err.message}`);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Database className="h-6 w-6 text-accent-400 mr-2" />
        <h2 className="text-xl font-semibold text-primary-50">
          Development Database Seeder
        </h2>
      </div>
      
      <p className="text-primary-300 mb-6">
        Use these tools to populate your Firestore database with sample data for development and testing.
      </p>

      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSeedCategories}
            disabled={loading}
            loading={loading}
            variant="outline"
            className="flex-1"
          >
            <Play size={16} className="mr-2" />
            Seed Categories
          </Button>
          
          <Button
            onClick={handleSeedPrompts}
            disabled={loading}
            loading={loading}
            variant="outline"
            className="flex-1"
          >
            <Play size={16} className="mr-2" />
            Seed Prompts
          </Button>
        </div>
        
        <Button
          onClick={handleSeedAll}
          disabled={loading}
          loading={loading}
          className="w-full"
        >
          <Play size={16} className="mr-2" />
          Seed All Data
        </Button>
      </div>

      {/* Status Messages */}
      {status && (
        <div className="flex items-center p-3 bg-accent-500/10 border border-accent-500/20 rounded-lg mb-4">
          <CheckCircle size={16} className="text-accent-400 mr-2 flex-shrink-0" />
          <span className="text-accent-300 text-sm">{status}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
          <AlertCircle size={16} className="text-red-400 mr-2 flex-shrink-0" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}

      {/* Sample Data Info */}
      <div className="bg-primary-800/50 p-4 rounded-lg">
        <h3 className="text-primary-50 font-medium mb-2">Sample Data Includes:</h3>
        <ul className="text-primary-300 text-sm space-y-1">
          <li>• 10 sample prompts across different categories</li>
          <li>• 8 predefined categories with descriptions</li>
          <li>• Realistic view counts, sales, and ratings</li>
          <li>• Sample images from Unsplash</li>
          <li>• Various AI tools (ChatGPT, Midjourney, DALL-E)</li>
          <li>• Different price points and user profiles</li>
        </ul>
      </div>

      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-yellow-300 text-sm">
          <strong>Note:</strong> This will add data to your Firestore database. 
          Make sure you're using a development/test project, not production.
        </p>
      </div>
    </div>
  );
};

export default DatabaseSeeder;
