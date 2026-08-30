export function extractYouTubeId(
  url: string | undefined | null,
): string | null {
  if (!url) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

export function extractVimeoId(url: string | undefined | null): string | null {
  if (!url) return null
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

export function getVimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`
}

export function isGoogleDriveUrl(url: string | undefined | null): boolean {
  if (!url) return false
  return url.includes('drive.google.com')
}

export function convertGoogleDriveUrl(url: string | undefined | null): string {
  if (!url) return ''
  // Convert sharing URLs to direct view URLs
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
  if (fileIdMatch) {
    return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`
  }
  return url
}
