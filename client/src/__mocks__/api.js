// Mock API functions for testing
export const registerUser = jest.fn();
export const loginUser = jest.fn();

// Default successful responses
registerUser.mockResolvedValue({
  success: true,
  user: {
    id: '123',
    email: 'test@example.com',
    fullName: 'Test User',
    orgId: 'test-org',
    team: 'dev'
  }
});

loginUser.mockResolvedValue({
  success: true,
  token: 'mock-jwt-token',
  user: {
    id: '123',
    email: 'test@example.com',
    fullName: 'Test User',
    orgId: 'test-org',
    team: 'dev'
  }
});

export default {
  registerUser,
  loginUser
};
