import { ReactNode, useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, GraduationCap, Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Check, Clock, Award, Star, Trophy, Target, Zap, Lock, Unlock, PlayCircle, RotateCcw } from 'lucide-react'
import './EducationComponents.css'

// Course Card
interface Course { id: string; title: string; instructor: string; thumbnail: string; duration: string; lessons: number; progress?: number; rating?: number; level?: 'beginner' | 'intermediate' | 'advanced' }

interface CourseCardProps { course: Course; onStart?: () => void; onContinue?: () => void; className?: string }

export function CourseCard({ course, onStart, onContinue, className = '' }: CourseCardProps) {
    const levelColors = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' }
    const isStarted = course.progress !== undefined && course.progress > 0

    return (
        <div className={`course-card ${className}`}>
            <div className="course-card__thumbnail">
                <img src={course.thumbnail} alt={course.title} />
                {course.level && (
                    <span className="course-card__level" style={{ background: levelColors[course.level] }}>
                        {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </span>
                )}
                <button className="course-card__play"><PlayCircle size={48} /></button>
            </div>
            <div className="course-card__content">
                <h3 className="course-card__title">{course.title}</h3>
                <span className="course-card__instructor">{course.instructor}</span>
                <div className="course-card__meta">
                    <span><Clock size={12} /> {course.duration}</span>
                    <span><BookOpen size={12} /> {course.lessons} lessons</span>
                </div>
                {course.rating && (
                    <div className="course-card__rating"><Star size={14} fill="currentColor" /> {course.rating.toFixed(1)}</div>
                )}
                {course.progress !== undefined && (
                    <div className="course-card__progress">
                        <div className="course-card__progress-bar" style={{ width: `${course.progress}%` }} />
                        <span>{course.progress}% complete</span>
                    </div>
                )}
                <button className="course-card__cta" onClick={isStarted ? onContinue : onStart}>
                    {isStarted ? 'Continue Learning' : 'Start Course'}
                </button>
            </div>
        </div>
    )
}

// Lesson Player
interface LessonPlayerProps { videoUrl: string; title: string; duration?: string; onComplete?: () => void; className?: string }

export function LessonPlayer({ videoUrl, title, duration, onComplete, className = '' }: LessonPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [muted, setMuted] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause()
            else videoRef.current.play()
            setIsPlaying(!isPlaying)
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100
            setProgress(prog)
            if (prog >= 95) onComplete?.()
        }
    }

    return (
        <div className={`lesson-player ${className}`}>
            <div className="lesson-player__video">
                <video ref={videoRef} src={videoUrl} muted={muted} onTimeUpdate={handleTimeUpdate} />
                <div className="lesson-player__overlay" onClick={togglePlay}>
                    {!isPlaying && <PlayCircle size={64} />}
                </div>
            </div>
            <div className="lesson-player__controls">
                <button onClick={togglePlay}>{isPlaying ? <Pause size={20} /> : <Play size={20} />}</button>
                <div className="lesson-player__progress">
                    <div className="lesson-player__progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="lesson-player__time">{duration}</span>
                <button onClick={() => setMuted(!muted)}>{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
            </div>
            <div className="lesson-player__info">
                <h4>{title}</h4>
            </div>
        </div>
    )
}

// Quiz Question
interface QuizOption { id: string; text: string }
interface QuizQuestionData { question: string; options: QuizOption[]; correctId?: string; explanation?: string }

interface QuizQuestionProps { data: QuizQuestionData; onAnswer?: (optionId: string, isCorrect: boolean) => void; showResult?: boolean; className?: string }

