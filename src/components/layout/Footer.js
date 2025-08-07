import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary-900 border-t border-primary-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold gradient-text">Prompt Arena</span>
            </Link>
            <p className="text-primary-300 mb-4 max-w-md">
              The world's largest marketplace for AI prompts. Buy and sell high-quality prompts 
              for ChatGPT, Midjourney, DALL-E, and more.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-200 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-200 transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="mailto:hello@promptarena.com"
                className="text-primary-400 hover:text-primary-200 transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-primary-50 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/marketplace"
                  className="text-primary-300 hover:text-primary-50 transition-colors"
                >
                  Browse Prompts
                </Link>
              </li>
              <li>
                <Link
                  to="/sell"
                  className="text-primary-300 hover:text-primary-50 transition-colors"
                >
                  Sell Prompts
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-primary-300 hover:text-primary-50 transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-primary-300 hover:text-primary-50 transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-primary-50 font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-primary-300 hover:text-primary-50 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-primary-300 hover:text-primary-50 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-primary-300 hover:text-primary-50 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-primary-300 hover:text-primary-50 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-400 text-sm">
            © 2024 Prompt Arena. All rights reserved.
          </p>
          <p className="text-primary-400 text-sm flex items-center mt-2 md:mt-0">
            Made with ReactJS and Firebase
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
