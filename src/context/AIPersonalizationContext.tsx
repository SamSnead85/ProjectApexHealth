import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AIInsight {
    id: string
    type: 'recommendation' | 'alert' | 'opportunity' | 'trend'
    title: string
    description: string
    confidence: number
    action?: {
        label: string
        path: string
    }
    timestamp: Date
}

interface UserPreference {
    preferredMetrics: string[]
    dashboardLayout: 'compact' | 'detailed' | 'executive'
    notificationFrequency: 'realtime' | 'hourly' | 'daily'
    focusAreas: string[]
}

interface AIPersonalizationState {
    insights: AIInsight[]
    preferences: UserPreference
    isLoading: boolean
    lastUpdated: Date | null
    engagementScore: number
    predictedActions: string[]
}

interface AIPersonalizationContextType extends AIPersonalizationState {
    refreshInsights: () => Promise<void>
    updatePreferences: (prefs: Partial<UserPreference>) => void
    dismissInsight: (id: string) => void
    markInsightActioned: (id: string) => void
}

const defaultPreferences: UserPreference = {
    preferredMetrics: ['claims', 'approvalRate', 'processingTime', 'costSavings'],
    dashboardLayout: 'detailed',
    notificationFrequency: 'realtime',
    focusAreas: ['efficiency', 'compliance', 'member-satisfaction']
}

const AIPersonalizationContext = createContext<AIPersonalizationContextType | undefined>(undefined)

// Generate mock AI insights based on user behavior patterns
const generateMockInsights = (): AIInsight[] => [
    {
        id: 'insight-1',
        type: 'opportunity',
        title: 'Cost Savings Opportunity Detected',
        description: 'AI analysis suggests $127K in potential savings through automated prior authorization workflows for routine procedures.',
        confidence: 0.94,
        action: { label: 'Configure Automation', path: '/workflow-builder' },
        timestamp: new Date()
    },
    {
        id: 'insight-2',
        type: 'alert',
        title: 'Anomaly in Provider Claims',
        description: 'Provider Network XYZ shows 45% higher claim volume than peer average. Recommend audit review.',
        confidence: 0.87,
        action: { label: 'Review Claims', path: '/claims' },
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
        id: 'insight-3',
        type: 'recommendation',
        title: 'Member Engagement Optimization',
        description: '234 members approaching deductible threshold - proactive outreach could improve satisfaction scores by 12%.',
        confidence: 0.82,
        action: { label: 'View Members', path: '/member-outreach' },
        timestamp: new Date(Date.now() - 60 * 60 * 1000)
    },
    {
        id: 'insight-4',
        type: 'trend',
        title: 'Processing Efficiency Trending Up',
        description: 'Straight-through processing rate increased 8% this week. Current rate: 94% auto-adjudication.',
        confidence: 0.96,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
        id: 'insight-5',
        type: 'opportunity',
        title: 'Network Optimization Available',
        description: 'AI identified 3 high-performing providers not in current network. Adding them could reduce member out-of-pocket costs by 18%.',
        confidence: 0.79,
        action: { label: 'Explore Network', path: '/network-management' },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
]

interface AIPersonalizationProviderProps {
    children: ReactNode
}

export function AIPersonalizationProvider({ children }: AIPersonalizationProviderProps) {
    const [insights, setInsights] = useState<AIInsight[]>([])
    const [preferences, setPreferences] = useState<UserPreference>(defaultPreferences)
    const [isLoading, setIsLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [engagementScore, setEngagementScore] = useState(78)
    const [predictedActions, setPredictedActions] = useState<string[]>([
        'Review pending claims',
        'Check authorization queue',
        'Review analytics dashboard'
    ])

    // Load initial insights
    useEffect(() => {
        const loadInsights = async () => {
            setIsLoading(true)
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800))
            setInsights(generateMockInsights())
            setLastUpdated(new Date())
            setIsLoading(false)
        }
        loadInsights()
    }, [])

    // Refresh insights periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setInsights(prev => {
                // Add a new insight occasionally
                if (Math.random() > 0.7) {
                    const newInsight: AIInsight = {
                        id: `insight-${Date.now()}`,
                        type: 'trend',
                        title: 'Real-time Update',
                        description: 'Processing metrics updated with latest data.',
                        confidence: 0.95,
                        timestamp: new Date()
                    }
                    return [newInsight, ...prev.slice(0, 9)]
                }
                return prev
            })
            setLastUpdated(new Date())
        }, 30000) // Every 30 seconds

        return () => clearInterval(interval)
    }, [])

    const refreshInsights = async () => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))
        setInsights(generateMockInsights())
        setLastUpdated(new Date())
        setIsLoading(false)
    }

    const updatePreferences = (prefs: Partial<UserPreference>) => {
        setPreferences(prev => ({ ...prev, ...prefs }))
    }

    const dismissInsight = (id: string) => {
        setInsights(prev => prev.filter(insight => insight.id !== id))
    }

    const markInsightActioned = (id: string) => {
        setEngagementScore(prev => Math.min(100, prev + 2))
        dismissInsight(id)
    }

    const value: AIPersonalizationContextType = {
        insights,
        preferences,
        isLoading,
        lastUpdated,
        engagementScore,
        predictedActions,
        refreshInsights,
        updatePreferences,
        dismissInsight,
        markInsightActioned
    }

    return (
        <AIPersonalizationContext.Provider value={value}>
            {children}
        </AIPersonalizationContext.Provider>
    )
}

export function useAIPersonalization() {
    const context = useContext(AIPersonalizationContext)
    if (context === undefined) {
        throw new Error('useAIPersonalization must be used within an AIPersonalizationProvider')
    }
    return context
}

export default AIPersonalizationContext
