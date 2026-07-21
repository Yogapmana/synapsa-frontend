const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
])

// YouTube video IDs are normally 11 URL-safe characters.
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

function getUrlPathSegments(url) {
  return url.pathname.split('/').filter(Boolean)
}

/**
 * Return the YouTube video ID for supported YouTube URL formats.
 * Returns null for malformed, unsupported, or non-YouTube URLs.
 */
export function getYouTubeVideoId(value) {
  if (!value || typeof value !== 'string') return null

  let url
  try {
    url = new URL(value.trim())
  } catch {
    return null
  }

  if (!['http:', 'https:'].includes(url.protocol)) return null

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '')
  if (!YOUTUBE_HOSTS.has(hostname)) return null

  const segments = getUrlPathSegments(url)
  let videoId = null

  if (hostname === 'youtu.be') {
    videoId = segments[0] || null
  } else if (segments[0] === 'watch') {
    videoId = url.searchParams.get('v')
  } else if (['shorts', 'embed', 'live'].includes(segments[0])) {
    videoId = segments[1] || null
  }

  return videoId && VIDEO_ID_PATTERN.test(videoId) ? videoId : null
}

/**
 * Build a privacy-enhanced YouTube embed URL from a supported source URL.
 */
export function getYouTubeEmbedUrl(value) {
  const videoId = getYouTubeVideoId(value)
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null
}
