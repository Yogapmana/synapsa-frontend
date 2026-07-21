import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ResourceCard from '../ResourceCard'

const youtubeSource = {
  title: 'Belajar React Dasar',
  type: 'video',
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
}

function ResourceList({ sources }) {
  const [activeVideoUrl, setActiveVideoUrl] = useState(null)

  return sources.map((source) => (
    <ResourceCard
      key={source.url}
      source={source}
      activeVideoUrl={activeVideoUrl}
      onToggleVideo={setActiveVideoUrl}
    />
  ))
}

describe('ResourceCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a YouTube player only after the user requests playback', () => {
    render(<ResourceList sources={[youtubeSource]} />)

    expect(screen.queryByTitle('Video: Belajar React Dasar')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Putar di sini' }))

    const player = screen.getByTitle('Video: Belajar React Dasar')
    expect(player).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    )
    expect(player).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin')
    expect(player).toHaveAttribute('allowfullscreen')
    expect(screen.getByRole('button', { name: 'Tutup video' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('closes the active player when a different YouTube source is opened', () => {
    const secondSource = {
      title: 'Belajar JavaScript Dasar',
      type: 'video',
      url: 'https://youtu.be/9bZkp7q19f0',
    }
    render(<ResourceList sources={[youtubeSource, secondSource]} />)

    fireEvent.click(screen.getAllByRole('button', { name: 'Putar di sini' })[0])
    expect(screen.getByTitle('Video: Belajar React Dasar')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: 'Putar di sini' })[0])
    expect(screen.queryByTitle('Video: Belajar React Dasar')).not.toBeInTheDocument()
    expect(screen.getByTitle('Video: Belajar JavaScript Dasar')).toBeInTheDocument()
  })

  it('opens non-YouTube sources in a new tab', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(
      <ResourceCard
        source={{
          title: 'Artikel React',
          type: 'article',
          url: 'https://react.dev/learn',
        }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /artikel react/i }))

    expect(openSpy).toHaveBeenCalledWith(
      'https://react.dev/learn',
      '_blank',
      'noopener,noreferrer',
    )
  })
})