export function QuizQuestion({ data, onAnswer, showResult = true, className = '' }: QuizQuestionProps) {
    const [selected, setSelected] = useState<string | null>(null)
    const [revealed, setRevealed] = useState(false)

    const handleSelect = (id: string) => {
        if (revealed) return
        setSelected(id)
        if (showResult) {
            setRevealed(true)
            onAnswer?.(id, id === data.correctId)
        } else {
            onAnswer?.(id, id === data.correctId)
        }
    }

    return (
        <div className={`quiz-question ${className}`}>
            <h4 className="quiz-question__text">{data.question}</h4>
            <div className="quiz-question__options">
                {data.options.map(opt => {
                    const isSelected = selected === opt.id
                    const isCorrect = revealed && opt.id === data.correctId
                    const isWrong = revealed && isSelected && opt.id !== data.correctId

                    return (
                        <button
                            key={opt.id}
                            className={`quiz-question__option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                            onClick={() => handleSelect(opt.id)}
                            disabled={revealed}
                        >
                            <span className="quiz-question__option-marker">
                                {isCorrect ? <Check size={14} /> : opt.id.toUpperCase()}
                            </span>
                            <span>{opt.text}</span>
                        </button>
                    )
                })}
            </div>
            {revealed && data.explanation && (
                <div className="quiz-question__explanation">{data.explanation}</div>
            )}
        </div>
    )
}

// Progress Tracker
interface ProgressStep { id: string; title: string; completed: boolean; locked?: boolean }

interface ProgressTrackerProps { steps: ProgressStep[]; currentStep?: string; onStepClick?: (id: string) => void; className?: string }

export function ProgressTracker({ steps, currentStep, onStepClick, className = '' }: ProgressTrackerProps) {
    return (
        <div className={`progress-tracker ${className}`}>
            {steps.map((step, i) => (
                <div
                    key={step.id}
                    className={`progress-tracker__step ${step.completed ? 'completed' : ''} ${currentStep === step.id ? 'current' : ''} ${step.locked ? 'locked' : ''}`}
                    onClick={() => !step.locked && onStepClick?.(step.id)}
                >
                    <div className="progress-tracker__marker">
                        {step.completed ? <Check size={14} /> : step.locked ? <Lock size={14} /> : i + 1}
                    </div>
                    <span className="progress-tracker__title">{step.title}</span>
                    {i < steps.length - 1 && <div className="progress-tracker__connector" />}
                </div>
            ))}
        </div>
    )
}

// Achievement Badge
interface Achievement { id: string; name: string; description: string; icon: ReactNode; unlocked: boolean; unlockedAt?: Date; rarity?: 'common' | 'rare' | 'epic' | 'legendary' }

interface AchievementBadgeProps { achievement: Achievement; size?: 'sm' | 'md' | 'lg'; className?: string }

export function AchievementBadge({ achievement, size = 'md', className = '' }: AchievementBadgeProps) {
    const rarityColors = { common: 'var(--apex-steel)', rare: '#3b82f6', epic: '#8b5cf6', legendary: '#f59e0b' }

    return (
        <div className={`achievement-badge achievement-badge--${size} ${achievement.unlocked ? 'unlocked' : 'locked'} ${className}`}
            style={{ '--rarity-color': rarityColors[achievement.rarity || 'common'] } as React.CSSProperties}>
            <div className="achievement-badge__icon">{achievement.icon}</div>
            <div className="achievement-badge__info">
                <span className="achievement-badge__name">{achievement.name}</span>
                <span className="achievement-badge__desc">{achievement.description}</span>
                {achievement.unlocked && achievement.unlockedAt && (
                    <span className="achievement-badge__date">Unlocked {achievement.unlockedAt.toLocaleDateString()}</span>
                )}
            </div>
            {!achievement.unlocked && <div className="achievement-badge__overlay"><Lock size={24} /></div>}
        </div>
    )
}

// Leaderboard
interface LeaderboardEntry { rank: number; name: string; avatar?: string; score: number; badge?: string }

interface LeaderboardProps { entries: LeaderboardEntry[]; currentUserId?: string; title?: string; className?: string }

export function Leaderboard({ entries, currentUserId, title = 'Leaderboard', className = '' }: LeaderboardProps) {
    const medalColors = ['#f59e0b', '#94a3b8', '#cd7f32']

    return (
        <div className={`leaderboard ${className}`}>
            <h4 className="leaderboard__title"><Trophy size={18} /> {title}</h4>
            <div className="leaderboard__list">
                {entries.map(entry => (
                    <div key={entry.rank} className={`leaderboard__entry ${currentUserId === entry.name ? 'highlight' : ''}`}>
                        <span className="leaderboard__rank" style={{ color: medalColors[entry.rank - 1] || 'var(--apex-steel)' }}>
                            {entry.rank <= 3 ? '🏆' : entry.rank}
                        </span>
                        <div className="leaderboard__user">
                            <div className="leaderboard__avatar">
                                {entry.avatar ? <img src={entry.avatar} alt="" /> : entry.name.charAt(0)}
                            </div>
                            <span>{entry.name}</span>
                        </div>
                        <span className="leaderboard__score">{entry.score.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default { CourseCard, LessonPlayer, QuizQuestion, ProgressTracker, AchievementBadge, Leaderboard }
