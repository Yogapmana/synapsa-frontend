import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_FILES = 3
const ALLOWED_TYPES = ['application/pdf']

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function StepUpload({ data, onChange }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const fileInputRef = useRef(null)
  const files = data.files || []

  const addFiles = useCallback((incoming) => {
    setValidationError(null)

    const newFiles = []
    for (const file of incoming) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setValidationError('Hanya file PDF yang didukung.')
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setValidationError(`File "${file.name}" melebihi batas 10MB.`)
        return
      }
      newFiles.push(file)
    }

    if (files.length + newFiles.length > MAX_FILES) {
      setValidationError(`Maksimal ${MAX_FILES} file yang bisa diupload.`)
      return
    }

    onChange({ files: [...files, ...newFiles] })
  }, [files, onChange])

  const removeFile = useCallback((index) => {
    const updated = files.filter((_, i) => i !== index)
    onChange({ files: updated })
    setValidationError(null)
  }, [files, onChange])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  const handleFileInput = (e) => {
    addFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-primary">
          Beri konteks ke PLA
        </h2>
        <p className="text-secondary max-w-lg mx-auto">
          Upload CV, materi kuliah, atau dokumen referensi. PLA akan menggunakannya untuk menyusun kurikulum yang lebih relevan.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all duration-200',
          isDragOver
            ? 'border-tertiary bg-tertiary/5 scale-[1.01]'
            : 'border-border bg-surface hover:border-tertiary/40 hover:bg-tertiary/5'
        )}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tertiary/10">
          <Upload className="h-8 w-8 text-tertiary" />
        </div>

        <div className="space-y-1 text-center">
          <p className="text-base font-medium text-primary">
            Drag PDF ke sini, atau klik untuk pilih
          </p>
          <p className="text-sm text-secondary">
            PDF, maksimal 10MB per file, hingga {MAX_FILES} file
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {validationError && (
        <div className="flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/10 p-4">
          <AlertCircle className="h-5 w-5 text-danger shrink-0" />
          <p className="text-sm font-medium text-danger">{validationError}</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2.5">
          <p className="font-label text-xs uppercase tracking-wider text-secondary">
            File terupload ({files.length}/{MAX_FILES})
          </p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tertiary/10">
                  <FileText className="h-5 w-5 text-tertiary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-primary">{file.name}</p>
                  <p className="text-xs text-secondary">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-secondary hover:bg-danger/10 hover:text-danger transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-bg-secondary p-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-tertiary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary">
              Upload bersifat opsional
            </p>
            <p className="text-xs text-secondary">
              Kamu bisa langsung melanjutkan tanpa upload. PLA akan mencari materi dari sumber terpercaya secara otomatis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}