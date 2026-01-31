import { useState, useRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import './FileUpload.css'

interface FileItem {
    id: string
    name: string
    size: number
    status: 'uploading' | 'complete' | 'error'
    progress: number
    error?: string
}

interface FileUploadProps {
    onUpload?: (files: File[]) => void
    accept?: string
    multiple?: boolean
    maxSize?: number // in bytes
    children?: ReactNode
    className?: string
}

export function FileUpload({
    onUpload,
    accept,
    multiple = false,
    maxSize = 10 * 1024 * 1024, // 10MB default
    children,
    className = ''
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [files, setFiles] = useState<FileItem[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList) return

        const newFiles = Array.from(fileList).map(file => ({
            id: Math.random().toString(36).slice(2),
            name: file.name,
            size: file.size,
            status: file.size > maxSize ? 'error' as const : 'uploading' as const,
            progress: 0,
            error: file.size > maxSize ? `File exceeds ${formatSize(maxSize)} limit` : undefined
        }))

        setFiles(prev => [...prev, ...newFiles])

        const validFiles = Array.from(fileList).filter(f => f.size <= maxSize)
        if (validFiles.length && onUpload) {
            onUpload(validFiles)
        }

        // Simulate upload progress
        newFiles.filter(f => f.status !== 'error').forEach(file => {
            let progress = 0
            const interval = setInterval(() => {
                progress += Math.random() * 20
                if (progress >= 100) {
                    progress = 100
                    clearInterval(interval)
                    setFiles(prev => prev.map(f =>
                        f.id === file.id ? { ...f, progress: 100, status: 'complete' } : f
                    ))
                } else {
                    setFiles(prev => prev.map(f =>
                        f.id === file.id ? { ...f, progress } : f
                    ))
                }
            }, 200)
        })
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
    }

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id))
    }

    return (
        <div className={`file-upload ${className}`}>
            <motion.div
                className={`file-upload__dropzone ${isDragging ? 'file-upload__dropzone--active' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                whileHover={{ borderColor: 'rgba(6, 182, 212, 0.5)' }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="file-upload__input"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => handleFiles(e.target.files)}
                />
                {children || (
                    <div className="file-upload__content">
                        <Upload size={32} className="file-upload__icon" />
                        <div className="file-upload__text">
                            <span className="file-upload__primary">Click to upload</span>
                            <span className="file-upload__secondary">or drag and drop</span>
                        </div>
                        <span className="file-upload__hint">
                            {accept ? accept.split(',').join(', ') : 'Any file type'} up to {formatSize(maxSize)}
                        </span>
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        className="file-upload__list"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {files.map(file => (
                            <motion.div
                                key={file.id}
                                className={`file-upload__item file-upload__item--${file.status}`}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div className="file-upload__item-icon">
                                    {file.status === 'complete' ? <CheckCircle size={16} /> :
                                        file.status === 'error' ? <AlertCircle size={16} /> :
                                            <File size={16} />}
                                </div>
                                <div className="file-upload__item-content">
                                    <span className="file-upload__item-name">{file.name}</span>
                                    <span className="file-upload__item-size">{formatSize(file.size)}</span>
                                    {file.status === 'uploading' && (
                                        <div className="file-upload__progress">
                                            <motion.div
                                                className="file-upload__progress-bar"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${file.progress}%` }}
                                            />
                                        </div>
                                    )}
                                    {file.error && <span className="file-upload__item-error">{file.error}</span>}
                                </div>
                                <button className="file-upload__item-remove" onClick={() => removeFile(file.id)}>
                                    <X size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default FileUpload
