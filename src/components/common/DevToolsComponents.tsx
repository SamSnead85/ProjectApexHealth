import { ReactNode, useState, useEffect, useMemo, useRef, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clipboard, Terminal, Code, Copy, Check, ChevronDown, ChevronRight, Play, Pause, Square, FileCode, Folder, File, Settings, Zap, Box, Layers, GitBranch, Download } from 'lucide-react'
import './DevToolsComponents.css'

// Code Block
interface CodeBlockProps {
    code: string
    language?: string
    filename?: string
    showLineNumbers?: boolean
    highlightLines?: number[]
    onCopy?: () => void
    className?: string
}

export function CodeBlock({
    code,
    language = 'text',
    filename,
    showLineNumbers = true,
    highlightLines = [],
    onCopy,
    className = ''
}: CodeBlockProps) {
    const [copied, setCopied] = useState(false)
    const lines = code.split('\n')

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        onCopy?.()
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={`code-block ${className}`}>
            {filename && (
                <div className="code-block__header">
                    <FileCode size={14} />
                    <span>{filename}</span>
                    <span className="code-block__lang">{language}</span>
                </div>
            )}
            <div className="code-block__container">
                <button className="code-block__copy" onClick={handleCopy}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <pre className="code-block__pre">
                    {showLineNumbers && (
                        <div className="code-block__lines">
                            {lines.map((_, i) => (
                                <span key={i}>{i + 1}</span>
                            ))}
                        </div>
                    )}
                    <code className={`code-block__code language-${language}`}>
                        {lines.map((line, i) => (
                            <div
                                key={i}
                                className={`code-block__line ${highlightLines.includes(i + 1) ? 'highlighted' : ''}`}
                            >
                                {line || ' '}
                            </div>
                        ))}
                    </code>
                </pre>
            </div>
        </div>
    )
}

// Terminal Output
interface TerminalLine { type: 'input' | 'output' | 'error' | 'success'; content: string }

interface TerminalOutputProps {
    lines: TerminalLine[]
    title?: string
    showPrompt?: boolean
    className?: string
}

