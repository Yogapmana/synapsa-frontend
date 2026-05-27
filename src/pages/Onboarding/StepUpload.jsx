import { useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function StepUpload() {
  const [isDragOver, setIsDragOver] = useState(false)

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
    // Upload is disabled — Coming Soon
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Tambahkan referensi belajar
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload materi tambahan untuk membantu PLA menyusun kurikulum yang lebih relevan.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-colors',
          isDragOver
            ? 'border-primary-400 bg-primary-50'
            : 'border-border bg-white hover:border-primary-300 hover:bg-primary-50/50',
          'opacity-60 cursor-not-allowed'
        )}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
          <Upload className="h-8 w-8 text-primary-600" />
        </div>

        <div className="space-y-1 text-center">
          <p className="text-base font-medium text-foreground">
            Drag & drop file di sini
          </p>
          <p className="text-sm text-muted-foreground">
            Upload buku, modul kuliah, atau artikel yang ingin dijadikan referensi
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, DOCX, TXT — maks. 5 file, masing-masing 20MB
          </p>
        </div>

        <div className="absolute right-4 top-4">
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
            Coming Soon
          </Badge>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-900">
              Fitur upload segera hadir!
            </p>
            <p className="text-xs text-amber-700">
              Kamu bisa langsung melanjutkan tanpa upload referensi. PLA akan mencari materi dari sumber terpercaya secara otomatis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}