import { ReactNode, useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, SkipBack, SkipForward, Settings, Download, Share2, Heart, MoreVertical, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import './MediaComponents.css'

// Image Gallery
interface GalleryImage { id: string; src: string; alt?: string; caption?: string }

interface ImageGalleryProps { images: GalleryImage[]; initialIndex?: number; onClose?: () => void; className?: string }

export function ImageGallery({ images, initialIndex = 0, onClose, className = '' }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [zoom, setZoom] = useState(1)

    const goNext = () => setCurrentIndex((currentIndex + 1) % images.length)
    const goPrev = () => setCurrentIndex((currentIndex - 1 + images.length) % images.length)

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goNext()
            if (e.key === 'ArrowLeft') goPrev()
            if (e.key === 'Escape') onClose?.()
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [currentIndex])

    return (
        <div className={`image-gallery ${className}`}>
            <div className="image-gallery__backdrop" onClick={onClose} />
            <div className="image-gallery__container">
                <button className="image-gallery__close" onClick={onClose}><X size={24} /></button>
                <button className="image-gallery__nav image-gallery__nav--prev" onClick={goPrev}><ChevronLeft size={32} /></button>
                <div className="image-gallery__main">
                    <motion.img key={currentIndex} src={images[currentIndex].src} alt={images[currentIndex].alt}
                        style={{ transform: `scale(${zoom})` }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                    {images[currentIndex].caption && <p className="image-gallery__caption">{images[currentIndex].caption}</p>}
                </div>
                <button className="image-gallery__nav image-gallery__nav--next" onClick={goNext}><ChevronRight size={32} /></button>
                <div className="image-gallery__controls">
                    <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}><ZoomOut size={18} /></button>
                    <span>{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(Math.min(3, zoom + 0.25))}><ZoomIn size={18} /></button>
                </div>
                <div className="image-gallery__thumbnails">
                    {images.map((img, i) => (
                        <button key={img.id} className={`image-gallery__thumb ${i === currentIndex ? 'active' : ''}`} onClick={() => setCurrentIndex(i)}>
                            <img src={img.src} alt="" />
                        </button>
                    ))}
                </div>
                <span className="image-gallery__counter">{currentIndex + 1} / {images.length}</span>
            </div>
        </div>
    )
}

// Video Player
interface VideoPlayerProps { src: string; poster?: string; autoPlay?: boolean; onEnded?: () => void; className?: string }

