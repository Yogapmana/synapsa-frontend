import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Module from '../pages/Module';
import { useModule } from '@/hooks/useLearning';

// Mock hooks
vi.mock('@/hooks/useLearning', () => ({
  useModule: vi.fn(),
  useCompleteTopic: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

vi.mock('@/hooks/useProgress', () => ({
  useSubmitSignal: vi.fn(() => ({ mutate: vi.fn() })),
}));

// Mock components to avoid complex deep rendering
vi.mock('@/components/module/ModuleTopbar', () => ({
  default: () => <div data-testid="module-topbar">Topbar</div>,
}));

vi.mock('@/components/module/ReadingTracker', () => ({
  default: () => <div data-testid="reading-tracker">Tracker</div>,
}));

vi.mock('@/components/module/StickyActionBar', () => ({
  default: () => (
    <div data-testid="sticky-action-bar">
      <button>Rating</button>
      <button>Tandai Selesai</button>
    </div>
  ),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useParams: () => ({ topicId: 'react-101' }),
  useNavigate: () => vi.fn(),
}));

describe('Module Page Smoke Tests', () => {
  it('Module page renders content and actions when data is loaded', async () => {
    const mockModule = {
      title: 'Introduction to React',
      content_markdown: '# Hello React\nThis is a test module.',
      sources: [],
      courses: [],
      estimated_read_minutes: 5,
    };

    vi.mocked(useModule).mockReturnValue({
      data: mockModule,
      isLoading: false,
      error: null,
    });

    render(<Module />);

    // Check for title
    expect(screen.getByText(/Introduction to React/i)).toBeInTheDocument();
    
    // Check for markdown content area
    expect(screen.getByText(/This is a test module/i)).toBeInTheDocument();

    // Check for actions in StickyActionBar
    expect(screen.getByTestId('sticky-action-bar')).toBeInTheDocument();
    expect(screen.getByText(/Rating/i)).toBeInTheDocument();
    expect(screen.getByText(/Tandai Selesai/i)).toBeInTheDocument();
  });

  it('Module page renders empty state when module not found', () => {
    vi.mocked(useModule).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Not found'),
    });

    render(<Module />);

    expect(screen.getByText(/Modul tidak ditemukan/i)).toBeInTheDocument();
  });
});
