import { createContext, useContext, ReactNode } from 'react'

interface NavigationContextType {
    navigate: (path: string) => void
}

const NavigationContext = createContext<NavigationContextType | null>(null)

export function useNavigation() {
    const context = useContext(NavigationContext)
    if (!context) {
        // Return a no-op if used outside provider (graceful fallback)
        return { navigate: (path: string) => console.warn('Navigation not available:', path) }
    }
    return context
}

interface NavigationProviderProps {
    children: ReactNode
    onNavigate: (path: string) => void
}

export function NavigationProvider({ children, onNavigate }: NavigationProviderProps) {
    return (
        <NavigationContext.Provider value={{ navigate: onNavigate }}>
            {children}
        </NavigationContext.Provider>
    )
}

export default NavigationContext
