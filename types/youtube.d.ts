interface YT {
  Player: {
    new (
      elementId: string,
      options: {
        videoId: string
        playerVars?: {
          autoplay?: 0 | 1
          controls?: 0 | 1
          rel?: 0 | 1
          showinfo?: 0 | 1
          mute?: 0 | 1
          modestbranding?: 0 | 1
          loop?: 0 | 1
          playlist?: string
          start?: number
          end?: number
          playsinline?: 0 | 1
        }
        events?: {
          onReady?: (event: YT.PlayerEvent) => void
          onStateChange?: (event: YT.OnStateChangeEvent) => void
          onPlaybackQualityChange?: (event: YT.PlaybackQualityChangeEvent) => void
          onPlaybackRateChange?: (event: YT.PlaybackRateChangeEvent) => void
          onError?: (event: YT.OnErrorEvent) => void
          onApiChange?: (event: YT.ApiChangeEvent) => void
        }
        width?: number | string
        height?: number | string
      },
    ): YT.Player
  }
  PlayerState: {
    UNSTARTED: -1
    ENDED: 0
    PLAYING: 1
    PAUSED: 2
    BUFFERING: 3
    CUED: 5
  }
}

declare namespace YT {
  interface Player {
    // Queueing functions
    loadVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void
    loadVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string): void
    cueVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void
    cueVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string): void

    // Playing functions
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    seekTo(seconds: number, allowSeekAhead?: boolean): void

    // Volume functions
    mute(): void
    unMute(): void
    isMuted(): boolean
    setVolume(volume: number): void
    getVolume(): number

    // Playback rate functions
    setPlaybackRate(suggestedRate: number): void
    getPlaybackRate(): number
    getAvailablePlaybackRates(): number[]

    // Playback status
    getVideoLoadedFraction(): number
    getPlayerState(): number
    getCurrentTime(): number
    getPlaybackQuality(): string
    setPlaybackQuality(suggestedQuality: string): void
    getAvailableQualityLevels(): string[]

    // Sizing functions
    setSize(width: number | string, height: number | string): object
    getVideoUrl(): string
    getVideoEmbedCode(): string

    // Playlist functions
    getPlaylist(): string[]
    getPlaylistIndex(): number

    // Event listeners
    addEventListener(event: string, listener: (event: CustomEvent) => void): void
    removeEventListener(event: string, listener: (event: CustomEvent) => void): void

    // DOM functions
    destroy(): void
  }

  interface PlayerEvent {
    target: Player
  }

  interface OnStateChangeEvent extends PlayerEvent {
    data: number
  }

  interface PlaybackQualityChangeEvent extends PlayerEvent {
    data: string
  }

  interface PlaybackRateChangeEvent extends PlayerEvent {
    data: number
  }

  interface OnErrorEvent extends PlayerEvent {
    data: number
  }

  interface ApiChangeEvent extends PlayerEvent {}
}

declare interface Window {
  YT: YT
  onYouTubeIframeAPIReady: () => void
}
