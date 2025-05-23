"use client"

import { useEffect, useRef } from "react"

interface YoutubePlayerProps {
  videoId: string
  onEnd?: () => void
  onPlay?: () => void
  onPause?: () => void
}

export function YoutubePlayer({ videoId, onEnd, onPlay, onPause }: YoutubePlayerProps) {
  const playerRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    // Handle YouTube API events
    const handleYouTubeMessages = (event: MessageEvent) => {
      try {
        if (event.origin !== "https://www.youtube.com") return

        const data = JSON.parse(event.data)

        if (data.event === "onStateChange") {
          // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
          if (data.info === 0 && onEnd) {
            onEnd()
          } else if (data.info === 1 && onPlay) {
            onPlay()
          } else if (data.info === 2 && onPause) {
            onPause()
          }
        }
      } catch (error) {
        // Ignore parsing errors for non-JSON messages
      }
    }

    window.addEventListener("message", handleYouTubeMessages)

    return () => {
      window.removeEventListener("message", handleYouTubeMessages)
    }
  }, [onEnd, onPlay, onPause])

  return (
    <iframe
      ref={playerRef}
      width="100%"
      height="100%"
      src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  )
}