export function TerminalOutput({ lines, title = 'Terminal', showPrompt = true, className = '' }: TerminalOutputProps) {
    return (
        <div className={`terminal-output ${className}`}>
            <div className="terminal-output__header">
                <div className="terminal-output__dots">
                    <span className="red" /><span className="yellow" /><span className="green" />
                </div>
                <span className="terminal-output__title">{title}</span>
            </div>
            <div className="terminal-output__body">
                {lines.map((line, i) => (
                    <div key={i} className={`terminal-output__line terminal-output__line--${line.type}`}>
                        {showPrompt && line.type === 'input' && <span className="terminal-output__prompt">$</span>}
                        <span>{line.content}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// File Tree
interface TreeNode { name: string; type: 'file' | 'folder'; children?: TreeNode[]; icon?: ReactNode }

interface FileTreeProps {
    data: TreeNode[]
    onSelect?: (node: TreeNode, path: string) => void
    selectedPath?: string
    className?: string
}

export function FileTree({ data, onSelect, selectedPath, className = '' }: FileTreeProps) {
    const [expanded, setExpanded] = useState<Set<string>>(new Set())

    const toggleExpand = (path: string) => {
        const newExpanded = new Set(expanded)
        if (newExpanded.has(path)) newExpanded.delete(path)
        else newExpanded.add(path)
        setExpanded(newExpanded)
    }

    const renderNode = (node: TreeNode, path: string = '', depth: number = 0) => {
        const fullPath = path ? `${path}/${node.name}` : node.name
        const isExpanded = expanded.has(fullPath)
        const isSelected = selectedPath === fullPath

        return (
            <div key={fullPath}>
                <div
                    className={`file-tree__node ${isSelected ? 'selected' : ''}`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => {
                        if (node.type === 'folder') toggleExpand(fullPath)
                        onSelect?.(node, fullPath)
                    }}
                >
                    {node.type === 'folder' ? (
                        isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    ) : <span style={{ width: 14 }} />}
                    {node.icon || (node.type === 'folder' ? <Folder size={14} /> : <File size={14} />)}
                    <span>{node.name}</span>
                </div>
                {node.type === 'folder' && isExpanded && node.children?.map(child =>
                    renderNode(child, fullPath, depth + 1)
                )}
            </div>
        )
    }

    return <div className={`file-tree ${className}`}>{data.map(node => renderNode(node))}</div>
}

// Collapsible Section
interface CollapsibleSectionProps {
    title: string
    defaultOpen?: boolean
    icon?: ReactNode
    badge?: string | number
    children: ReactNode
    className?: string
}

export function CollapsibleSection({
    title,
    defaultOpen = false,
    icon,
    badge,
    children,
    className = ''
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className={`collapsible-section ${isOpen ? 'open' : ''} ${className}`}>
            <button className="collapsible-section__header" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                {icon}
                <span>{title}</span>
                {badge !== undefined && <span className="collapsible-section__badge">{badge}</span>}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="collapsible-section__content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// JSON Viewer
interface JSONViewerProps { data: any; collapsed?: boolean; className?: string }

export function JSONViewer({ data, collapsed = false, className = '' }: JSONViewerProps) {
    const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set())

    const togglePath = (path: string) => {
        const newPaths = new Set(collapsedPaths)
        if (newPaths.has(path)) newPaths.delete(path)
        else newPaths.add(path)
        setCollapsedPaths(newPaths)
    }

    const renderValue = (value: any, path: string = 'root', depth: number = 0): ReactNode => {
        if (value === null) return <span className="json-viewer__null">null</span>
        if (typeof value === 'boolean') return <span className="json-viewer__boolean">{String(value)}</span>
        if (typeof value === 'number') return <span className="json-viewer__number">{value}</span>
        if (typeof value === 'string') return <span className="json-viewer__string">"{value}"</span>

        const isCollapsed = collapsed || collapsedPaths.has(path)
        const isArray = Array.isArray(value)
        const entries = Object.entries(value)

        return (
            <div className="json-viewer__object" style={{ marginLeft: depth > 0 ? 16 : 0 }}>
                <span className="json-viewer__bracket" onClick={() => togglePath(path)}>
                    {isArray ? '[' : '{'}
                    {isCollapsed && <span className="json-viewer__collapsed">...{entries.length} items</span>}
                </span>
                {!isCollapsed && entries.map(([key, val], i) => (
                    <div key={key} className="json-viewer__entry">
                        {!isArray && <span className="json-viewer__key">"{key}":</span>}
                        {renderValue(val, `${path}.${key}`, depth + 1)}
                        {i < entries.length - 1 && ','}
                    </div>
                ))}
                <span className="json-viewer__bracket">{isArray ? ']' : '}'}</span>
            </div>
        )
    }

    return <div className={`json-viewer ${className}`}>{renderValue(data)}</div>
}

// Command Palette Item
interface CommandItem { id: string; label: string; description?: string; icon?: ReactNode; shortcut?: string }

interface CommandPaletteItemProps { item: CommandItem; selected?: boolean; onSelect?: () => void }

export function CommandPaletteItem({ item, selected = false, onSelect }: CommandPaletteItemProps) {
    return (
        <button className={`command-palette-item ${selected ? 'selected' : ''}`} onClick={onSelect}>
            {item.icon && <span className="command-palette-item__icon">{item.icon}</span>}
            <div className="command-palette-item__content">
                <span className="command-palette-item__label">{item.label}</span>
                {item.description && <span className="command-palette-item__desc">{item.description}</span>}
            </div>
            {item.shortcut && <kbd className="command-palette-item__shortcut">{item.shortcut}</kbd>}
        </button>
    )
}

export default { CodeBlock, TerminalOutput, FileTree, CollapsibleSection, JSONViewer, CommandPaletteItem }
