import { ReactNode, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, ExternalLink, Hash, Link, Code, Quote, List, ListOrdered } from 'lucide-react'
import './RichText.css'

// Copyable Text
interface CopyableTextProps {
    text: string
    displayText?: string
    showIcon?: boolean
    className?: string
}

export function CopyableText({ text, displayText, showIcon = true, className = '' }: CopyableTextProps) {
    const [copied, setCopied] = useState(false)

    const copy = async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <span className={`copyable-text ${className}`} onClick={copy}>
            {displayText || text}
            {showIcon && (
                <span className="copyable-text__icon">
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                </span>
            )}
        </span>
    )
}

// Truncated Text
interface TruncatedTextProps {
    text: string
    maxLength?: number
    showMore?: boolean
    className?: string
}

export function TruncatedText({ text, maxLength = 100, showMore = true, className = '' }: TruncatedTextProps) {
    const [expanded, setExpanded] = useState(false)
    const isTruncated = text.length > maxLength

    const displayText = expanded || !isTruncated
        ? text
        : `${text.slice(0, maxLength)}...`

    return (
        <span className={`truncated-text ${className}`}>
            {displayText}
            {isTruncated && showMore && (
                <button className="truncated-text__toggle" onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Show less' : 'Show more'}
                </button>
            )}
        </span>
    )
}

// Highlight Text
interface HighlightTextProps {
    text: string
    highlight: string
    caseSensitive?: boolean
    className?: string
}

export function HighlightText({ text, highlight, caseSensitive = false, className = '' }: HighlightTextProps) {
    if (!highlight) return <span className={className}>{text}</span>

    const regex = new RegExp(`(${highlight})`, caseSensitive ? 'g' : 'gi')
    const parts = text.split(regex)

    return (
        <span className={`highlight-text ${className}`}>
            {parts.map((part, i) => {
                const isMatch = caseSensitive
                    ? part === highlight
                    : part.toLowerCase() === highlight.toLowerCase()
                return isMatch
                    ? <mark key={i} className="highlight-text__mark">{part}</mark>
                    : <span key={i}>{part}</span>
            })}
        </span>
    )
}

// Code Block
interface CodeBlockProps {
    code: string
    language?: string
    showLineNumbers?: boolean
    highlightLines?: number[]
    showCopy?: boolean
    className?: string
}

export function CodeBlock({
    code,
    language = 'text',
    showLineNumbers = true,
    highlightLines = [],
    showCopy = true,
    className = ''
}: CodeBlockProps) {
    const [copied, setCopied] = useState(false)
    const lines = code.split('\n')

    const copy = async () => {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={`code-block ${className}`}>
            <div className="code-block__header">
                <span className="code-block__language">{language}</span>
                {showCopy && (
                    <button className="code-block__copy" onClick={copy}>
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                )}
            </div>
            <pre className="code-block__content">
                <code>
                    {lines.map((line, i) => (
                        <div
                            key={i}
                            className={`code-block__line ${highlightLines.includes(i + 1) ? 'code-block__line--highlighted' : ''}`}
                        >
                            {showLineNumbers && (
                                <span className="code-block__line-number">{i + 1}</span>
                            )}
                            <span className="code-block__line-content">{line || ' '}</span>
                        </div>
                    ))}
                </code>
            </pre>
        </div>
    )
}

// Reading Time
interface ReadingTimeProps {
    text: string
    wordsPerMinute?: number
    className?: string
}

export function ReadingTime({ text, wordsPerMinute = 200, className = '' }: ReadingTimeProps) {
    const words = text.trim().split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)

    return (
        <span className={`reading-time ${className}`}>
            {minutes} min read
        </span>
    )
}

// Link Preview (external links)
interface LinkPreviewProps {
    url: string
    title?: string
    description?: string
    image?: string
    className?: string
}

export function LinkPreview({ url, title, description, image, className = '' }: LinkPreviewProps) {
    const displayUrl = new URL(url).hostname

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={`link-preview ${className}`}>
            {image && (
                <div className="link-preview__image">
                    <img src={image} alt={title || url} />
                </div>
            )}
            <div className="link-preview__content">
                {title && <h4 className="link-preview__title">{title}</h4>}
                {description && <p className="link-preview__desc">{description}</p>}
                <span className="link-preview__url">
                    <ExternalLink size={12} />
                    {displayUrl}
                </span>
            </div>
        </a>
    )
}

// Quotation
interface QuotationProps {
    children: ReactNode
    author?: string
    source?: string
    className?: string
}

export function Quotation({ children, author, source, className = '' }: QuotationProps) {
    return (
        <blockquote className={`quotation ${className}`}>
            <Quote size={20} className="quotation__icon" />
            <div className="quotation__content">{children}</div>
            {(author || source) && (
                <footer className="quotation__footer">
                    {author && <cite className="quotation__author">— {author}</cite>}
                    {source && <span className="quotation__source">{source}</span>}
                </footer>
            )}
        </blockquote>
    )
}

// Markdown Preview (basic)
interface MarkdownPreviewProps {
    content: string
    className?: string
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
    const parseMarkdown = (text: string): string => {
        return text
            // Headers
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Code
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
            // Line breaks
            .replace(/\n/g, '<br>')
    }

    return (
        <div
            className={`markdown-preview ${className}`}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
        />
    )
}

// Character/Word Counter
interface TextCounterProps {
    text: string
    maxLength?: number
    countType?: 'characters' | 'words'
    showWarning?: boolean
    className?: string
}

export function TextCounter({
    text,
    maxLength,
    countType = 'characters',
    showWarning = true,
    className = ''
}: TextCounterProps) {
    const count = countType === 'characters'
        ? text.length
        : text.trim().split(/\s+/).filter(Boolean).length

    const isOverLimit = maxLength !== undefined && count > maxLength
    const isNearLimit = maxLength !== undefined && count > maxLength * 0.9

    return (
        <span className={`text-counter ${isOverLimit ? 'text-counter--error' : isNearLimit && showWarning ? 'text-counter--warning' : ''} ${className}`}>
            {count}{maxLength !== undefined && ` / ${maxLength}`} {countType}
        </span>
    )
}

export default { CopyableText, TruncatedText, HighlightText, CodeBlock, ReadingTime, LinkPreview, Quotation, MarkdownPreview, TextCounter }
