import { Loader2 } from 'lucide-react'

function PageLoader({ showLogo = true }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        {showLogo ? <div className="text-2xl font-bold tracking-[0.2em] text-primary animate-pulse">PLA</div> : null}
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat halaman...</p>
      </div>
    </div>
  )
}

export default PageLoader
