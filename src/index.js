import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#343a40',
            color: '#f8f9fa',
            border: '1px solid #495057',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f8f9fa',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f8f9fa',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
