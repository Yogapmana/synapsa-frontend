import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import Dashboard from '../pages/Dashboard';
import { useAuthStore } from '../stores/authStore';
import { useLearningStore } from '../stores/learningStore';

// Mock the API calls
vi.mock('../api/learning', () => ({
  getSessions: vi.fn(() => Promise.resolve([])),
  getCurriculum: vi.fn(() => Promise.resolve([])),
}));

vi.mock('../api/quiz', () => ({
  getQuizHistory: vi.fn(() => Promise.resolve([])),
}));

// Mock CountUp component to avoid animation issues in tests
vi.mock('../components/dashboard/CountUp', () => ({
  CountUp: ({ end }) => <span>{end}</span>,
}));

describe('Dashboard Smoke Tests', () => {
  it('Dashboard renders greeting and stat cards when data is loaded', async () => {
    // Setup store states
    const mockUser = { id: 1, username: 'TestUser', email: 'test@example.com' };
    const mockSession = { id: 1, topic: 'React', feedback_action: null };
    
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
    useLearningStore.setState({ activeSession: mockSession, streak: 5 });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Check for greeting - GreetingHero uses getTimeGreeting which depends on current time
    // But it always includes the username and "Selamat"
    expect(await screen.findByText(/TestUser/i)).toBeInTheDocument();
    expect(screen.getByText(/Selamat/i)).toBeInTheDocument();

    // Check for StatCards content - "Streak" and "Topik Selesai"
    expect(screen.getAllByText(/Streak/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Topik Selesai/i)).toBeInTheDocument();
    expect(screen.getByText(/Rata-rata Kuis/i)).toBeInTheDocument();
    
    // Check for "Topik Hari Ini" (TodayTopicCard)
    expect(screen.getByText(/Topik Hari Ini/i)).toBeInTheDocument();
  });
});
