import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ModuleChatPanel from '../ModuleChatSlider'

vi.mock('@/api/chat', () => ({
  getHistory: vi.fn(() => Promise.resolve([])),
  sendMessage: vi.fn(),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}))

function renderPanel() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <ModuleChatPanel
        sessionId="session-1"
        topicId="topic-1"
        moduleTitle="Introduction to React"
      />
    </QueryClientProvider>,
  )
}

describe('ModuleChatPanel split pane / floating trigger', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query) => ({
        matches: query.includes('min-width: 1024px'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    })
  })

  it('renders the floating semi-circle open button when collapsed', () => {
    renderPanel()
    const trigger = screen.getByRole('button', { name: 'Buka Tutor AI' })
    expect(trigger).toBeInTheDocument()
    expect(trigger.className).toContain('rounded-l-full')
    expect(trigger.className).toContain('fixed')
    expect(trigger.className).toContain('right-0')
  })

  it('opens the in-layout sidebar and can close it', async () => {
    renderPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Buka Tutor AI' }))

    expect(await screen.findByText('module.tutor_title')).toBeInTheDocument()
    expect(screen.getByText('Introduction to React')).toBeInTheDocument()
    expect(screen.getByLabelText('Tutup Tutor AI')).toBeInTheDocument()

    // Desktop split pane mounts a resize handle
    expect(screen.getByRole('separator', { name: 'Resize Tutor AI panel' })).toBeInTheDocument()

    // Trigger hides while open
    expect(screen.queryByRole('button', { name: 'Buka Tutor AI' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Tutup Tutor AI'))
    expect(await screen.findByRole('button', { name: 'Buka Tutor AI' })).toBeInTheDocument()
  })

  it('is non-blocking: no dark overlay and no body scroll lock', async () => {
    renderPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Buka Tutor AI' }))
    await screen.findByText('module.tutor_title')

    // Desktop split pane is not a Radix dialog overlay
    expect(document.querySelector('[data-radix-dialog-overlay]')).toBeNull()

    // Body remains scrollable
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(document.body).not.toHaveAttribute('data-scroll-locked')
  })
})