export function VideoPlayer({ src, poster, autoPlay = false, onEnded, className = '' }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(autoPlay)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)

    const formatTime = (t: number) => {
        const m = Math.floor(t / 60)
        const s = Math.floor(t % 60)
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause()
            else videoRef.current.play()
            setIsPlaying(!isPlaying)
        }
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value)
        setCurrentTime(time)
        if (videoRef.current) videoRef.current.currentTime = time
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            videoRef.current?.parentElement?.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    return (
        <div className={`video-player ${className}`} onMouseEnter={() => setShowControls(true)} onMouseLeave={() => !isPlaying || setShowControls(false)}>
            <video ref={videoRef} src={src} poster={poster} onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)} onEnded={onEnded} onClick={togglePlay} />
            <AnimatePresence>
                {showControls && (
                    <motion.div className="video-player__controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="video-player__progress">
                            <input type="range" min={0} max={duration} value={currentTime} onChange={handleSeek} />
                        </div>
                        <div className="video-player__bar">
                            <button onClick={togglePlay}>{isPlaying ? <Pause size={20} /> : <Play size={20} />}</button>
                            <span className="video-player__time">{formatTime(currentTime)} / {formatTime(duration)}</span>
                            <div className="video-player__right">
                                <button onClick={toggleMute}>{isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
                                <input type="range" className="video-player__volume" min={0} max={1} step={0.1} value={isMuted ? 0 : volume}
                                    onChange={(e) => { setVolume(Number(e.target.value)); if (videoRef.current) videoRef.current.volume = Number(e.target.value) }} />
                                <button onClick={toggleFullscreen}>{isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {!isPlaying && !currentTime && (
                <button className="video-player__big-play" onClick={togglePlay}><Play size={48} /></button>
            )}
        </div>
    )
}

// Media Card
interface MediaItem { id: string; type: 'image' | 'video' | 'audio'; thumbnail: string; title: string; duration?: number; views?: number; likes?: number; author?: { name: string; avatar?: string } }

interface MediaCardProps { item: MediaItem; onPlay?: () => void; onLike?: () => void; onShare?: () => void; className?: string }

export function MediaCard({ item, onPlay, onLike, onShare, className = '' }: MediaCardProps) {
    const formatDuration = (d: number) => {
        const m = Math.floor(d / 60)
        const s = d % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div className={`media-card ${className}`}>
            <div className="media-card__thumbnail" onClick={onPlay}>
                <img src={item.thumbnail} alt="" />
                {item.type === 'video' && item.duration && <span className="media-card__duration">{formatDuration(item.duration)}</span>}
                <div className="media-card__overlay"><Play size={32} /></div>
            </div>
            <div className="media-card__content">
                <h4 className="media-card__title">{item.title}</h4>
                {item.author && (
                    <div className="media-card__author">
                        <div className="media-card__avatar">{item.author.avatar ? <img src={item.author.avatar} alt="" /> : item.author.name.charAt(0)}</div>
                        <span>{item.author.name}</span>
                    </div>
                )}
                <div className="media-card__meta">
                    {item.views !== undefined && <span>{item.views.toLocaleString()} views</span>}
                    {item.likes !== undefined && <span>{item.likes.toLocaleString()} likes</span>}
                </div>
            </div>
            <div className="media-card__actions">
                <button onClick={onLike}><Heart size={16} /></button>
                <button onClick={onShare}><Share2 size={16} /></button>
                <button><MoreVertical size={16} /></button>
            </div>
        </div>
    )
}

// Playlist
interface PlaylistItem { id: string; title: string; thumbnail?: string; duration: number; isPlaying?: boolean }

interface PlaylistProps { items: PlaylistItem[]; currentId?: string; onSelect?: (id: string) => void; title?: string; className?: string }

export function Playlist({ items, currentId, onSelect, title, className = '' }: PlaylistProps) {
    const formatDuration = (d: number) => `${Math.floor(d / 60)}:${(d % 60).toString().padStart(2, '0')}`

    return (
        <div className={`playlist ${className}`}>
            {title && <h4 className="playlist__title">{title}</h4>}
            <div className="playlist__items">
                {items.map((item, i) => (
                    <div key={item.id} className={`playlist__item ${currentId === item.id ? 'playing' : ''}`} onClick={() => onSelect?.(item.id)}>
                        <span className="playlist__num">{currentId === item.id ? <Play size={12} fill="currentColor" /> : i + 1}</span>
                        {item.thumbnail && <img className="playlist__thumb" src={item.thumbnail} alt="" />}
                        <span className="playlist__item-title">{item.title}</span>
                        <span className="playlist__item-duration">{formatDuration(item.duration)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Before/After Slider
interface BeforeAfterSliderProps { beforeSrc: string; afterSrc: string; beforeLabel?: string; afterLabel?: string; className?: string }

export function BeforeAfterSlider({ beforeSrc, afterSrc, beforeLabel = 'Before', afterLabel = 'After', className = '' }: BeforeAfterSliderProps) {
    const [position, setPosition] = useState(50)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
        setPosition(Math.max(0, Math.min(100, (x / rect.width) * 100)))
    }

    return (
        <div ref={containerRef} className={`before-after-slider ${className}`} onMouseMove={handleMove} onTouchMove={handleMove}>
            <img className="before-after-slider__after" src={afterSrc} alt={afterLabel} />
            <div className="before-after-slider__before" style={{ width: `${position}%` }}>
                <img src={beforeSrc} alt={beforeLabel} />
            </div>
            <div className="before-after-slider__handle" style={{ left: `${position}%` }}>
                <div className="before-after-slider__line" />
                <div className="before-after-slider__circle"><ChevronLeft size={12} /><ChevronRight size={12} /></div>
            </div>
            <span className="before-after-slider__label before-after-slider__label--before">{beforeLabel}</span>
            <span className="before-after-slider__label before-after-slider__label--after">{afterLabel}</span>
        </div>
    )
}

export default { ImageGallery, VideoPlayer, MediaCard, Playlist, BeforeAfterSlider }
