"use client"

import { useEffect, useRef } from "react"

interface YouTubePlayerProps {
  videoUrl: string
  width?: string | number
  height?: string | number
  autoplay?: boolean
  title?: string
}

// Helper function to extract YouTube video ID from various URL formats
const extractYouTubeId = (url: string): string | null => {
  if (!url) return null

  // Handle empty or invalid URLs
  if (typeof url !== "string" || url.trim() === "") {
    return null
  }

  // Regular YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)

  if (match && match[7].length === 11) {
    return match[7]
  }

  // YouTube Shorts: https://youtube.com/shorts/VIDEO_ID
  const shortsRegExp = /^.*((youtube.com\/shorts\/))\??([^#&?]*).*/
  const shortsMatch = url.match(shortsRegExp)

  if (shortsMatch && shortsMatch[3].length === 11) {
    return shortsMatch[3]
  }

  // Already an ID (11 characters)
  if (url.length === 11) {
    return url
  }

  return null
}

const YouTubePlayer = ({
  videoUrl,
  width = "100%",
  height = "480",
  autoplay = false,
  title = "YouTube video player",
}: YouTubePlayerProps) => {
  const playerRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // If videoUrl changes, update the iframe src
    if (playerRef.current) {
      const videoId = extractYouTubeId(videoUrl)
      if (videoId) {
        playerRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0`
      }
    }
  }, [videoUrl, autoplay])

  const videoId = extractYouTubeId(videoUrl)

  if (!videoId) {
    return (
      <div
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
          color: "#666",
          borderRadius: "8px",
        }}
      >
        Invalid YouTube URL
      </div>
    )
  }

  return (
    <iframe
      ref={playerRef}
      width={width}
      height={height}
      src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0`}
      title={title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="rounded-lg"
    />
  )
}

export default YouTubePlayer
export { YouTubePlayer as YoutubePlayer }
