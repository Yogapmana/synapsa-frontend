import React from 'react'
import { AlertTriangle, LayoutDashboard, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => window.location.reload()

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <Card className="w-full max-w-xl">
          <CardHeader className="gap-3">
            <div className="inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle />
            </div>
            <CardTitle>Oops, ada yang error</CardTitle>
            <CardDescription>
              Halaman ini gagal dimuat. Silakan coba lagi atau kembali ke dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={this.handleRetry}>
              <RotateCcw data-icon="inline-start" />
              Coba Lagi
            </Button>
            <Button asChild variant="outline">
              <Link to="/dashboard">
                <LayoutDashboard data-icon="inline-start" />
                Kembali ke Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
}

export default ErrorBoundary
