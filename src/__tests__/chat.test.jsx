import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import ChatHistoryDrawer from '../components/chat/ChatHistoryDrawer';
import ChatBubble from '../components/chat/ChatBubble';

// Mock Sheet component (uses Radix Dialog)
vi.mock('../components/ui/sheet', () => ({
  Sheet: ({ children, open }) => (open ? <div data-testid="sheet">{children}</div> : null),
  SheetContent: ({ children, side, className }) => (
    <div data-testid="sheet-content" data-side={side} className={className}>
      {children}
    </div>
  ),
  SheetHeader: ({ children }) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }) => <h2 data-testid="sheet-title">{children}</h2>,
  SheetDescription: ({ children }) => <p data-testid="sheet-description">{children}</p>,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  useReducedMotion: () => false,
}));

// Mock MarkdownRenderer
vi.mock('../components/common/MarkdownRenderer', () => ({
  __esModule: true,
  default: ({ content }) => <span>{content}</span>,
}));

describe('ChatHistoryDrawer', () => {
  it('renders topics list when open with data', async () => {
    const topics = [
      { id: '1', title: 'Topic 1' },
      { id: '2', title: 'Topic 2' },
    ];

    render(
      <BrowserRouter>
        <ChatHistoryDrawer
          open={true}
          onOpenChange={vi.fn()}
          topics={topics}
          activeTopicId="1"
          onTopicSelect={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Riwayat Topik')).toBeInTheDocument();
    expect(screen.getByText('Topic 1')).toBeInTheDocument();
    expect(screen.getByText('Topic 2')).toBeInTheDocument();
  });

  it('calls onTopicSelect when topic button is clicked', async () => {
    const mockSelect = vi.fn();
    const topics = [{ id: '1', title: 'Topic 1' }];

    render(
      <BrowserRouter>
        <ChatHistoryDrawer
          open={true}
          onOpenChange={vi.fn()}
          topics={topics}
          activeTopicId="1"
          onTopicSelect={mockSelect}
        />
      </BrowserRouter>
    );

    await userEvent.click(screen.getByText('Topic 1'));
    expect(mockSelect).toHaveBeenCalledWith(topics[0]);
  });

  it('shows empty state when no topics', () => {
    render(
      <BrowserRouter>
        <ChatHistoryDrawer
          open={true}
          onOpenChange={vi.fn()}
          topics={[]}
          activeTopicId=""
          onTopicSelect={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByText(/Belum ada topik/i)).toBeInTheDocument();
  });
});

describe('ChatBubble', () => {
  it('renders AI message with copy button', () => {
    render(
      <ChatBubble message="Test AI response" isAI={true} />
    );

    expect(screen.getByText('Test AI response')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salin pesan/i })).toBeInTheDocument();
  });

  it('renders user message without copy button', () => {
    render(
      <ChatBubble message="Test user message" isAI={false} />
    );

    expect(screen.getByText('Test user message')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Salin pesan/i })).not.toBeInTheDocument();
  });

  it('shows regenerate button on last AI message and calls onRegenerate', async () => {
    const mockRegenerate = vi.fn();

    render(
      <ChatBubble
        message="Test"
        isAI={true}
        isLastAiMessage={true}
        onRegenerate={mockRegenerate}
      />
    );

    const regenerateBtn = screen.getByRole('button', { name: /Regenerasi jawaban/i });
    expect(regenerateBtn).toBeInTheDocument();

    await userEvent.click(regenerateBtn);
    expect(mockRegenerate).toHaveBeenCalled();
  });
});