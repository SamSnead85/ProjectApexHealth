import './Divider.css'

interface DividerProps {
    orientation?: 'horizontal' | 'vertical'
    label?: string
    className?: string
}

export function Divider({
    orientation = 'horizontal',
    label,
    className = ''
}: DividerProps) {
    if (label) {
        return (
            <div className={`divider divider--${orientation} divider--with-label ${className}`}>
                <span className="divider__line" />
                <span className="divider__label">{label}</span>
                <span className="divider__line" />
            </div>
        )
    }

    return (
        <div
            className={`divider divider--${orientation} ${className}`}
            role="separator"
        />
    )
}

export default Divider
