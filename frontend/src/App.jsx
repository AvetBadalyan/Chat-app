import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import { useAuthStore } from './store/useAuthStore'
import { useThemeStore } from './store/useThemeStore'

// These pages load only when the user visits them, so the first page loads faster
const ChatPage = lazy(() => import('./pages/ChatPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SignUpPage = lazy(() => import('./pages/SignUpPage'))

const PageLoader = ({ message }) => (
	<div
		role="status"
		className="flex flex-col items-center justify-center gap-3 h-screen"
	>
		<Loader className="size-10 animate-spin" />
		<p className="text-base-content/70">{message}</p>
	</div>
)

const App = () => {
	const { authUser, checkAuth, isCheckingAuth } = useAuthStore()
	const { theme } = useThemeStore()

	// Apply theme to <html> so every portal (Toaster, modals) inherits it
	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme)
	}, [theme])

	useEffect(() => {
		checkAuth()
	}, [checkAuth])

	if (isCheckingAuth && !authUser)
		return <PageLoader message="Loading… the server may take a moment to wake up." />

	return (
		<>
			{/* Lets keyboard users jump past the navbar */}
			<a
				href="#main"
				className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-content focus:px-4 focus:py-2 focus:rounded-lg"
			>
				Skip to main content
			</a>
			<Navbar />
			<main id="main">
				<Suspense fallback={<PageLoader message="Loading…" />}>
					<Routes>
						<Route
							path="/"
							element={authUser ? <ChatPage /> : <LandingPage />}
						/>
						<Route
							path="/signup"
							element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
						/>
						<Route
							path="/login"
							element={!authUser ? <LoginPage /> : <Navigate to="/" />}
						/>
						<Route
							path="/profile"
							element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
						/>
						{/* Unknown address: go to the home page */}
						<Route
							path="*"
							element={<Navigate to="/" />}
						/>
					</Routes>
				</Suspense>
			</main>
			<Toaster
				toastOptions={{
					// Match the current theme instead of the default white toast
					style: {
						background: 'var(--color-base-100)',
						color: 'var(--color-base-content)'
					}
				}}
			/>
		</>
	)
}

export default App
