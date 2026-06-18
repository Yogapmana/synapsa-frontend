import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from './components/common/ErrorBoundary'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import PageLoader from './components/common/PageLoader'
import { useAuthStore } from './stores/authStore'
import { useLearningStore } from './stores/learningStore'
import { useActiveSession } from './hooks/useLearning'
import { Button } from '@/components/ui/button'

const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Curriculum = lazy(() => import('./pages/Curriculum'))
const Module = lazy(() => import('./pages/Module'))
const Chat = lazy(() => import('./pages/Chat'))
const Quiz = lazy(() => import('./pages/Quiz'))
const QuizHistory = lazy(() => import('./pages/QuizHistory'))
const QuizHistoryByTopic = lazy(() => import('./pages/QuizHistoryByTopic'))
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

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-secondary p-4 text-center">
      <h1 className="text-6xl font-display font-bold text-tertiary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-primary mb-2">Halaman tidak ditemukan</h2>
      <p className="text-secondary max-w-md mb-8">Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
      <Button asChild variant="tertiary">
        <Link to="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  )
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
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'PLA — Personal Learning Agent';
    if (path.startsWith('/dashboard')) title = 'Dashboard — PLA';
    else if (path.startsWith('/curriculum')) title = 'Kurikulum — PLA';
    else if (path.startsWith('/module')) title = 'Modul — PLA';
    else if (path.startsWith('/chat')) title = 'Chat Tutor — PLA';
    else if (path.startsWith('/quiz')) title = 'Kuis — PLA';
    else if (path.startsWith('/progress')) title = 'Riwayat Kuis — PLA';
    else if (path.startsWith('/settings')) title = 'Pengaturan — PLA';
    else if (path.startsWith('/login')) title = 'Masuk — PLA';
    else if (path.startsWith('/register')) title = 'Daftar — PLA';
    else if (path.startsWith('/onboarding')) title = 'Onboarding — PLA';

    document.title = title;
  }, [location]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
        <Route path="/register" element={<ErrorBoundary><Register /></ErrorBoundary>} />
        <Route
          path="/onboarding"
          element={
            <ErrorBoundary>
              <SessionGuard>
                <OnboardingLayout>
                  <Onboarding />
                </OnboardingLayout>
              </SessionGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ErrorBoundary>
              <SessionGuard>
                <ProtectedApp>
                  <Dashboard />
                </ProtectedApp>
              </SessionGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/curriculum"
          element={
            <ErrorBoundary>
              <SessionGuard>
                <ProtectedApp>
                  <Curriculum />
                </ProtectedApp>
              </SessionGuard>
            </ErrorBoundary>
          }
        />
        <Route path="/curriculum/:topicId" element={<CurriculumRedirect />} />
        <Route path="/modules" element={<Navigate to="/curriculum" replace />} />
        <Route
          path="/module/:topicId"
          element={
            <ErrorBoundary>
              <SessionGuard>
                <ProtectedApp>
                  <Module />
                </ProtectedApp>
              </SessionGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/chat"
          element={
            <ErrorBoundary>
              <SessionGuard>
                <ProtectedApp>
                  <Chat />
                </ProtectedApp>
              </SessionGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/chat/:topicId"
          element={
            <ErrorBoundary>
              <SessionGuard>
                <ProtectedApp>
                  <Chat />
                </ProtectedApp>
              </SessionGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/quiz/:topicId"
          element={
            <ErrorBoundary>
              <SessionGuard>
                <ProtectedApp>
                  <Quiz />
                </ProtectedApp>
              </SessionGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/progress"
          element={
            <ErrorBoundary>
              <SessionGuard>
                <ProtectedApp>
                  <QuizHistory />
                </ProtectedApp>
              </SessionGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/progress/topic/:topicId"
          element={
            <ErrorBoundary>
              <SessionGuard>
                <ProtectedApp>
                  <QuizHistoryByTopic />
                </ProtectedApp>
              </SessionGuard>
            </ErrorBoundary>
          }
        />
        <Route
          path="/settings"
          element={
            <ErrorBoundary>
              <SessionGuard>
                <ProtectedApp>
                  <Settings />
                </ProtectedApp>
              </SessionGuard>
            </ErrorBoundary>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
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
