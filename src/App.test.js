import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock Firebase
jest.mock('./firebase/config', () => ({
  auth: {},
  db: {},
  storage: {},
  analytics: {}
}));

// Mock react-firebase-hooks
jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: () => [null, false, null]
}));

const AppWithRouter = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

test('renders Prompt Arena title', () => {
  render(<AppWithRouter />);
  const titleElement = screen.getByText(/Prompt Arena/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders navigation', () => {
  render(<AppWithRouter />);
  const marketplaceLink = screen.getByText(/Marketplace/i);
  expect(marketplaceLink).toBeInTheDocument();
});

test('renders hero section', () => {
  render(<AppWithRouter />);
  const heroText = screen.getByText(/The World's Largest/i);
  expect(heroText).toBeInTheDocument();
});
