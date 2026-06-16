import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Module from '../pages/Module';
import { useModule } from '@/hooks/useLearning';

// Mock hooks
vi.mock('@/hooks/useLearning', () => ({
  useModule: vi.fn(),
  useTopics: vi.fn(() => ({ data: [] })),
  useCurriculum: vi.fn(() => ({ data: null })),
  useCompleteTopic: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

vi.mock('@/hooks/useProgress', () => ({
  useSubmitSignal: vi.fn(() => ({ mutate: vi.fn() })),
}));

// Mock components to avoid complex deep rendering
vi.mock('@/components/module/ModuleTopbar', () => ({
  default: ({ module }) => (
    <div data-testid="module-topbar">
      {module ? `Topbar: ${module.title}` : 'Topbar'}
    </div>
  ),
}));

vi.mock('@/components/module/ReadingTracker', () => ({
  default: () => <div data-testid="reading-tracker">Tracker</div>,
}));

vi.mock('@/components/module/ModuleContent', () => ({
  // Title is shown in the topbar (not in the article body, see
  // Module.jsx Phase fix — duplicate H1 was removed). The mock here
  // echoes whatever was passed in so we can assert against the body
  // content.
  default: ({ content, topicTitle }) => (
    <div data-testid="module-content" data-topic-title={topicTitle || ''}>
      {content}
    </div>
  ),
}));

vi.mock('@/components/module/StickyActionBar', () => ({
  default: () => (
    <div data-testid="sticky-action-bar">
      <button>Rating</button>
      <button>Tandai Selesai</button>
    </div>
  ),
}));

// Chat panel is now ALWAYS visible (no toggle) — the module page
// renders it as a persistent right sidebar once a module is loaded.
vi.mock('@/components/module/ModuleChatSlider', () => ({
  default: ({ moduleTitle }) => (
    <aside data-testid="module-chat-panel" data-topic={moduleTitle || ''}>
      Chat Panel
    </aside>
  ),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useParams: () => ({ topicId: 'react-101' }),
  useNavigate: () => vi.fn(),
}));

describe('Module Page Smoke Tests', () => {
  it('Module page renders content, action bar, and persistent chat panel when data is loaded', () => {
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

    // Title is shown in the topbar (single source of truth after
    // duplicate-H1 fix), not in the article body.
    expect(screen.getByTestId('module-topbar')).toHaveTextContent(
      /Introduction to React/i
    );

    // Markdown body is rendered via ModuleContent (with topicTitle
    // passed in so the H1-strip logic can run).
    expect(screen.getByTestId('module-content')).toHaveAttribute(
      'data-topic-title',
      'Introduction to React'
    );
    expect(screen.getByText(/This is a test module/i)).toBeInTheDocument();

    // StickyActionBar still hosts the feedback widgets and the primary
    // "Tandai Selesai" button.
    expect(screen.getByTestId('sticky-action-bar')).toBeInTheDocument();
    expect(screen.getByText(/Rating/i)).toBeInTheDocument();
    expect(screen.getByText(/Tandai Selesai/i)).toBeInTheDocument();

    // The chat panel is now ALWAYS visible (no toggle, no FAB) — it's
    // a persistent right sidebar that appears once the module is
    // loaded, with the topic shown in the header pill.
    expect(screen.getByTestId('module-chat-panel')).toBeInTheDocument();
    expect(screen.getByTestId('module-chat-panel')).toHaveAttribute(
      'data-topic',
      'Introduction to React'
    );
  });

  it('Chat panel is NOT rendered when the module is still loading', () => {
    vi.mocked(useModule).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<Module />);

    // Topbar is there, but the chat panel isn't (we don't have a
    // topic to show in the header yet).
    expect(screen.getByTestId('module-topbar')).toBeInTheDocument();
    expect(screen.queryByTestId('module-chat-panel')).not.toBeInTheDocument();
  });

  it('Module page renders empty state when module not found', () => {
    vi.mocked(useModule).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Not found'),
    });

    render(<Module />);

    expect(screen.getByText(/Modul tidak ditemukan/i)).toBeInTheDocument();
    expect(screen.queryByTestId('module-chat-panel')).not.toBeInTheDocument();
  });
});
