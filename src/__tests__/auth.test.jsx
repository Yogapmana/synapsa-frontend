import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import { useAuthStore } from '../stores/authStore';

// Mock the API calls
vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

describe('Authentication Smoke Tests', () => {
  beforeEach(() => {
    // Clear localStorage and store state
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it('Login form renders with email and password fields', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk/i })).toBeInTheDocument();
  });

  it('Register form validates required fields', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /Daftar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Username minimal 3 karakter/i)).toBeInTheDocument();
      expect(screen.getByText(/Format email tidak valid/i)).toBeInTheDocument();
      expect(screen.getByText(/Password minimal 8 karakter/i)).toBeInTheDocument();
    });
  });

  it('Auth store login and logout persists state correctly', () => {
    const { login, logout } = useAuthStore.getState();
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    const mockToken = 'mock-token';

    // Test Login
    login(mockToken, mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(localStorage.getItem('pla_token')).toBe(mockToken);

    // Test Logout
    logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem('pla_token')).toBeNull();
  });
});
