import { useState, ReactNode, createContext, useContext } from 'react'
import { motion } from 'framer-motion'
import './Tabs.css'

interface Tab {
    id: string
    label: string
    icon?: ReactNode
    disabled?: boolean
    badge?: string | number
}

interface TabsProps {
    tabs: Tab[]
    defaultTab?: string
    onChange?: (tabId: string) => void
    variant?: 'default' | 'pills' | 'underline'
    className?: string
    children?: ReactNode
}

interface TabsContextType {
    activeTab: string
    setActiveTab: (id: string) => void
}

const TabsContext = createContext<TabsContextType | null>(null)

export function Tabs({
    tabs,
    defaultTab,
    onChange,
    variant = 'default',
    className = '',
    children
}: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '')

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId)
        onChange?.(tabId)
    }

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
            <div className={`tabs tabs--${variant} ${className}`}>
                <div className="tabs__list" role="tablist">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tabs__tab ${activeTab === tab.id ? 'tabs__tab--active' : ''} ${tab.disabled ? 'tabs__tab--disabled' : ''}`}
                            onClick={() => !tab.disabled && handleTabChange(tab.id)}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            disabled={tab.disabled}
                        >
                            {tab.icon && <span className="tabs__tab-icon">{tab.icon}</span>}
                            <span className="tabs__tab-label">{tab.label}</span>
                            {tab.badge && <span className="tabs__tab-badge">{tab.badge}</span>}
                            {activeTab === tab.id && variant === 'underline' && (
                                <motion.div
                                    className="tabs__indicator"
                                    layoutId="tabs-indicator"
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

interface TabPanelProps {
    tabId: string
    children: ReactNode
    className?: string
}

export function TabPanel({ tabId, children, className = '' }: TabPanelProps) {
    const context = useContext(TabsContext)
    if (!context) throw new Error('TabPanel must be used within Tabs')

    if (context.activeTab !== tabId) return null

    return (
        <motion.div
            className={`tabs__panel ${className}`}
            role="tabpanel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
    )
}

export function useTabs() {
    const context = useContext(TabsContext)
    if (!context) throw new Error('useTabs must be used within Tabs')
    return context
}

export default Tabs
