import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from './components/common/ErrorBoundary'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import PageLoader from './components/common/PageLoader'
import { useAuthStore } from './stores/authStore'
import { useLearningStore } from './stores/learningStore'
import { useActiveSession } from './hooks/useLearning'

const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Curriculum = lazy(() => import('./pages/Curriculum'))
const Module = lazy(() => import('./pages/Module'))
const Chat = lazy(() => import('./pages/Chat'))
const Quiz = lazy(() => import('./pages/Quiz'))
const AgentLog = lazy(() => import('./pages/AgentLog'))
const Metrics = lazy(() => import('./pages/Metrics'))
const Settings = lazy(() => import('./pages/Settings'))
const Onboarding = lazy(() => import('./pages/Onboarding/Onboarding'))
const OnboardingLayout = lazy(() => import('./components/layout/OnboardingLayout'))
const AgentLoadingScreen = lazy(() => import('./pages/Onboarding/AgentLoadingScreen'))
const Landing = lazy(() => import('./pages/Landing'))

const queryClient = new QueryClient()

function RootRedirect() {
  const { isAuthenticated } = useAuthStore()
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('pla_token') : null
  const isLoggedIn = isAuthenticated || !!token

  return <Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />
}

function CurriculumRedirect() {
  const { topicId } = useParams()
  return <Navigate to={topicId ? `/module/${topicId}` : '/curriculum'} replace />
}

function SessionGuard({ children }) {
  const { isAuthenticated } = useAuthStore()
  const activeSession = useLearningStore((s) => s.activeSession)
  const setActiveSession = useLearningStore((s) => s.setActiveSession)
  const { data: fetchedSession, isLoading } = useActiveSession({ enabled: isAuthenticated })
  const location = useLocation()
  const [isRestoring, setIsRestoring] = React.useState(true)

  React.useEffect(() => {
    if (fetchedSession && !activeSession) {
      setActiveSession(fetchedSession)
    }
  }, [fetchedSession, activeSession, setActiveSession])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsRestoring(false)
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  if (isRestoring) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('pla_token') : null
    if (!token) {
      return <Navigate to="/login" state={{ from: location }} replace />
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  const hasSession = !!fetchedSession || !!activeSession

  if (fetchedSession?.status === 'processing') {
    return <AgentLoadingScreen sessionId={fetchedSession.id} />
  }

  if (location.pathname === '/onboarding' && hasSession) {
    const sessionStatus = fetchedSession?.status || activeSession?.status
    if (sessionStatus === 'processing') {
      return children
    }
    return <Navigate to="/dashboard" replace />
  }

  if (!hasSession && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

function ProtectedApp({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
        <Route path="/register" element={<ErrorBoundary><Register /></ErrorBoundary>} />
        <Route
          path="/onboarding"
          element={<ErrorBoundary><SessionGuard><OnboardingLayout><Onboarding /></OnboardingLayout></SessionGuard></ErrorBoundary>}
        />
        <Route
          path="/dashboard"
          element={<ErrorBoundary><SessionGuard><ProtectedApp><Dashboard /></ProtectedApp></SessionGuard></ErrorBoundary>}
        />
        <Route
          path="/curriculum"
          element={<ErrorBoundary><SessionGuard><ProtectedApp><Curriculum /></ProtectedApp></SessionGuard></ErrorBoundary>}
        />
        <Route path="/curriculum/:topicId" element={<CurriculumRedirect />} />
        <Route path="/modules" element={<Navigate to="/curriculum" replace />} />
        <Route
          path="/module/:topicId"
          element={<ErrorBoundary><SessionGuard><ProtectedApp><Module /></ProtectedApp></SessionGuard></ErrorBoundary>}
        />
        <Route
          path="/chat"
          element={<ErrorBoundary><SessionGuard><ProtectedApp><Chat /></ProtectedApp></SessionGuard></ErrorBoundary>}
        />
        <Route
          path="/chat/:topicId"
          element={<ErrorBoundary><SessionGuard><ProtectedApp><Chat /></ProtectedApp></SessionGuard></ErrorBoundary>}
        />
        <Route
          path="/quiz/:topicId"
          element={<ErrorBoundary><SessionGuard><ProtectedApp><Quiz /></ProtectedApp></SessionGuard></ErrorBoundary>}
        />
        <Route
          path="/agent-log"
          element={<ErrorBoundary><SessionGuard><ProtectedApp><AgentLog /></ProtectedApp></SessionGuard></ErrorBoundary>}
        />
        <Route
          path="/metrics"
          element={<ErrorBoundary><SessionGuard><ProtectedApp><Metrics /></ProtectedApp></SessionGuard></ErrorBoundary>}
        />
        <Route
          path="/settings"
          element={<ErrorBoundary><SessionGuard><ProtectedApp><Settings /></ProtectedApp></SessionGuard></ErrorBoundary>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
