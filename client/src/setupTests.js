import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockLocation = { state: null };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

// Global test utilities
global.mockNavigate = mockNavigate;
global.mockLocation = mockLocation;

// Reset mocks before each test
beforeEach(() => {
  mockNavigate.mockClear();
  mockLocation.state = null;
  localStorage.clear();
});
