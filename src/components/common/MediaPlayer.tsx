import { ReactNode, useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { Volume2, VolumeX, Play, Pause, Maximize, Minimize, Download, RotateCcw } from 'lucide-react'
import './MediaPlayer.css'

// Video Player
interface VideoPlayerProps {
    src: string
    poster?: string
    autoPlay?: boolean
    loop?: boolean
    muted?: boolean
    controls?: boolean
    onPlay?: () => void
    onPause?: () => void
    onEnded?: () => void
    className?: string
}

export function VideoPlayer({
    src,
    poster,
    autoPlay = false,
    loop = false,
    muted = false,
    controls = true,
    onPlay,
    onPause,
    onEnded,
    className = ''
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(autoPlay)
    const [isMuted, setIsMuted] = useState(muted)
    const [volume, setVolume] = useState(1)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

    const togglePlay = () => {
        if (!videoRef.current) return
        if (isPlaying) {
            videoRef.current.pause()
        } else {
            videoRef.current.play()
        }
    }

    const toggleMute = () => {
        if (!videoRef.current) return
        videoRef.current.muted = !isMuted
        setIsMuted(!isMuted)
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return
        const newVolume = parseFloat(e.target.value)
        videoRef.current.volume = newVolume
        setVolume(newVolume)
        setIsMuted(newVolume === 0)
    }

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current) return
        const rect = e.currentTarget.getBoundingClientRect()
        const pos = (e.clientX - rect.left) / rect.width
        videoRef.current.currentTime = pos * duration
    }

    const toggleFullscreen = () => {
        const container = videoRef.current?.parentElement
        if (!container) return

        if (!document.fullscreenElement) {
            container.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60)
        const secs = Math.floor(time % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handlePlay = () => { setIsPlaying(true); onPlay?.() }
        const handlePause = () => { setIsPlaying(false); onPause?.() }
        const handleEnded = () => { setIsPlaying(false); onEnded?.() }
        const handleTimeUpdate = () => {
            setProgress((video.currentTime / video.duration) * 100)
        }
        const handleLoadedMetadata = () => {
            setDuration(video.duration)
        }

        video.addEventListener('play', handlePlay)
        video.addEventListener('pause', handlePause)
        video.addEventListener('ended', handleEnded)
        video.addEventListener('timeupdate', handleTimeUpdate)
        video.addEventListener('loadedmetadata', handleLoadedMetadata)

        return () => {
            video.removeEventListener('play', handlePlay)
            video.removeEventListener('pause', handlePause)
            video.removeEventListener('ended', handleEnded)
            video.removeEventListener('timeupdate', handleTimeUpdate)
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        }
    }, [onPlay, onPause, onEnded])

    const handleMouseMove = () => {
        setShowControls(true)
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false)
        }, 3000)
    }

    return (
        <div
            className={`video-player ${isFullscreen ? 'video-player--fullscreen' : ''} ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                autoPlay={autoPlay}
                loop={loop}
                muted={muted}
                onClick={togglePlay}
            />

            <AnimatePresence>
                {controls && showControls && (
                    <motion.div
                        className="video-player__controls"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="video-player__progress" onClick={handleSeek}>
                            <div className="video-player__progress-fill" style={{ width: `${progress}%` }} />
                        </div>

                        <div className="video-player__buttons">
                            <button onClick={togglePlay}>
                                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                            </button>

                            <span className="video-player__time">
                                {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                            </span>

                            <div className="video-player__spacer" />

                            <div className="video-player__volume">
                                <button onClick={toggleMute}>
                                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                />
                            </div>

                            <button onClick={toggleFullscreen}>
                                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isPlaying && !showControls && (
                <button className="video-player__big-play" onClick={togglePlay}>
                    <Play size={48} />
                </button>
            )}
        </div>
    )
}

// Audio Player
interface AudioPlayerProps {
    src: string
    title?: string
    artist?: string
    cover?: string
    autoPlay?: boolean
    loop?: boolean
    onPlay?: () => void
    onPause?: () => void
    onEnded?: () => void
    className?: string
}

export function AudioPlayer({
    src,
    title,
    artist,
    cover,
    autoPlay = false,
    loop = false,
    onPlay,
    onPause,
    onEnded,
    className = ''
}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(autoPlay)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)

    const togglePlay = () => {
        if (!audioRef.current) return
        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return
        const pos = parseFloat(e.target.value)
        audioRef.current.currentTime = pos
        setProgress(pos)
    }

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60)
        const secs = Math.floor(time % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const handlePlay = () => { setIsPlaying(true); onPlay?.() }
        const handlePause = () => { setIsPlaying(false); onPause?.() }
        const handleEnded = () => { setIsPlaying(false); onEnded?.() }
        const handleTimeUpdate = () => setProgress(audio.currentTime)
        const handleLoadedMetadata = () => setDuration(audio.duration)

        audio.addEventListener('play', handlePlay)
        audio.addEventListener('pause', handlePause)
        audio.addEventListener('ended', handleEnded)
        audio.addEventListener('timeupdate', handleTimeUpdate)
        audio.addEventListener('loadedmetadata', handleLoadedMetadata)

        return () => {
            audio.removeEventListener('play', handlePlay)
            audio.removeEventListener('pause', handlePause)
            audio.removeEventListener('ended', handleEnded)
            audio.removeEventListener('timeupdate', handleTimeUpdate)
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
        }
    }, [onPlay, onPause, onEnded])

    return (
        <div className={`audio-player ${className}`}>
            <audio ref={audioRef} src={src} autoPlay={autoPlay} loop={loop} />

            {cover && (
                <div className="audio-player__cover">
                    <img src={cover} alt={title || 'Album cover'} />
                </div>
            )}

            <div className="audio-player__info">
                {title && <span className="audio-player__title">{title}</span>}
                {artist && <span className="audio-player__artist">{artist}</span>}
            </div>

            <div className="audio-player__controls">
                <button className="audio-player__play" onClick={togglePlay}>
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <div className="audio-player__progress">
                    <span>{formatTime(progress)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={progress}
                        onChange={handleSeek}
                    />
                    <span>{formatTime(duration)}</span>
                </div>

                <div className="audio-player__volume">
                    <Volume2 size={14} />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value)
                            setVolume(val)
                            if (audioRef.current) audioRef.current.volume = val
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

// Image Viewer with controls
interface ImageViewerProps {
    src: string
    alt?: string
    zoomable?: boolean
    downloadable?: boolean
    className?: string
}

export function ImageViewer({ src, alt = '', zoomable = true, downloadable = true, className = '' }: ImageViewerProps) {
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)

    const resetView = () => {
        setZoom(1)
        setRotation(0)
    }

    const handleDownload = () => {
        const link = document.createElement('a')
        link.href = src
        link.download = alt || 'image'
        link.click()
    }

    return (
        <div className={`image-viewer ${className}`}>
            <div className="image-viewer__canvas">
                <motion.img
                    src={src}
                    alt={alt}
                    style={{
                        scale: zoom,
                        rotate: rotation
                    }}
                    drag={zoom > 1}
                    dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                />
            </div>

            <div className="image-viewer__controls">
                {zoomable && (
                    <>
                        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>-</button>
                        <span>{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(3, z + 0.25))}>+</button>
                    </>
                )}
                <button onClick={() => setRotation(r => r - 90)}>
                    <RotateCcw size={14} />
                </button>
                <button onClick={resetView}>Reset</button>
                {downloadable && (
                    <button onClick={handleDownload}>
                        <Download size={14} />
                    </button>
                )}
            </div>
        </div>
    )
}

export default { VideoPlayer, AudioPlayer, ImageViewer }
