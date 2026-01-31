import { ReactNode, useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart, ListMusic, Mic, Radio, Download, Share2, MoreHorizontal } from 'lucide-react'
import './AudioComponents.css'

// Audio Player
interface Track { id: string; title: string; artist: string; album?: string; artwork?: string; duration: number; src: string }

interface AudioPlayerProps { track: Track; onNext?: () => void; onPrevious?: () => void; onLike?: () => void; isLiked?: boolean; className?: string }

export function AudioPlayer({ track, onNext, onPrevious, onLike, isLiked = false, className = '' }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [volume, setVolume] = useState(80)
    const [muted, setMuted] = useState(false)
    const [shuffle, setShuffle] = useState(false)
    const [repeat, setRepeat] = useState<'off' | 'one' | 'all'>('off')
    const audioRef = useRef<HTMLAudioElement>(null)

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60)
        const ss = Math.floor(s % 60)
        return `${m}:${ss.toString().padStart(2, '0')}`
    }

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause()
            else audioRef.current.play()
            setIsPlaying(!isPlaying)
        }
    }

    const handleTimeUpdate = () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime)
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value)
        setCurrentTime(time)
        if (audioRef.current) audioRef.current.currentTime = time
    }

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = muted ? 0 : volume / 100
        }
    }, [volume, muted])

    return (
        <div className={`audio-player ${className}`}>
            <audio ref={audioRef} src={track.src} onTimeUpdate={handleTimeUpdate} />

            <div className="audio-player__track">
                <div className="audio-player__artwork">
                    {track.artwork ? <img src={track.artwork} alt="" /> : <Music size={24} />}
                </div>
                <div className="audio-player__info">
                    <span className="audio-player__title">{track.title}</span>
                    <span className="audio-player__artist">{track.artist}</span>
                </div>
                <button className={`audio-player__like ${isLiked ? 'liked' : ''}`} onClick={onLike}>
                    <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
            </div>

            <div className="audio-player__controls">
                <button className={shuffle ? 'active' : ''} onClick={() => setShuffle(!shuffle)}><Shuffle size={16} /></button>
                <button onClick={onPrevious}><SkipBack size={20} /></button>
                <button className="audio-player__play" onClick={togglePlay}>
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button onClick={onNext}><SkipForward size={20} /></button>
                <button className={repeat !== 'off' ? 'active' : ''} onClick={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')}>
                    <Repeat size={16} />
                    {repeat === 'one' && <span className="audio-player__repeat-one">1</span>}
                </button>
            </div>

            <div className="audio-player__progress">
                <span>{formatTime(currentTime)}</span>
                <input type="range" min={0} max={track.duration} value={currentTime} onChange={handleSeek} />
                <span>{formatTime(track.duration)}</span>
            </div>

            <div className="audio-player__volume">
                <button onClick={() => setMuted(!muted)}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
                <input type="range" min={0} max={100} value={muted ? 0 : volume} onChange={(e) => setVolume(Number(e.target.value))} />
            </div>
        </div>
    )
}

// Track List
interface TrackListProps { tracks: Track[]; currentTrackId?: string; onSelect?: (track: Track) => void; className?: string }

export function TrackList({ tracks, currentTrackId, onSelect, className = '' }: TrackListProps) {
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`

    return (
        <div className={`track-list ${className}`}>
            {tracks.map((track, i) => (
                <div key={track.id} className={`track-list__item ${currentTrackId === track.id ? 'playing' : ''}`} onClick={() => onSelect?.(track)}>
                    <span className="track-list__num">{currentTrackId === track.id ? <Music size={14} /> : i + 1}</span>
                    <div className="track-list__artwork">
                        {track.artwork ? <img src={track.artwork} alt="" /> : <Music size={16} />}
                    </div>
                    <div className="track-list__info">
                        <span className="track-list__title">{track.title}</span>
                        <span className="track-list__artist">{track.artist}</span>
                    </div>
                    <span className="track-list__duration">{formatTime(track.duration)}</span>
                    <button className="track-list__more"><MoreHorizontal size={16} /></button>
                </div>
            ))}
        </div>
    )
}

// Waveform Visualizer
interface WaveformVisualizerProps { peaks: number[]; progress?: number; onSeek?: (progress: number) => void; className?: string }

export function WaveformVisualizer({ peaks, progress = 0, onSeek, className = '' }: WaveformVisualizerProps) {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const p = x / rect.width
        onSeek?.(p)
    }

    return (
        <div className={`waveform-visualizer ${className}`} onClick={handleClick}>
            <div className="waveform-visualizer__bars">
                {peaks.map((peak, i) => (
                    <div key={i} className={`waveform-visualizer__bar ${i / peaks.length <= progress ? 'active' : ''}`}
                        style={{ height: `${peak * 100}%` }} />
                ))}
            </div>
        </div>
    )
}

// Equalizer
interface EqualizerProps { bands: { frequency: string; value: number }[]; onChange?: (index: number, value: number) => void; className?: string }

export function Equalizer({ bands, onChange, className = '' }: EqualizerProps) {
    return (
        <div className={`equalizer ${className}`}>
            <h4 className="equalizer__title">Equalizer</h4>
            <div className="equalizer__bands">
                {bands.map((band, i) => (
                    <div key={i} className="equalizer__band">
                        <input type="range" min={-12} max={12} value={band.value} onChange={(e) => onChange?.(i, Number(e.target.value))}
                            className="equalizer__slider" />
                        <span className="equalizer__freq">{band.frequency}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Podcast Card
interface Podcast { id: string; title: string; host: string; artwork: string; episodeCount: number; latestEpisode?: string }

interface PodcastCardProps { podcast: Podcast; onPlay?: () => void; onSubscribe?: () => void; subscribed?: boolean; className?: string }

export function PodcastCard({ podcast, onPlay, onSubscribe, subscribed = false, className = '' }: PodcastCardProps) {
    return (
        <div className={`podcast-card ${className}`}>
            <div className="podcast-card__artwork">
                <img src={podcast.artwork} alt="" />
                <button className="podcast-card__play" onClick={onPlay}><Play size={24} /></button>
            </div>
            <div className="podcast-card__content">
                <h4 className="podcast-card__title">{podcast.title}</h4>
                <span className="podcast-card__host">{podcast.host}</span>
                <span className="podcast-card__episodes">{podcast.episodeCount} episodes</span>
                {podcast.latestEpisode && <span className="podcast-card__latest">{podcast.latestEpisode}</span>}
                <button className={`podcast-card__subscribe ${subscribed ? 'subscribed' : ''}`} onClick={onSubscribe}>
                    {subscribed ? 'Subscribed' : 'Subscribe'}
                </button>
            </div>
        </div>
    )
}

export default { AudioPlayer, TrackList, WaveformVisualizer, Equalizer, PodcastCard }
