import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import './Clipboard.css'

interface CopyButtonProps {
    text: string
    label?: string
    size?: 'sm' | 'md' | 'lg'
    variant?: 'icon' | 'button' | 'inline'
    onCopy?: () => void
    className?: string
}

export function CopyButton({
    text,
    label = 'Copy',
    size = 'md',
    variant = 'icon',
    onCopy,
    className = ''
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            onCopy?.()
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    if (variant === 'inline') {
        return (
            <motion.button
                className={`copy-button copy-button--inline copy-button--${size} ${copied ? 'copy-button--copied' : ''} ${className}`}
                onClick={handleCopy}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : label}
            </motion.button>
        )
    }

    if (variant === 'button') {
        return (
            <motion.button
                className={`copy-button copy-button--button copy-button--${size} ${copied ? 'copy-button--copied' : ''} ${className}`}
                onClick={handleCopy}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : label}
            </motion.button>
        )
    }

    return (
        <motion.button
            className={`copy-button copy-button--icon copy-button--${size} ${copied ? 'copy-button--copied' : ''} ${className}`}
            onClick={handleCopy}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={copied ? 'Copied!' : label}
        >
            {copied ? <Check size={size === 'sm' ? 14 : 16} /> : <Copy size={size === 'sm' ? 14 : 16} />}
        </motion.button>
    )
}

// Copyable code block
interface CodeBlockProps {
    code: string
    language?: string
    showLineNumbers?: boolean
    maxHeight?: number
    className?: string
}

export function CodeBlock({
    code,
    language,
    showLineNumbers = false,
    maxHeight,
    className = ''
}: CodeBlockProps) {
    const lines = code.split('\n')

    return (
        <div className={`code-block ${className}`}>
            <div className="code-block__header">
                {language && <span className="code-block__language">{language}</span>}
                <CopyButton text={code} size="sm" />
            </div>
            <pre
                className="code-block__content"
                style={{ maxHeight: maxHeight ? `${maxHeight}px` : undefined }}
            >
                {showLineNumbers ? (
                    <code>
                        {lines.map((line, i) => (
                            <div key={i} className="code-block__line">
                                <span className="code-block__line-number">{i + 1}</span>
                                <span className="code-block__line-content">{line}</span>
                            </div>
                        ))}
                    </code>
                ) : (
                    <code>{code}</code>
                )}
            </pre>
        </div>
    )
}

// Clickable link with copy
interface LinkWithCopyProps {
    href: string
    label?: string
    external?: boolean
    showCopy?: boolean
}

export function LinkWithCopy({ href, label, external = false, showCopy = true }: LinkWithCopyProps) {
    return (
        <div className="link-with-copy">
            <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="link-with-copy__link"
            >
                {label || href}
                {external && <ExternalLink size={12} />}
            </a>
            {showCopy && <CopyButton text={href} size="sm" />}
        </div>
    )
}

export default CopyButton
