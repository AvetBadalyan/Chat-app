import { LogIn, LogOut, MessageSquare, Moon, Sun, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { DARK, useThemeStore } from '../store/useThemeStore'

const Navbar = () => {
	const { logout, authUser } = useAuthStore()
	const { theme, toggleTheme } = useThemeStore()

	const isDark = theme === DARK

	return (
		<header className="border-b border-base-content/10 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
			<div className="container mx-auto px-4 h-16">
				<div className="flex items-center justify-between h-full">
					<Link
						to="/"
						className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
					>
						<div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
							<MessageSquare className="size-5 text-primary" />
						</div>
						<span className="text-lg font-bold">Avetbook</span>
					</Link>

					<div className="flex items-center gap-2">
						{/* Dark / light toggle */}
						<button
							onClick={toggleTheme}
							className="btn btn-sm btn-ghost btn-circle hover:bg-base-content/10"
							aria-label={
								isDark ? 'Switch to light mode' : 'Switch to dark mode'
							}
							title={isDark ? 'Light mode' : 'Dark mode'}
						>
							{isDark ? (
								<Sun className="size-5" />
							) : (
								<Moon className="size-5" />
							)}
						</button>

						{authUser ? (
							<>
								<Link
									to="/profile"
									aria-label="Profile"
									className="btn btn-sm btn-ghost gap-2 hover:bg-base-content/10"
								>
									<User className="size-5" />
									<span className="hidden sm:inline">Profile</span>
								</Link>

								<button
									className="btn btn-sm btn-ghost gap-2 hover:bg-base-content/10"
									onClick={logout}
									aria-label="Logout"
								>
									<LogOut className="size-5" />
									<span className="hidden sm:inline">Logout</span>
								</button>
							</>
						) : (
							<Link
								to="/login"
								aria-label="Sign In"
								className="btn btn-sm btn-primary gap-2"
							>
								<LogIn className="size-4" />
								<span className="hidden sm:inline">Sign In</span>
							</Link>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}

export default Navbar
