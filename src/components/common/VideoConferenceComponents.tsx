import { ReactNode, useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, Users, MessageSquare, Settings, Hand, Share2, MoreVertical, Maximize2, Minimize2, Grid, Pin, Camera, Volume2, VolumeX } from 'lucide-react'
import './VideoConferenceComponents.css'

// Participant Video
interface Participant { id: string; name: string; avatar?: string; isSpeaking?: boolean; isMuted?: boolean; isVideoOff?: boolean; isPinned?: boolean }

interface ParticipantVideoProps { participant: Participant; isLocal?: boolean; isSpeaking?: boolean; onPin?: () => void; size?: 'sm' | 'md' | 'lg' | 'full'; className?: string }

export function ParticipantVideo({ participant, isLocal = false, isSpeaking = false, onPin, size = 'md', className = '' }: ParticipantVideoProps) {
    return (
        <div className={`participant-video participant-video--${size} ${isSpeaking ? 'speaking' : ''} ${participant.isPinned ? 'pinned' : ''} ${className}`}>
            <div className="participant-video__container">
                {participant.isVideoOff ? (
                    <div className="participant-video__avatar">
                        {participant.avatar ? <img src={participant.avatar} alt="" /> : participant.name.charAt(0)}
                    </div>
                ) : (
                    <video autoPlay muted={isLocal} playsInline />
                )}
            </div>
            <div className="participant-video__overlay">
                <div className="participant-video__info">
                    <span className="participant-video__name">{isLocal ? 'You' : participant.name}</span>
                    {participant.isMuted && <MicOff size={12} />}
                </div>
                <div className="participant-video__actions">
                    {onPin && <button onClick={onPin}><Pin size={14} /></button>}
                </div>
            </div>
        </div>
    )
}

// Video Controls Bar
interface VideoControlsProps { isMuted?: boolean; isVideoOff?: boolean; isScreenSharing?: boolean; isHandRaised?: boolean; onToggleMute?: () => void; onToggleVideo?: () => void; onToggleScreen?: () => void; onToggleHand?: () => void; onLeave?: () => void; onOpenChat?: () => void; onOpenParticipants?: () => void; className?: string }

