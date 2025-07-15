import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';

// Mock the API
jest.mock('../../services/api', () => ({
  registerUser: jest.fn()
}));
import { registerUser } from '../../services/api';

// Wrapper component for router context
const RegisterWrapper = () => (
  <BrowserRouter>
    <Register />
  </BrowserRouter>
);

describe('Register Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    registerUser.mockClear();
    global.mockNavigate.mockClear();
    localStorage.clear();
  });

  describe('Rendering and Layout', () => {
    test('renders the registration form', () => {
      render(<RegisterWrapper />);
      
      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByText(/start streamlining your ci\/cd today/i)).toBeInTheDocument();
    });

    test('displays all required form fields', () => {
      render(<RegisterWrapper />);

      expect(screen.getByPlaceholderText('Enter Organization ID')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter Full Name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('dev')).toBeInTheDocument(); // Team dropdown default
      expect(screen.getByPlaceholderText('Enter Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    });

    test('displays submit button', () => {
      render(<RegisterWrapper />);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    test('displays link to login page', () => {
      render(<RegisterWrapper />);
      
      const loginLink = screen.getByRole('link', { name: /login here/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    test('displays ShipTogether branding and benefits', () => {
      render(<RegisterWrapper />);
      
      expect(screen.getByText('ShipTogether')).toBeInTheDocument();
      expect(screen.getByText('Unify Your CI/CD, Empower Your Team')).toBeInTheDocument();
    });
  });

  describe('Form Fields and Interaction', () => {
    test('organization ID field works correctly', async () => {
      render(<RegisterWrapper />);

      const orgIdInput = screen.getByPlaceholderText('Enter Organization ID');
      await user.type(orgIdInput, 'test-org-123');

      expect(orgIdInput).toHaveValue('test-org-123');
      expect(orgIdInput).toBeRequired();
    });

    test('email field works correctly', async () => {
      render(<RegisterWrapper />);

      const emailInput = screen.getByPlaceholderText('Enter Email');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toBeRequired();
    });

    test('full name field works correctly', async () => {
      render(<RegisterWrapper />);

      const nameInput = screen.getByPlaceholderText('Enter Full Name');
      await user.type(nameInput, 'John Doe');

      expect(nameInput).toHaveValue('John Doe');
      expect(nameInput).toBeRequired();
    });

    test('team dropdown works correctly', async () => {
      render(<RegisterWrapper />);

      const teamSelect = screen.getByDisplayValue('dev');
      expect(teamSelect).toHaveValue('dev'); // Default value

      await user.selectOptions(teamSelect, 'qa');
      expect(teamSelect).toHaveValue('qa');
    });

    test('password fields work correctly', async () => {
      render(<RegisterWrapper />);

      const passwordInput = screen.getByPlaceholderText('Enter Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');

      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
      expect(confirmPasswordInput).toHaveValue('password123');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Validation', () => {
    test('shows error when passwords do not match', async () => {
      render(<RegisterWrapper />);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      // Fill required fields
      await user.type(screen.getByLabelText(/organization id/i), 'test-org');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
      
      expect(registerUser).not.toHaveBeenCalled();
    });

    test('all required fields must be filled', () => {
      render(<RegisterWrapper />);
      
      const requiredFields = [
        screen.getByLabelText(/organization id/i),
        screen.getByLabelText(/email/i),
        screen.getByLabelText(/full name/i),
        screen.getByLabelText(/^password$/i),
        screen.getByLabelText(/confirm password/i)
      ];
      
      requiredFields.forEach(field => {
        expect(field).toBeRequired();
      });
    });
  });

  describe('Form Submission - Success', () => {
    test('submits form with valid data and navigates to dashboard', async () => {
      registerUser.mockResolvedValueOnce({
        success: true,
        user: {
          id: '123',
          email: 'test@example.com',
          fullName: 'John Doe',
          orgId: 'test-org',
          team: 'dev'
        }
      });

      render(<RegisterWrapper />);
      
      // Fill all form fields
      await user.type(screen.getByLabelText(/organization id/i), 'test-org');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.selectOptions(screen.getByLabelText(/team/i), 'dev');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(registerUser).toHaveBeenCalledWith({
          orgId: 'test-org',
          email: 'test@example.com',
          fullName: 'John Doe',
          team: 'dev',
          password: 'password123'
        });
      });

      await waitFor(() => {
        expect(localStorage.getItem('user')).toBe(JSON.stringify({
          id: '123',
          email: 'test@example.com',
          fullName: 'John Doe',
          orgId: 'test-org',
          team: 'dev'
        }));
      });

      await waitFor(() => {
        expect(global.mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('shows loading state during submission', async () => {
      registerUser.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<RegisterWrapper />);
      
      // Fill all form fields
      await user.type(screen.getByLabelText(/organization id/i), 'test-org');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText('Creating Account...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Submission - Error Handling', () => {
    test('displays error message on registration failure', async () => {
      const errorMessage = 'Email already exists';
      registerUser.mockRejectedValueOnce({
        message: errorMessage
      });

      render(<RegisterWrapper />);
      
      // Fill all form fields
      await user.type(screen.getByLabelText(/organization id/i), 'test-org');
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(global.mockNavigate).not.toHaveBeenCalled();
    });

    test('displays generic error message when no specific error provided', async () => {
      registerUser.mockRejectedValueOnce(new Error('Network error'));

      render(<RegisterWrapper />);
      
      // Fill all form fields
      await user.type(screen.getByLabelText(/organization id/i), 'test-org');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An error occurred during registration')).toBeInTheDocument();
      });
    });

    test('clears error message on new form submission', async () => {
      registerUser.mockRejectedValueOnce({
        message: 'Email already exists'
      });

      render(<RegisterWrapper />);
      
      // Fill form and submit to get error
      await user.type(screen.getByLabelText(/organization id/i), 'test-org');
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });

      // Submit again should clear error
      registerUser.mockResolvedValueOnce({
        success: true,
        user: { id: '123' }
      });

      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Email already exists')).not.toBeInTheDocument();
      });
    });
  });

  describe('Team Selection Options', () => {
    test('displays all team options', () => {
      render(<RegisterWrapper />);
      
      const teamSelect = screen.getByLabelText(/team/i);
      const options = Array.from(teamSelect.options).map(option => option.value);
      
      expect(options).toContain('dev');
      expect(options).toContain('qa');
      expect(options).toContain('devops');
      expect(options).toContain('admin');
    });

    test('has default team selection', () => {
      render(<RegisterWrapper />);
      
      const teamSelect = screen.getByLabelText(/team/i);
      expect(teamSelect).toHaveValue('dev');
    });
  });

  describe('Accessibility', () => {
    test('form has proper labels and structure', () => {
      render(<RegisterWrapper />);
      
      const form = screen.getByRole('form') || document.querySelector('form');
      expect(form).toBeInTheDocument();
      
      const inputs = [
        screen.getByLabelText(/organization id/i),
        screen.getByLabelText(/email/i),
        screen.getByLabelText(/full name/i),
        screen.getByLabelText(/team/i),
        screen.getByLabelText(/^password$/i),
        screen.getByLabelText(/confirm password/i)
      ];
      
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });

    test('error messages are properly displayed', async () => {
      render(<RegisterWrapper />);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('Passwords do not match');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('text-red-200');
      });
    });
  });
});
