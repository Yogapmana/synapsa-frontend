import { describe, expect, it } from 'vitest'
import { getYouTubeEmbedUrl, getYouTubeVideoId } from '../youtube'

describe('getYouTubeVideoId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?t=42', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0', 'dQw4w9WgXcQ'],
    ['https://m.youtube.com/watch?v=dQw4w9WgXcQ&list=demo', 'dQw4w9WgXcQ'],
  ])('extracts the ID from %s', (url, expected) => {
    expect(getYouTubeVideoId(url)).toBe(expected)
  })

  it.each([
    '',
    null,
    'not a url',
    'https://example.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com.example.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=too-short',
    'javascript:alert(1)',
  ])('rejects unsupported URL %s', (url) => {
    expect(getYouTubeVideoId(url)).toBeNull()
  })
})

describe('getYouTubeEmbedUrl', () => {
  it('uses the privacy-enhanced embed host', () => {
    expect(getYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    )
  })

  it('returns null for an unsupported URL', () => {
    expect(getYouTubeEmbedUrl('https://example.com/video/dQw4w9WgXcQ')).toBeNull()
  })
})
