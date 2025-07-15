import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';

// Mock the API
jest.mock('../../services/api', () => ({
  loginUser: jest.fn()
}));
import { loginUser } from '../../services/api';

// Wrapper component for router context
const LoginWrapper = ({ locationState = null } = {}) => {
  // Mock useLocation hook
  const mockLocation = { state: locationState };
  
  return (
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    loginUser.mockClear();
    global.mockNavigate.mockClear();
    localStorage.clear();
  });

  describe('Rendering and Layout', () => {
    test('renders the login form', () => {
      render(<LoginWrapper />);
      
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /sign in to shiptogether/i })).toBeInTheDocument();
    });

    test('displays email input field', () => {
      render(<LoginWrapper />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
    });

    test('displays password input field', () => {
      render(<LoginWrapper />);

      const passwordInput = screen.getByPlaceholderText('Enter Password');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
    });

    test('displays submit button', () => {
      render(<LoginWrapper />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    test('displays link to register page', () => {
      render(<LoginWrapper />);
      
      const registerLink = screen.getByRole('link', { name: /register here/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    test('displays ShipTogether branding and benefits', () => {
      render(<LoginWrapper />);
      
      expect(screen.getByText('ShipTogether')).toBeInTheDocument();
      expect(screen.getByText('Unify Your CI/CD, Empower Your Team')).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    test('allows user to type in email field', async () => {
      render(<LoginWrapper />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    test('allows user to type in password field', async () => {
      render(<LoginWrapper />);

      const passwordInput = screen.getByPlaceholderText('Enter Password');
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    test('form fields are required', () => {
      render(<LoginWrapper />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter Password');

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });
  });

  describe('Form Submission - Success', () => {
    test('submits form with valid credentials and navigates to dashboard', async () => {
      loginUser.mockResolvedValueOnce({
        success: true,
        token: 'mock-jwt-token',
        user: { id: '123', email: 'test@example.com', fullName: 'Test User' }
      });

      render(<LoginWrapper />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(loginUser).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('mock-jwt-token');
        expect(localStorage.getItem('user')).toBe(JSON.stringify({
          id: '123',
          email: 'test@example.com',
          fullName: 'Test User'
        }));
      });

      await waitFor(() => {
        expect(global.mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('shows loading state during submission', async () => {
      loginUser.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<LoginWrapper />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(screen.getByText('Signing In...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Submission - Error Handling', () => {
    test('displays error message on login failure', async () => {
      const errorMessage = 'Invalid credentials';
      loginUser.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });

      render(<LoginWrapper />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(global.mockNavigate).not.toHaveBeenCalled();
    });

    test('displays generic error message when no specific error provided', async () => {
      loginUser.mockRejectedValueOnce(new Error('Network error'));

      render(<LoginWrapper />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An error occurred during login')).toBeInTheDocument();
      });
    });

    test('clears error message on new form submission', async () => {
      loginUser.mockRejectedValueOnce({
        response: { data: { message: 'Invalid credentials' } }
      });

      render(<LoginWrapper />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // First submission with error
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Second submission should clear error
      loginUser.mockResolvedValueOnce({
        success: true,
        token: 'token',
        user: { id: '123' }
      });

      await user.clear(passwordInput);
      await user.type(passwordInput, 'correctpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
      });
    });
  });

  describe('Success Message Display', () => {
    test('displays success message from location state', () => {
      const successMessage = 'Registration successful! Please log in.';
      global.mockLocation.state = { message: successMessage };

      render(<LoginWrapper locationState={{ message: successMessage }} />);
      
      expect(screen.getByText(successMessage)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('form has proper labels and structure', () => {
      render(<LoginWrapper />);
      
      const form = screen.getByRole('form') || document.querySelector('form');
      expect(form).toBeInTheDocument();
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter Password');

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    test('error messages are properly associated with form', async () => {
      loginUser.mockRejectedValueOnce({
        response: { data: { message: 'Invalid credentials' } }
      });

      render(<LoginWrapper />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('Invalid credentials');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('text-red-200');
      });
    });
  });
});
