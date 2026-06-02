import { Loader2 } from 'lucide-react'

export function ComposerLoading() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-20">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-tertiary shadow-lg">
          <Loader2 className="h-10 w-10 text-white animate-spin" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-surface shadow-md">
          <span className="text-lg">🧩</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-primary animate-pulse">
          Composer sedang menyusun modul...
        </h2>
        <p className="text-secondary max-w-sm">
          Agent AI sedang menggabungkan hasil penelitian menjadi materi pembelajaran yang terstruktur.
          Mohon tunggu sebentar (1-3 menit).
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-tertiary animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>

      <div className="w-full max-w-xs rounded-full bg-neutral h-1.5 overflow-hidden">
        <div className="h-full w-2/3 rounded-full bg-neutral animate-pulse" />
      </div>

      <div className="flex items-center gap-2 text-sm text-secondary/70">
        <span className="inline-flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-tertiary" />
          </span>
          Agent aktif
        </span>
        <span className="text-secondary/50">•</span>
        <span>Estimasi waktu: 1-3 menit</span>
      </div>
    </div>
  )
}
