import Navbar from './components/Navbar'

import ChatPage from './pages/ChatPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import SignUpPage from './pages/SignUpPage'

import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { useThemeStore } from './store/useThemeStore'

import { Loader } from 'lucide-react'
import { Toaster } from 'react-hot-toast'

const App = () => {
	const { authUser, checkAuth, isCheckingAuth } = useAuthStore()
	const { theme } = useThemeStore()

	useEffect(() => {
		checkAuth()
	}, [checkAuth])

	if (isCheckingAuth && !authUser)
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader className="size-10 animate-spin" />
			</div>
		)

	return (
		<div data-theme={theme}>
			<Navbar />

			<Routes>
				{/* Landing page for non-authenticated users, chat for authenticated */}
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
			</Routes>

			<Toaster />
		</div>
	)
}
export default App
