# Prompt Arena - AI Prompt Marketplace

A full-stack marketplace for buying and selling AI prompts, built with React.js and Firebase.

## Features

### 🎯 Core Features
- **User Authentication** - Sign up/in with email or Google
- **Prompt Marketplace** - Browse, search, and filter AI prompts
- **Prompt Upload** - Sell your own AI prompts
- **Shopping Cart** - Add prompts to cart and checkout
- **Payment Processing** - Secure payments via Stripe
- **User Dashboard** - Manage your prompts and orders
- **Categories & Search** - Organized browsing experience

### 🛠 Technical Features
- **React.js** - Modern frontend framework
- **Firebase** - Authentication, Firestore database, and storage
- **Stripe** - Payment processing
- **Tailwind CSS** - Responsive design system
- **React Router** - Client-side routing
- **Context API** - State management

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Firebase project
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prompt-arena
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Fill in your Firebase and Stripe configuration:
   ```env
   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=your-app-id
   REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

   # Stripe Configuration
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
   ```

4. **Set up Firebase**
   - Create a new Firebase project
   - Enable Authentication (Email/Password and Google)
   - Create Firestore database
   - Enable Storage
   - Add your domain to authorized domains

5. **Set up Stripe**
   - Create a Stripe account
   - Get your publishable key
   - Set up webhooks for payment processing

6. **Start the development server**
   ```bash
   npm start
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Navbar, Footer)
│   ├── marketplace/    # Marketplace-specific components
│   ├── payment/        # Payment components
│   ├── prompts/        # Prompt-related components
│   └── ui/             # Basic UI components
├── contexts/           # React Context providers
├── firebase/           # Firebase configuration and utilities
├── pages/              # Page components
├── utils/              # Utility functions
└── App.js              # Main application component
```

## Firebase Setup

### Firestore Collections

1. **users**
   ```javascript
   {
     displayName: string,
     email: string,
     photoURL: string,
     role: 'user' | 'seller' | 'admin',
     totalSales: number,
     totalEarnings: number,
     createdAt: timestamp
   }
   ```

2. **prompts**
   ```javascript
   {
     title: string,
     description: string,
     prompt: string,
     category: string,
     aiTool: string,
     price: number,
     imageUrl: string,
     userId: string,
     authorName: string,
     status: 'pending' | 'approved' | 'rejected',
     views: number,
     sales: number,
     rating: number,
     createdAt: timestamp
   }
   ```

3. **orders**
   ```javascript
   {
     promptId: string,
     buyerId: string,
     sellerId: string,
     amount: number,
     paymentIntentId: string,
     status: 'pending' | 'completed' | 'failed',
     createdAt: timestamp
   }
   ```

### Security Rules

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read approved prompts
    match /prompts/{promptId} {
      allow read: if resource.data.status == 'approved';
      allow create, update: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Users can read their own orders
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.buyerId || 
         request.auth.uid == resource.data.sellerId);
      allow create: if request.auth != null && request.auth.uid == request.resource.data.buyerId;
    }
  }
}
```

## Deployment

### Frontend (Vercel/Netlify)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Set environment variables** in your deployment platform

### Backend (Serverless Functions)

The API functions in the `api/` directory can be deployed as:
- **Vercel Functions** - Automatically deployed with the frontend
- **Netlify Functions** - Place in `netlify/functions/`
- **Firebase Functions** - Convert to Firebase Cloud Functions

## Environment Variables

### Required for Frontend
- `REACT_APP_FIREBASE_*` - Firebase configuration
- `REACT_APP_STRIPE_PUBLISHABLE_KEY` - Stripe public key

### Required for Backend
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `FIREBASE_*` - Firebase admin credentials

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@promptarena.com or create an issue in the repository.