export function VideoControlsBar({
    isMuted = false,
    isVideoOff = false,
    isScreenSharing = false,
    isHandRaised = false,
    onToggleMute,
    onToggleVideo,
    onToggleScreen,
    onToggleHand,
    onLeave,
    onOpenChat,
    onOpenParticipants,
    className = ''
}: VideoControlsProps) {
    return (
        <div className={`video-controls-bar ${className}`}>
            <div className="video-controls-bar__main">
                <button className={`video-controls-bar__btn ${isMuted ? 'off' : ''}`} onClick={onToggleMute}>
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button className={`video-controls-bar__btn ${isVideoOff ? 'off' : ''}`} onClick={onToggleVideo}>
                    {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                </button>
                <button className={`video-controls-bar__btn ${isScreenSharing ? 'active' : ''}`} onClick={onToggleScreen}>
                    <Monitor size={20} />
                </button>
                <button className={`video-controls-bar__btn ${isHandRaised ? 'active' : ''}`} onClick={onToggleHand}>
                    <Hand size={20} />
                </button>
            </div>
            <div className="video-controls-bar__secondary">
                <button onClick={onOpenChat}><MessageSquare size={20} /></button>
                <button onClick={onOpenParticipants}><Users size={20} /></button>
                <button><Settings size={20} /></button>
            </div>
            <button className="video-controls-bar__leave" onClick={onLeave}><PhoneOff size={20} /> Leave</button>
        </div>
    )
}

// Participant List
interface ParticipantListProps { participants: Participant[]; onMute?: (id: string) => void; onPin?: (id: string) => void; onRemove?: (id: string) => void; className?: string }

export function ParticipantList({ participants, onMute, onPin, onRemove, className = '' }: ParticipantListProps) {
    return (
        <div className={`participant-list ${className}`}>
            <div className="participant-list__header">
                <Users size={16} /> <span>Participants ({participants.length})</span>
            </div>
            <div className="participant-list__items">
                {participants.map(p => (
                    <div key={p.id} className="participant-list__item">
                        <div className="participant-list__avatar">
                            {p.avatar ? <img src={p.avatar} alt="" /> : p.name.charAt(0)}
                            {p.isSpeaking && <span className="participant-list__speaking-indicator" />}
                        </div>
                        <span className="participant-list__name">{p.name}</span>
                        <div className="participant-list__actions">
                            <button onClick={() => onMute?.(p.id)} className={p.isMuted ? 'muted' : ''}>
                                {p.isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                            </button>
                            <button onClick={() => onPin?.(p.id)} className={p.isPinned ? 'pinned' : ''}>
                                <Pin size={14} />
                            </button>
                            <button className="more"><MoreVertical size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Video Grid Layout
interface VideoGridProps { participants: Participant[]; pinnedId?: string; onPin?: (id: string) => void; className?: string }

export function VideoGrid({ participants, pinnedId, onPin, className = '' }: VideoGridProps) {
    const pinned = participants.find(p => p.id === pinnedId)
    const others = participants.filter(p => p.id !== pinnedId)
    const gridCols = pinned ? 1 : Math.ceil(Math.sqrt(participants.length))

    return (
        <div className={`video-grid ${pinned ? 'video-grid--pinned' : ''} ${className}`} style={{ '--grid-cols': gridCols } as React.CSSProperties}>
            {pinned && (
                <div className="video-grid__pinned">
                    <ParticipantVideo participant={pinned} size="full" onPin={() => onPin?.(pinned.id)} />
                </div>
            )}
            <div className="video-grid__tiles">
                {(pinned ? others : participants).map(p => (
                    <ParticipantVideo key={p.id} participant={p} size={pinned ? 'sm' : 'md'} onPin={() => onPin?.(p.id)} />
                ))}
            </div>
        </div>
    )
}

// Meeting Timer
interface MeetingTimerProps { startTime: Date; className?: string }

export function MeetingTimer({ startTime, className = '' }: MeetingTimerProps) {
    const [elapsed, setElapsed] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000))
        }, 1000)
        return () => clearInterval(interval)
    }, [startTime])

    const hours = Math.floor(elapsed / 3600)
    const minutes = Math.floor((elapsed % 3600) / 60)
    const seconds = elapsed % 60

    return (
        <div className={`meeting-timer ${className}`}>
            <span className="meeting-timer__dot" />
            <span>{hours > 0 && `${hours}:`}{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
        </div>
    )
}

// Pre-Call Setup
interface PreCallSetupProps { onJoin?: () => void; onCancel?: () => void; className?: string }

export function PreCallSetup({ onJoin, onCancel, className = '' }: PreCallSetupProps) {
    const [videoOn, setVideoOn] = useState(true)
    const [micOn, setMicOn] = useState(true)

    return (
        <div className={`pre-call-setup ${className}`}>
            <div className="pre-call-setup__preview">
                <video autoPlay muted playsInline />
                {!videoOn && <div className="pre-call-setup__avatar"><Camera size={32} /></div>}
            </div>
            <div className="pre-call-setup__controls">
                <button className={!micOn ? 'off' : ''} onClick={() => setMicOn(!micOn)}>
                    {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <button className={!videoOn ? 'off' : ''} onClick={() => setVideoOn(!videoOn)}>
                    {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
                </button>
            </div>
            <div className="pre-call-setup__actions">
                <button className="pre-call-setup__cancel" onClick={onCancel}>Cancel</button>
                <button className="pre-call-setup__join" onClick={onJoin}>Join Meeting</button>
            </div>
        </div>
    )
}

export default { ParticipantVideo, VideoControlsBar, ParticipantList, VideoGrid, MeetingTimer, PreCallSetup }
