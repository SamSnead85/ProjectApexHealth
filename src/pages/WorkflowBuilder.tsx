import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Maximize2,
    Minimize2,
    PanelLeftClose,
    PanelLeftOpen,
    PanelRightClose,
    PanelRightOpen,
    Keyboard,
    Sparkles,
    MessageSquareText,
    X,
    Loader2,
    ChevronDown,
    ChevronUp,
    Activity,
    Users,
    Settings,
    ClipboardList,
    LayoutTemplate
} from 'lucide-react'
import { WorkflowCanvas, NodePalette, AIAssistant, NodeConfigPanel, ExecutionLogs, HITLQueue, WorkflowTemplates } from '../components/workflow'
import { useWorkflowStore } from '../stores/workflowStore'
import { useWorkflowAutoSave } from '../hooks'
import { geminiService } from '../services/gemini'
import { Button } from '../components/common'
import './WorkflowBuilder.css'

interface ShortcutHint {
    key: string
    description: string
}

const KEYBOARD_SHORTCUTS: ShortcutHint[] = [
    { key: 'F11', description: 'Toggle fullscreen' },
    { key: 'Esc', description: 'Exit fullscreen' },
    { key: '⌘ + S', description: 'Save workflow' },
    { key: '⌘ + O', description: 'Open workflow' },
    { key: '[', description: 'Toggle node palette' },
    { key: ']', description: 'Toggle AI assistant' },
    { key: 'Space + Drag', description: 'Pan canvas' },
    { key: '⌘ + Z', description: 'Undo' },
    { key: '⌘ + ⇧ + Z', description: 'Redo' },
    { key: 'Delete', description: 'Delete selected' },
]

