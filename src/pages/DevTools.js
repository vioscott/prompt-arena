import React from 'react';
import DatabaseSeeder from '../components/dev/DatabaseSeeder';
import { Code, Database, Settings } from 'lucide-react';

const DevTools = () => {
  return (
    <div className="min-h-screen bg-primary-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Code className="h-12 w-12 text-accent-400" />
          </div>
          <h1 className="text-3xl font-bold text-primary-50 mb-4">
            Development Tools
          </h1>
          <p className="text-primary-300 max-w-2xl mx-auto">
            Tools and utilities for development and testing. Use these to set up sample data 
            and test various features of the application.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Database Seeder */}
          <div className="lg:col-span-2">
            <DatabaseSeeder />
          </div>

          {/* Additional Dev Tools */}
          <div className="card p-6">
            <div className="flex items-center mb-4">
              <Database className="h-5 w-5 text-secondary-400 mr-2" />
              <h3 className="text-lg font-semibold text-primary-50">
                Database Status
              </h3>
            </div>
            <p className="text-primary-300 text-sm mb-4">
              Check the current state of your Firestore database and collections.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-400">Environment:</span>
                <span className="text-accent-400">Development</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-400">Project ID:</span>
                <span className="text-primary-300">prompt-arena-c4143</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-400">Region:</span>
                <span className="text-primary-300">us-central1</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center mb-4">
              <Settings className="h-5 w-5 text-secondary-400 mr-2" />
              <h3 className="text-lg font-semibold text-primary-50">
                Configuration
              </h3>
            </div>
            <p className="text-primary-300 text-sm mb-4">
              Current application configuration and environment variables.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-400">App Name:</span>
                <span className="text-primary-300">{process.env.REACT_APP_APP_NAME}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-400">Environment:</span>
                <span className="text-primary-300">{process.env.NODE_ENV}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-400">Firebase Project:</span>
                <span className="text-primary-300">{process.env.REACT_APP_FIREBASE_PROJECT_ID}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-primary-50 mb-4">
            Getting Started
          </h3>
          <div className="space-y-4 text-primary-300">
            <div>
              <h4 className="font-medium text-primary-200 mb-2">1. Set up Firebase</h4>
              <p className="text-sm">
                Make sure your Firebase project is properly configured with Authentication, 
                Firestore, and Storage enabled.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-primary-200 mb-2">2. Seed the Database</h4>
              <p className="text-sm">
                Use the Database Seeder above to populate your Firestore with sample prompts 
                and categories for testing.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-primary-200 mb-2">3. Test Features</h4>
              <p className="text-sm">
                Navigate through the application to test authentication, browsing prompts, 
                cart functionality, and other features.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-primary-200 mb-2">4. Remove Dev Tools</h4>
              <p className="text-sm">
                Remember to remove or restrict access to these development tools before 
                deploying to production.
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-300 text-sm">
            <strong>⚠️ Development Only:</strong> These tools should only be used in development 
            environments. Do not expose these tools in production as they can modify your database.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevTools;
