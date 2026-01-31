import { ReactNode, useState, useCallback, useRef, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, Loader2, Check, X, AlertCircle } from 'lucide-react'
import './VoiceInterface.css'

// Voice Context
interface VoiceContextType {
    isListening: boolean
    isSupported: boolean
    transcript: string
    startListening: () => void
    stopListening: () => void
    clearTranscript: () => void
}

const VoiceContext = createContext<VoiceContextType | null>(null)

export function useVoice() {
    const context = useContext(VoiceContext)
    if (!context) throw new Error('useVoice must be used within VoiceProvider')
    return context
}

interface VoiceProviderProps {
    children: ReactNode
    language?: string
    continuous?: boolean
    onResult?: (transcript: string) => void
    onError?: (error: string) => void
}

export function VoiceProvider({
    children,
    language = 'en-US',
    continuous = false,
    onResult,
    onError
}: VoiceProviderProps) {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null)

    const isSupported = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)

    useEffect(() => {
        if (!isSupported) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognitionAPI()
        recognitionRef.current.continuous = continuous
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = language

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionRef.current.onresult = (event: any) => {
            const results = Array.from(event.results) as any[]
            const transcriptText = results.map((r: any) => r[0].transcript).join('')
            setTranscript(transcriptText)

            const isFinal = results.some((r: any) => r.isFinal)
            if (isFinal) {
                onResult?.(transcriptText)
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionRef.current.onerror = (event: any) => {
            setIsListening(false)
            onError?.(event.error)
        }

        recognitionRef.current.onend = () => {
            setIsListening(false)
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [isSupported, language, continuous, onResult, onError])

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('')
            recognitionRef.current.start()
            setIsListening(true)
        }
    }, [isListening])

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        }
    }, [isListening])

    const clearTranscript = useCallback(() => {
        setTranscript('')
    }, [])

    return (
        <VoiceContext.Provider value={{
            isListening,
            isSupported,
            transcript,
            startListening,
            stopListening,
            clearTranscript
        }}>
            {children}
        </VoiceContext.Provider>
    )
}

// Voice Button
interface VoiceButtonProps {
    size?: 'sm' | 'md' | 'lg'
    showWaveform?: boolean
    className?: string
}

export function VoiceButton({ size = 'md', showWaveform = true, className = '' }: VoiceButtonProps) {
    const { isListening, isSupported, startListening, stopListening } = useVoice()

    if (!isSupported) {
        return (
            <button className={`voice-button voice-button--${size} voice-button--disabled ${className}`} disabled>
                <MicOff size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
            </button>
        )
    }

    return (
        <button
            className={`voice-button voice-button--${size} ${isListening ? 'voice-button--active' : ''} ${className}`}
            onClick={isListening ? stopListening : startListening}
        >
            {isListening ? (
                <>
                    <Mic size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
                    {showWaveform && (
                        <div className="voice-button__waveform">
                            {[1, 2, 3, 4, 5].map(i => (
                                <span key={i} className="voice-button__bar" />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <Mic size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
            )}
        </button>
    )
}

// Voice Input
interface VoiceInputProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    className?: string
}

export function VoiceInput({ value = '', onChange, placeholder = 'Speak or type...', className = '' }: VoiceInputProps) {
    const { isListening, transcript, startListening, stopListening, clearTranscript } = useVoice()
    const [inputValue, setInputValue] = useState(value)

    useEffect(() => {
        if (transcript) {
            setInputValue(transcript)
            onChange?.(transcript)
        }
    }, [transcript, onChange])

    const handleClear = () => {
        setInputValue('')
        clearTranscript()
        onChange?.('')
    }

    return (
        <div className={`voice-input ${isListening ? 'voice-input--active' : ''} ${className}`}>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); onChange?.(e.target.value) }}
                placeholder={placeholder}
            />

            {inputValue && (
                <button className="voice-input__clear" onClick={handleClear}>
                    <X size={14} />
                </button>
            )}

            <button
                className={`voice-input__mic ${isListening ? 'voice-input__mic--active' : ''}`}
                onClick={isListening ? stopListening : startListening}
            >
                <Mic size={16} />
            </button>
        </div>
    )
}

// Text-to-Speech
interface SpeakButtonProps {
    text: string
    rate?: number
    pitch?: number
    voice?: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function SpeakButton({
    text,
    rate = 1,
    pitch = 1,
    voice,
    size = 'md',
    className = ''
}: SpeakButtonProps) {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

    const speak = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel()

            utteranceRef.current = new SpeechSynthesisUtterance(text)
            utteranceRef.current.rate = rate
            utteranceRef.current.pitch = pitch

            if (voice) {
                const voices = window.speechSynthesis.getVoices()
                const selectedVoice = voices.find(v => v.name === voice)
                if (selectedVoice) utteranceRef.current.voice = selectedVoice
            }

            utteranceRef.current.onstart = () => setIsSpeaking(true)
            utteranceRef.current.onend = () => setIsSpeaking(false)
            utteranceRef.current.onerror = () => setIsSpeaking(false)

            window.speechSynthesis.speak(utteranceRef.current)
        }
    }

    const stop = () => {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
    }

    return (
        <button
            className={`speak-button speak-button--${size} ${isSpeaking ? 'speak-button--active' : ''} ${className}`}
            onClick={isSpeaking ? stop : speak}
        >
            {isSpeaking ? (
                <VolumeX size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
            ) : (
                <Volume2 size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
            )}
        </button>
    )
}

// Voice Command Listener
interface VoiceCommand {
    phrase: string
    action: () => void
    fuzzy?: boolean
}

interface VoiceCommandListenerProps {
    commands: VoiceCommand[]
    onUnrecognized?: (transcript: string) => void
    children?: ReactNode
}

export function VoiceCommandListener({ commands, onUnrecognized, children }: VoiceCommandListenerProps) {
    const { transcript, isListening } = useVoice()
    const processedRef = useRef('')

    useEffect(() => {
        if (!transcript || transcript === processedRef.current) return

        const lowerTranscript = transcript.toLowerCase().trim()

        const matchedCommand = commands.find(cmd => {
            const lowerPhrase = cmd.phrase.toLowerCase()
            if (cmd.fuzzy) {
                return lowerTranscript.includes(lowerPhrase)
            }
            return lowerTranscript === lowerPhrase
        })

        if (matchedCommand) {
            processedRef.current = transcript
            matchedCommand.action()
        } else if (!isListening && transcript) {
            processedRef.current = transcript
            onUnrecognized?.(transcript)
        }
    }, [transcript, isListening, commands, onUnrecognized])

    return <>{children}</>
}

export default { VoiceProvider, useVoice, VoiceButton, VoiceInput, SpeakButton, VoiceCommandListener }