export function WorkflowBuilder() {
    const {
        isPaletteOpen,
        isAIAssistantOpen,
        isConfigPanelOpen,
        selectedNodeId,
        createWorkflow,
        workflow,
        togglePalette,
        toggleAIAssistant,
        saveWorkflow,
        nodes,
        edges,
        setNodes,
        setEdges,
        executionStatus,
        pendingCheckpoints
    } = useWorkflowStore()

    // Fullscreen and UI state
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showShortcuts, setShowShortcuts] = useState(false)
    const [showNLPPrompt, setShowNLPPrompt] = useState(false)
    const [nlpPrompt, setNlpPrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationError, setGenerationError] = useState<string | null>(null)
    const [generationSuccess, setGenerationSuccess] = useState<string | null>(null)

    // Bottom panel state
    const [showBottomPanel, setShowBottomPanel] = useState(false)
    const [bottomPanelTab, setBottomPanelTab] = useState<'logs' | 'hitl' | 'config'>('logs')

    // Template gallery state
    const [showTemplates, setShowTemplates] = useState(false)
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

    // Auto-save hook
    useWorkflowAutoSave({
        debounceMs: 5000,
        enabled: true,
        onSave: () => {
            setAutoSaveStatus('saved')
            setTimeout(() => setAutoSaveStatus('idle'), 2000)
        }
    })

    // Initialize a new workflow if none exists
    useEffect(() => {
        if (!workflow) {
            createWorkflow('Untitled Workflow', 'A new healthcare workflow')
        }
    }, [workflow, createWorkflow])

    // Keyboard shortcuts handler
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // F11 - Toggle fullscreen
        if (e.key === 'F11') {
            e.preventDefault()
            setIsFullscreen(prev => !prev)
        }

        // Escape - Exit fullscreen or close modals
        if (e.key === 'Escape') {
            if (showShortcuts) setShowShortcuts(false)
            else if (showNLPPrompt) setShowNLPPrompt(false)
            else if (isFullscreen) setIsFullscreen(false)
        }

        // Cmd/Ctrl + S - Save workflow
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
            e.preventDefault()
            saveWorkflow()
        }

        // [ - Toggle palette
        if (e.key === '[' && !e.metaKey && !e.ctrlKey) {
            togglePalette()
        }

        // ] - Toggle AI assistant
        if (e.key === ']' && !e.metaKey && !e.ctrlKey) {
            toggleAIAssistant()
        }

        // / - Focus NLP prompt (like Slack)
        if (e.key === '/' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT') {
            e.preventDefault()
            setShowNLPPrompt(true)
        }

        // ? - Show shortcuts
        if (e.key === '?' && e.shiftKey) {
            setShowShortcuts(prev => !prev)
        }
    }, [isFullscreen, showShortcuts, showNLPPrompt, saveWorkflow, togglePalette, toggleAIAssistant])

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    // Handle NLP workflow generation using Gemini AI
    const handleNLPSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nlpPrompt.trim()) return

        setIsGenerating(true)
        setGenerationError(null)
        setGenerationSuccess(null)

        try {
            // Generate workflow using Gemini AI
            const generatedWorkflow = await geminiService.generateWorkflow(nlpPrompt)

            if (generatedWorkflow.nodes && generatedWorkflow.edges) {
                // Update the workflow store with generated nodes and edges
                setNodes(generatedWorkflow.nodes as any)
                setEdges(generatedWorkflow.edges as any)

                const nodeCount = generatedWorkflow.nodes.length
                setGenerationSuccess(`Successfully created "${generatedWorkflow.name || 'New Workflow'}" with ${nodeCount} nodes!`)

                // Close the modal after a brief delay to show success message
                setTimeout(() => {
                    setShowNLPPrompt(false)
                    setNlpPrompt('')
                    setGenerationSuccess(null)
                }, 1500)
            } else {
                throw new Error('Invalid workflow structure generated')
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate workflow'
            setGenerationError(errorMessage)
            console.error('Workflow generation error:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className={`workflow-builder ${isFullscreen ? 'workflow-builder--fullscreen' : ''}`}>
            {/* Floating Header Bar */}
            <motion.div
                className="workflow-builder__header"
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div className="workflow-builder__header-left">
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={isPaletteOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                        onClick={togglePalette}
                        title="Toggle node palette ([)"
                    />
                    <div className="workflow-builder__title">
                        <h1>{workflow?.name || 'Untitled Workflow'}</h1>
                        <span className="workflow-builder__status">
                            {workflow?.status === 'draft' ? '● Draft' : '✓ Published'}
                        </span>
                        {autoSaveStatus === 'saved' && (
                            <span className="workflow-builder__autosave">✓ Saved</span>
                        )}
                    </div>
                </div>

                <div className="workflow-builder__header-center">
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={<LayoutTemplate size={16} />}
                        onClick={() => setShowTemplates(true)}
                    >
                        Templates
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        icon={<MessageSquareText size={16} />}
                        onClick={() => setShowNLPPrompt(true)}
                    >
                        Describe Workflow...
                    </Button>
                </div>

                <div className="workflow-builder__header-right">
                    <div className="workflow-builder__stats">
                        <span>{nodes.length} nodes</span>
                        <span>{edges.length} connections</span>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<Keyboard size={16} />}
                        onClick={() => setShowShortcuts(true)}
                        title="Keyboard shortcuts (?)"
                    />

                    <Button
                        variant="ghost"
                        size="sm"
                        icon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        title="Toggle fullscreen (F11)"
                    />

                    <Button
                        variant="ghost"
                        size="sm"
                        icon={isAIAssistantOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                        onClick={toggleAIAssistant}
                        title="Toggle AI assistant (])"
                    />
                </div>
            </motion.div>

            {/* Main Content Area - Palette, Canvas, Assistant */}
            <div className="workflow-builder__main">
                {/* Node Palette (Left Sidebar) - Always present when open */}
                <AnimatePresence mode="wait">
                    {isPaletteOpen && (
                        <motion.div
                            className={`workflow-builder__palette ${isFullscreen ? 'workflow-builder__palette--floating' : ''}`}
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 280, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            <NodePalette />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Canvas */}
                <div className="workflow-builder__canvas">
                    <WorkflowCanvas />
                </div>

                {/* AI Assistant (Right Sidebar) */}
                <AnimatePresence mode="wait">
                    {isAIAssistantOpen && (
                        <motion.div
                            className={`workflow-builder__assistant ${isFullscreen ? 'workflow-builder__assistant--floating' : ''}`}
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 360, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            <AIAssistant />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* NLP Prompt Overlay */}
            <AnimatePresence>
                {showNLPPrompt && (
                    <motion.div
                        className="workflow-builder__nlp-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowNLPPrompt(false)}
                    >
                        <motion.div
                            className="workflow-builder__nlp-modal"
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="workflow-builder__nlp-header">
                                <Sparkles size={20} />
                                <h3>Describe Your Workflow</h3>
                                <button onClick={() => setShowNLPPrompt(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleNLPSubmit}>
                                <textarea
                                    value={nlpPrompt}
                                    onChange={e => setNlpPrompt(e.target.value)}
                                    placeholder="Describe your workflow in plain English...&#10;&#10;Example: 'Route any claim over $50,000 to a senior adjuster for manual review. Otherwise, auto-process through the policy engine and log the decision for compliance.'"
                                    autoFocus
                                    rows={5}
                                    disabled={isGenerating}
                                />

                                {generationError && (
                                    <div className="workflow-builder__nlp-error">
                                        {generationError}
                                    </div>
                                )}

                                {generationSuccess && (
                                    <div className="workflow-builder__nlp-success">
                                        {generationSuccess}
                                    </div>
                                )}

                                <div className="workflow-builder__nlp-examples">
                                    <span>Try:</span>
                                    <button type="button" onClick={() => setNlpPrompt('Create a prior authorization workflow that checks member eligibility, then reviews medical necessity using AI, and routes high-cost procedures to human review')} disabled={isGenerating}>
                                        Prior Auth Flow
                                    </button>
                                    <button type="button" onClick={() => setNlpPrompt('Build a claims intake workflow that validates EDI format, checks for duplicates, runs fraud detection, and auto-adjudicates clean claims')} disabled={isGenerating}>
                                        Claims Intake
                                    </button>
                                    <button type="button" onClick={() => setNlpPrompt('Design an enrollment verification workflow that validates member data, checks employer group status, and sends welcome notifications')} disabled={isGenerating}>
                                        Enrollment
                                    </button>
                                </div>

                                <div className="workflow-builder__nlp-actions">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowNLPPrompt(false)}
                                        disabled={isGenerating}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        icon={isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                        disabled={!nlpPrompt.trim() || isGenerating}
                                    >
                                        {isGenerating ? 'Generating...' : 'Generate Workflow'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Keyboard Shortcuts Modal */}
            <AnimatePresence>
                {showShortcuts && (
                    <motion.div
                        className="workflow-builder__shortcuts-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowShortcuts(false)}
                    >
                        <motion.div
                            className="workflow-builder__shortcuts-modal"
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="workflow-builder__shortcuts-header">
                                <Keyboard size={20} />
                                <h3>Keyboard Shortcuts</h3>
                                <button onClick={() => setShowShortcuts(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="workflow-builder__shortcuts-list">
                                {KEYBOARD_SHORTCUTS.map((shortcut, idx) => (
                                    <div key={idx} className="workflow-builder__shortcut">
                                        <kbd>{shortcut.key}</kbd>
                                        <span>{shortcut.description}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Node Configuration Panel (Overlay when node selected) */}
            <AnimatePresence>
                {selectedNodeId && isConfigPanelOpen && (
                    <motion.div
                        className="workflow-builder__config-overlay"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <NodeConfigPanel />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HITL Notification Banner */}
            {pendingCheckpoints.length > 0 && (
                <motion.div
                    className="workflow-builder__hitl-banner"
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -60, opacity: 0 }}
                >
                    <div className="workflow-builder__hitl-banner-content">
                        <Users size={18} />
                        <span><strong>{pendingCheckpoints.length}</strong> task{pendingCheckpoints.length > 1 ? 's' : ''} awaiting human review</span>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                setShowBottomPanel(true)
                                setBottomPanelTab('hitl')
                            }}
                        >
                            Review Now
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Bottom Panel Toggle */}
            <div className="workflow-builder__bottom-toggle">
                <button
                    onClick={() => setShowBottomPanel(!showBottomPanel)}
                    className="workflow-builder__bottom-toggle-btn"
                >
                    {showBottomPanel ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    <span>{showBottomPanel ? 'Hide Panel' : 'Show Panel'}</span>
                    {executionStatus === 'running' && (
                        <span className="workflow-builder__bottom-indicator workflow-builder__bottom-indicator--running" />
                    )}
                    {pendingCheckpoints.length > 0 && (
                        <span className="workflow-builder__bottom-badge">{pendingCheckpoints.length}</span>
                    )}
                </button>
            </div>

            {/* Bottom Panel - Execution Logs, HITL Queue, Config */}
            <AnimatePresence>
                {showBottomPanel && (
                    <motion.div
                        className="workflow-builder__bottom-panel"
                        initial={{ y: 300, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 300, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className="workflow-builder__bottom-tabs">
                            <button
                                className={`workflow-builder__bottom-tab ${bottomPanelTab === 'logs' ? 'active' : ''}`}
                                onClick={() => setBottomPanelTab('logs')}
                            >
                                <Activity size={14} />
                                Execution Logs
                            </button>
                            <button
                                className={`workflow-builder__bottom-tab ${bottomPanelTab === 'hitl' ? 'active' : ''}`}
                                onClick={() => setBottomPanelTab('hitl')}
                            >
                                <Users size={14} />
                                HITL Queue
                                {pendingCheckpoints.length > 0 && (
                                    <span className="workflow-builder__tab-badge">{pendingCheckpoints.length}</span>
                                )}
                            </button>
                            <button
                                className={`workflow-builder__bottom-tab ${bottomPanelTab === 'config' ? 'active' : ''}`}
                                onClick={() => setBottomPanelTab('config')}
                            >
                                <Settings size={14} />
                                Node Config
                            </button>
                            <div className="workflow-builder__bottom-tabs-spacer" />
                            <button
                                className="workflow-builder__bottom-close"
                                onClick={() => setShowBottomPanel(false)}
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <div className="workflow-builder__bottom-content">
                            {bottomPanelTab === 'logs' && <ExecutionLogs />}
                            {bottomPanelTab === 'hitl' && <HITLQueue />}
                            {bottomPanelTab === 'config' && (
                                selectedNodeId ? <NodeConfigPanel /> : (
                                    <div className="workflow-builder__no-selection">
                                        <ClipboardList size={32} />
                                        <p>Select a node to configure its properties</p>
                                    </div>
                                )
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Workflow Templates Modal */}
            <WorkflowTemplates
                isOpen={showTemplates}
                onClose={() => setShowTemplates(false)}
            />
        </div>
    )
}

export default WorkflowBuilder
