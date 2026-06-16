import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import QuizHistory from '../pages/QuizHistory';

// Mock hooks
vi.mock('@/hooks/useLearning', () => ({
  useActiveSession: vi.fn(),
}));

vi.mock('@/hooks/useQuiz', () => ({
  useQuizHistory: vi.fn(),
}));

import { useActiveSession } from '@/hooks/useLearning';
import { useQuizHistory } from '@/hooks/useQuiz';

const sampleHistory = [
  {
    id: 'att-2',
    topic_id: 'react_hooks',
    topic_title: 'React Hooks',
    score: 1.0,
    total_questions: 5,
    correct_answers: 5,
    percentage: 100,
    time_spent_seconds: 180,
    attempt_number: 2,
    created_at: '2026-06-15T10:00:00Z',
  },
  {
    id: 'att-1',
    topic_id: 'react_hooks',
    topic_title: 'React Hooks',
    score: 0.4,
    total_questions: 5,
    correct_answers: 2,
    percentage: 40,
    time_spent_seconds: 120,
    attempt_number: 1,
    created_at: '2026-06-14T10:00:00Z',
  },
  {
    id: 'att-3',
    topic_id: 'react_state',
    topic_title: 'React State Management',
    score: 0.8,
    total_questions: 5,
    correct_answers: 4,
    percentage: 80,
    time_spent_seconds: 200,
    attempt_number: 1,
    created_at: '2026-06-13T10:00:00Z',
  },
];

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/progress']}>
      <Routes>
        <Route path="/progress" element={<QuizHistory />} />
        <Route
          path="/progress/topic/:topicId"
          element={<div data-testid="topic-page-mock" />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('QuizHistory Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page header and stat tiles with empty state', () => {
    vi.mocked(useActiveSession).mockReturnValue({
      data: { id: 'session-1' },
    });
    vi.mocked(useQuizHistory).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderPage();

    // "Riwayat Kuis" appears in BOTH the page title (h1) AND the
    // last breadcrumb crumb. Use getAllByText to assert both.
    const titleMatches = screen.getAllByText(/Riwayat Kuis/i);
    expect(titleMatches.length).toBeGreaterThan(0);

    // Stat tile labels
    expect(screen.getByText(/Total Kuis/i)).toBeInTheDocument();
    expect(screen.getByText(/Rata-rata/i)).toBeInTheDocument();
    expect(screen.getByText(/Skor Terbaik/i)).toBeInTheDocument();
    // Empty-state copy
    expect(
      screen.getByText(/Belum ada riwayat kuis/i)
    ).toBeInTheDocument();
  });

  it('groups attempts by topic and shows topic title + latest score pill', async () => {
    vi.mocked(useActiveSession).mockReturnValue({
      data: { id: 'session-1' },
    });
    vi.mocked(useQuizHistory).mockReturnValue({
      data: sampleHistory,
      isLoading: false,
    });

    renderPage();

    // Both topic titles appear
    expect(screen.getByText('React Hooks')).toBeInTheDocument();
    expect(
      screen.getByText('React State Management')
    ).toBeInTheDocument();

    // Score pills: the page renders the latest attempt per topic in
    // the group header. We assert by querying all score labels and
    // confirming both topics have the expected label.
    const veryGoodLabels = screen.getAllByText('Sangat Baik');
    const goodLabels = screen.getAllByText('Baik');
    expect(veryGoodLabels.length).toBeGreaterThan(0);
    expect(goodLabels.length).toBeGreaterThan(0);
  });

  it('renders per-attempt rows with correct/total, time', () => {
    vi.mocked(useActiveSession).mockReturnValue({
      data: { id: 'session-1' },
    });
    vi.mocked(useQuizHistory).mockReturnValue({
      data: sampleHistory,
      isLoading: false,
    });

    renderPage();

    // Each attempt row shows "X/Y benar" — all 3 attempts.
    expect(screen.getByText('5/5 benar')).toBeInTheDocument();
    expect(screen.getByText('2/5 benar')).toBeInTheDocument();
    expect(screen.getByText('4/5 benar')).toBeInTheDocument();

    // Time spent (in minutes): 180s → 3mnt, 120s → 2mnt, 200s → 3mnt.
    expect(screen.getAllByText('3 mnt').length).toBeGreaterThan(0);
    expect(screen.getByText('2 mnt')).toBeInTheDocument();

    // "Lihat detail" button per topic group (2 topics → 2 buttons)
    const detailButtons = screen.getAllByText(/Lihat detail/i);
    expect(detailButtons.length).toBe(2);

    // Each attempt row shows "Skor NN%" — there are 3 attempts in
    // the sample data.
    expect(screen.getAllByText(/Skor \d+%/i).length).toBe(3);
  });

  it('shows skeleton when loading', () => {
    vi.mocked(useActiveSession).mockReturnValue({
      data: { id: 'session-1' },
    });
    vi.mocked(useQuizHistory).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { container } = renderPage();

    // Skeleton class is present
    expect(container.querySelector('.skeleton-shimmer')).toBeInTheDocument();
    // Empty-state copy NOT present
    expect(
      screen.queryByText(/Belum ada riwayat kuis/i)
    ).not.toBeInTheDocument();
  });
});
