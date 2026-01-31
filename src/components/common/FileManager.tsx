import { ReactNode, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, Image, X, CheckCircle, AlertCircle, Loader2, Download, Eye, Trash2 } from 'lucide-react'
import './FileManager.css'

interface UploadedFile {
    id: string
    name: string
    size: number
    type: string
    status: 'uploading' | 'complete' | 'error'
    progress?: number
    url?: string
    error?: string
}

interface FileUploaderProps {
    accept?: string
    multiple?: boolean
    maxSize?: number
    maxFiles?: number
    onUpload: (files: File[]) => Promise<void>
    onRemove?: (id: string) => void
    className?: string
}

export function FileUploader({
    accept,
    multiple = true,
    maxSize = 10 * 1024 * 1024, // 10MB
    maxFiles = 10,
    onUpload,
    onRemove,
    className = ''
}: FileUploaderProps) {
    const [files, setFiles] = useState<UploadedFile[]>([])
    const [isDragActive, setIsDragActive] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const handleFiles = async (fileList: FileList) => {
        const newFiles = Array.from(fileList).slice(0, maxFiles - files.length)

        const uploadFiles: UploadedFile[] = newFiles.map(file => ({
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            status: file.size > maxSize ? 'error' : 'uploading',
            progress: 0,
            error: file.size > maxSize ? `File exceeds ${formatSize(maxSize)} limit` : undefined
        }))

        setFiles(prev => [...prev, ...uploadFiles])

        // Simulate upload progress
        for (const uploadFile of uploadFiles) {
            if (uploadFile.status === 'error') continue

            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 100))
                setFiles(prev => prev.map(f =>
                    f.id === uploadFile.id ? { ...f, progress: i } : f
                ))
            }

            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id ? { ...f, status: 'complete', progress: 100 } : f
            ))
        }

        await onUpload(newFiles.filter(f => f.size <= maxSize))
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragActive(false)
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files)
        }
    }

    const handleRemove = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id))
        onRemove?.(id)
    }

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image size={20} />
        return <File size={20} />
    }

    return (
        <div className={`file-uploader ${className}`}>
            <div
                className={`file-uploader__dropzone ${isDragActive ? 'file-uploader__dropzone--active' : ''}`}
                onDragEnter={() => setIsDragActive(true)}
                onDragLeave={() => setIsDragActive(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    style={{ display: 'none' }}
                />
                <Upload size={32} />
                <span className="file-uploader__text">
                    {isDragActive ? 'Drop files here' : 'Drag & drop files, or click to browse'}
                </span>
                <span className="file-uploader__hint">
                    Max file size: {formatSize(maxSize)} • Max files: {maxFiles}
                </span>
            </div>

            {files.length > 0 && (
                <div className="file-uploader__list">
                    <AnimatePresence>
                        {files.map(file => (
                            <motion.div
                                key={file.id}
                                className={`file-uploader__item file-uploader__item--${file.status}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <span className="file-uploader__item-icon">
                                    {getFileIcon(file.type)}
                                </span>
                                <div className="file-uploader__item-info">
                                    <span className="file-uploader__item-name">{file.name}</span>
                                    <span className="file-uploader__item-size">{formatSize(file.size)}</span>
                                    {file.status === 'uploading' && (
                                        <div className="file-uploader__progress">
                                            <div
                                                className="file-uploader__progress-fill"
                                                style={{ width: `${file.progress}%` }}
                                            />
                                        </div>
                                    )}
                                    {file.error && (
                                        <span className="file-uploader__item-error">{file.error}</span>
                                    )}
                                </div>
                                <div className="file-uploader__item-status">
                                    {file.status === 'uploading' && <Loader2 size={16} className="spin" />}
                                    {file.status === 'complete' && <CheckCircle size={16} className="success" />}
                                    {file.status === 'error' && <AlertCircle size={16} className="error" />}
                                </div>
                                <button
                                    className="file-uploader__item-remove"
                                    onClick={() => handleRemove(file.id)}
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}

// File Preview
interface FilePreviewProps {
    file: { name: string; type: string; url: string; size?: number }
    onDownload?: () => void
    onDelete?: () => void
    className?: string
}

export function FilePreview({ file, onDownload, onDelete, className = '' }: FilePreviewProps) {
    const isImage = file.type.startsWith('image/')

    return (
        <div className={`file-preview ${className}`}>
            {isImage ? (
                <div className="file-preview__image">
                    <img src={file.url} alt={file.name} />
                </div>
            ) : (
                <div className="file-preview__icon">
                    <File size={48} />
                </div>
            )}
            <div className="file-preview__info">
                <span className="file-preview__name">{file.name}</span>
                {file.size && <span className="file-preview__size">{(file.size / 1024).toFixed(1)} KB</span>}
            </div>
            <div className="file-preview__actions">
                {onDownload && (
                    <button onClick={onDownload}>
                        <Download size={16} />
                    </button>
                )}
                {onDelete && (
                    <button onClick={onDelete}>
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    )
}

// Image Gallery
interface GalleryImage {
    id: string
    src: string
    alt?: string
    caption?: string
}

interface ImageGalleryProps {
    images: GalleryImage[]
    columns?: number
    gap?: number
    onImageClick?: (image: GalleryImage) => void
    className?: string
}

export function ImageGallery({
    images,
    columns = 3,
    gap = 16,
    onImageClick,
    className = ''
}: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

    const handleClick = (image: GalleryImage) => {
        setSelectedImage(image)
        onImageClick?.(image)
    }

    return (
        <>
            <div
                className={`image-gallery ${className}`}
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}
            >
                {images.map(image => (
                    <motion.div
                        key={image.id}
                        className="image-gallery__item"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleClick(image)}
                    >
                        <img src={image.src} alt={image.alt || ''} />
                        <div className="image-gallery__overlay">
                            <Eye size={20} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        className="image-gallery__lightbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <button className="image-gallery__close" onClick={() => setSelectedImage(null)}>
                            <X size={24} />
                        </button>
                        <motion.img
                            src={selectedImage.src}
                            alt={selectedImage.alt || ''}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        {selectedImage.caption && (
                            <div className="image-gallery__caption">{selectedImage.caption}</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default { FileUploader, FilePreview, ImageGallery }
