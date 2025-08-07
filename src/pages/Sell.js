import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPrompts } from '../firebase/firestore';
import { Plus, DollarSign, Eye } from 'lucide-react';
import Button from '../components/ui/Button';
import PromptUpload from '../components/prompts/PromptUpload';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Sell = () => {
  const { user } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [userPrompts, setUserPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalEarnings: 0,
    totalViews: 0
  });

  useEffect(() => {
    const fetchUserPrompts = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { prompts } = await getPrompts({ userId: user.uid });
        setUserPrompts(prompts);

        // Calculate stats
        const totalViews = prompts.reduce((sum, prompt) => sum + (prompt.views || 0), 0);
        const totalEarnings = prompts.reduce((sum, prompt) =>
          sum + ((prompt.sales || 0) * (prompt.price || 0)), 0
        );

        setStats({
          totalPrompts: prompts.length,
          totalEarnings,
          totalViews
        });
      } catch (error) {
        console.error('Error fetching user prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPrompts();
  }, [user]);

  const handleUploadSuccess = () => {
    // Refresh the prompts list
    if (user) {
      getPrompts({ userId: user.uid }).then(({ prompts }) => {
        setUserPrompts(prompts);
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-50 mb-2">
              Sell Your Prompts
            </h1>
            <p className="text-primary-300">
              Share your expertise and earn from your AI prompts
            </p>
          </div>

          <Button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 md:mt-0"
          >
            <Plus size={16} className="mr-2" />
            Upload New Prompt
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-400 text-sm font-medium">
                  Total Prompts
                </p>
                <p className="text-2xl font-bold text-primary-50 mt-1">
                  {stats.totalPrompts}
                </p>
              </div>
              <div className="text-accent-400">
                <Plus size={24} />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-400 text-sm font-medium">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold text-primary-50 mt-1">
                  ${stats.totalEarnings.toFixed(2)}
                </p>
              </div>
              <div className="text-secondary-400">
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-400 text-sm font-medium">
                  Total Views
                </p>
                <p className="text-2xl font-bold text-primary-50 mt-1">
                  {stats.totalViews}
                </p>
              </div>
              <div className="text-accent-300">
                <Eye size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Selling Tips */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold text-primary-50 mb-4">
            Tips for Successful Selling
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-primary-50 mb-2">Write Clear Titles</h3>
              <p className="text-primary-300 text-sm">
                Use descriptive titles that clearly explain what your prompt does
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary-50 mb-2">Add Preview Images</h3>
              <p className="text-primary-300 text-sm">
                Show examples of what your prompt can generate
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary-50 mb-2">Detailed Descriptions</h3>
              <p className="text-primary-300 text-sm">
                Explain the use cases and benefits of your prompt
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary-50 mb-2">Fair Pricing</h3>
              <p className="text-primary-300 text-sm">
                Research similar prompts to set competitive prices
              </p>
            </div>
          </div>
        </div>

        {/* User's Prompts */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-primary-50 mb-6">
            Your Prompts ({userPrompts.length})
          </h2>

          {userPrompts.length === 0 ? (
            <div className="text-center py-12">
              <Plus size={48} className="mx-auto text-primary-600 mb-4" />
              <h3 className="text-lg font-medium text-primary-50 mb-2">
                No prompts yet
              </h3>
              <p className="text-primary-300 mb-6">
                Start by uploading your first prompt to begin earning
              </p>
              <Button onClick={() => setShowUploadModal(true)}>
                <Plus size={16} className="mr-2" />
                Upload Your First Prompt
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userPrompts.map((prompt) => (
                <div key={prompt.id} className="flex items-center justify-between p-4 bg-primary-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {prompt.imageUrl && (
                      <img
                        src={prompt.imageUrl}
                        alt={prompt.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-primary-50 mb-1">
                        {prompt.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-primary-400">
                        <span>${prompt.price}</span>
                        <span>{prompt.views || 0} views</span>
                        <span>{prompt.sales || 0} sales</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      prompt.status === 'approved'
                        ? 'bg-accent-500/20 text-accent-400'
                        : prompt.status === 'pending'
                        ? 'bg-secondary-500/20 text-secondary-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {prompt.status}
                    </span>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        <PromptUpload
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      </div>
    </div>
  );
};

export default Sell;
