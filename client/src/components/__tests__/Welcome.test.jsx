import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Welcome from '../Welcome';

// Wrapper component for router context
const WelcomeWrapper = () => (
  <BrowserRouter>
    <Welcome />
  </BrowserRouter>
);

describe('Welcome Component', () => {
  beforeEach(() => {
    render(<WelcomeWrapper />);
  });

  describe('Rendering and Content', () => {
    test('renders the main heading with app name', () => {
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Welcome to ShipTogether');
    });

    test('displays the tagline', () => {
      const tagline = screen.getByText('Unify Your CI/CD, Empower Your Team.');
      expect(tagline).toBeInTheDocument();
    });

    test('shows the app description', () => {
      const description = screen.getByText(/ShipTogether streamlines your CI\/CD pipelines/);
      expect(description).toBeInTheDocument();
    });

    test('displays the DevOps image', () => {
      const image = screen.getByAltText('CI/CD Pipeline');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/images/Devops.jpg');
    });

    test('renders the "Why Choose ShipTogether?" section', () => {
      const sectionHeading = screen.getByRole('heading', { level: 2 });
      expect(sectionHeading).toHaveTextContent('Why Choose ShipTogether?');
    });
  });

  describe('Navigation Links', () => {
    test('renders Login button with correct link', () => {
      const loginButton = screen.getByRole('link', { name: /login/i });
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveAttribute('href', '/login');
    });

    test('renders Register button with correct link', () => {
      const registerButton = screen.getByRole('link', { name: /register/i });
      expect(registerButton).toBeInTheDocument();
      expect(registerButton).toHaveAttribute('href', '/register');
    });

    test('Login button has correct styling classes', () => {
      const loginButton = screen.getByRole('link', { name: /login/i });
      expect(loginButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'text-white');
    });

    test('Register button has correct styling classes', () => {
      const registerButton = screen.getByRole('link', { name: /register/i });
      expect(registerButton).toHaveClass('bg-white', 'hover:bg-gray-100', 'text-blue-900');
    });
  });

  describe('Statistics Section', () => {
    test('displays faster deployments statistic', () => {
      const speedStat = screen.getByText('50%');
      expect(speedStat).toBeInTheDocument();

      const speedDescription = screen.getByText('Faster Deployments');
      expect(speedDescription).toBeInTheDocument();
    });

    test('displays error reduction statistic', () => {
      const errorStat = screen.getByText('30%');
      expect(errorStat).toBeInTheDocument();

      const errorDescription = screen.getByText('Error Reduction');
      expect(errorDescription).toBeInTheDocument();
    });

    test('displays team efficiency statistic', () => {
      const efficiencyStat = screen.getByText('2x');
      expect(efficiencyStat).toBeInTheDocument();

      const efficiencyDescription = screen.getByText('Team Efficiency');
      expect(efficiencyDescription).toBeInTheDocument();
    });
  });

  describe('Features Section', () => {
    test('displays Automated Pipelines feature', () => {
      const featureTitle = screen.getByRole('heading', { level: 3, name: /automated pipelines/i });
      expect(featureTitle).toBeInTheDocument();
      
      const featureDescription = screen.getByText(/Configure and automate your build, test, and deploy stages/);
      expect(featureDescription).toBeInTheDocument();
    });

    test('displays Real-Time Monitoring feature', () => {
      const featureTitle = screen.getByRole('heading', { level: 3, name: /real-time monitoring/i });
      expect(featureTitle).toBeInTheDocument();
      
      const featureDescription = screen.getByText(/Track pipeline performance and catch issues instantly/);
      expect(featureDescription).toBeInTheDocument();
    });

    test('displays Team Collaboration feature', () => {
      const featureTitle = screen.getByRole('heading', { level: 3, name: /team collaboration/i });
      expect(featureTitle).toBeInTheDocument();
      
      const featureDescription = screen.getByText(/Enable seamless communication and role-based access/);
      expect(featureDescription).toBeInTheDocument();
    });
  });

  describe('Layout and Structure', () => {
    test('has proper page structure with main container', () => {
      const mainContainer = document.querySelector('.min-h-screen');
      expect(mainContainer).toBeInTheDocument();
    });

    test('contains hero section with gradient background', () => {
      const heroSection = document.querySelector('.bg-gradient-to-br');
      expect(heroSection).toBeInTheDocument();
    });

    test('contains features grid layout', () => {
      const featuresGrid = document.querySelector('.grid');
      expect(featuresGrid).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      const h3Elements = screen.getAllByRole('heading', { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      expect(h3Elements).toHaveLength(6); // Three stats + three feature headings
    });

    test('image has proper alt text', () => {
      const image = screen.getByAltText('CI/CD Pipeline');
      expect(image).toBeInTheDocument();
    });

    test('navigation links are accessible', () => {
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2); // Login and Register links
      
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });
  });
});
