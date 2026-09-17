import {
	ArrowRight,
	Image,
	Loader2,
	MessageSquare,
	Moon,
	Shield,
	Sparkles,
	Users,
	Zap
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

// Hook for intersection observer animations
const useInView = (options = {}) => {
	const ref = useRef(null)
	const [isInView, setIsInView] = useState(false)

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsInView(true)
					observer.unobserve(entry.target)
				}
			},
			{ threshold: 0.1, ...options }
		)

		if (ref.current) {
			observer.observe(ref.current)
		}

		return () => observer.disconnect()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return [ref, isInView]
}

// Animated counter component
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
	const [count, setCount] = useState(0)
	const [ref, isInView] = useInView()

	useEffect(() => {
		if (!isInView) return

		let startTime
		const animate = currentTime => {
			if (!startTime) startTime = currentTime
			const progress = Math.min((currentTime - startTime) / duration, 1)
			setCount(Math.floor(progress * end))
			if (progress < 1) {
				requestAnimationFrame(animate)
			}
		}
		requestAnimationFrame(animate)
	}, [isInView, end, duration])

	return (
		<span ref={ref}>
			{count}
			{suffix}
		</span>
	)
}

const LandingPage = () => {
	const { login, isLoggingIn } = useAuthStore()
	const [heroRef, heroInView] = useInView()
	const [featuresRef, featuresInView] = useInView()
	const [previewRef, previewInView] = useInView()
	const [ctaRef, ctaInView] = useInView()

	const handleDemoLogin = () => {
		login({
			email: 'demo@avetbook.com',
			password: 'demo123456'
		})
	}

	const features = [
		{
			icon: Zap,
			title: 'Real-Time Messaging',
			description:
				'Instant message delivery powered by WebSockets. No refresh needed.',
			color: 'from-yellow-500/20 to-orange-500/20'
		},
		{
			icon: Users,
			title: 'Online Status',
			description:
				'See who is online in real-time with live presence indicators.',
			color: 'from-green-500/20 to-emerald-500/20'
		},
		{
			icon: Image,
			title: 'Image Sharing',
			description: 'Share images seamlessly with cloud storage integration.',
			color: 'from-blue-500/20 to-cyan-500/20'
		},
		{
			icon: Shield,
			title: 'Secure Auth',
			description:
				'JWT-based authentication with HTTP-only cookies for security.',
			color: 'from-red-500/20 to-pink-500/20'
		},
		{
			icon: Moon,
			title: 'Dark & Light Mode',
			description:
				'Beautifully designed dark and light themes with a single click.',
			color: 'from-purple-500/20 to-violet-500/20'
		},
		{
			icon: MessageSquare,
			title: 'Message Reactions',
			description:
				'React to messages with emojis for expressive conversations.',
			color: 'from-primary/20 to-secondary/20'
		}
	]

	const techStack = [
		{ name: 'React 19', url: 'https://react.dev' },
		{ name: 'Socket.io', url: 'https://socket.io' },
		{ name: 'Node.js', url: 'https://nodejs.org' },
		{ name: 'Express', url: 'https://expressjs.com' },
		{ name: 'MongoDB', url: 'https://www.mongodb.com' },
		{ name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
		{ name: 'Zustand', url: 'https://zustand-demo.pmnd.rs' }
	]

	return (
		<div className="min-h-screen bg-base-100 overflow-hidden">
			{/* Animated background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
				<div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-breathe" />
				<div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl animate-breathe delay-2000" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl animate-pulse-slow" />
			</div>

			{/* Hero Section */}
			<div
				ref={heroRef}
				className="min-h-[calc(100vh-4rem)] flex items-center justify-center pt-16 px-4"
			>
				<div className="max-w-4xl mx-auto text-center">
					{/* Floating badge */}
					<div
						className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 transition-all duration-1000 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
					>
						<Sparkles className="size-4 text-primary animate-pulse" />
						<span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
							Real-time chat powered by Socket.io
						</span>
					</div>

					{/* Logo with continuous float animation */}
					<div
						className={`flex justify-center mb-8 transition-all duration-1000 delay-200 ${heroInView ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
					>
						<div className="relative">
							<div className="absolute inset-0 bg-primary/30 rounded-3xl blur-xl animate-pulse-glow" />
							<div className="relative size-24 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/25 animate-float">
								<MessageSquare className="size-12 text-primary-content animate-icon-subtle" />
							</div>
						</div>
					</div>

					{/* Main heading with gradient */}
					<h1
						className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-1000 delay-300 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
					>
						Connect with{' '}
						<span className="relative">
							<span className="bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
								Avetbook
							</span>
							<span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient rounded-full" />
						</span>
					</h1>

					{/* Subtitle with subtle animation */}
					<p
						className={`text-xl md:text-2xl text-base-content/60 mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-500 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
					>
						A modern real-time chat application built with React, Socket.io, and
						Node.js. Experience{' '}
						<span className="text-primary animate-pulse">seamless</span>{' '}
						messaging with a beautiful interface.
					</p>

					{/* CTA Buttons with continuous glow */}
					<div
						className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-1000 delay-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
					>
						<button
							onClick={handleDemoLogin}
							className="group btn btn-primary btn-lg gap-2 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300 animate-glow"
							disabled={isLoggingIn}
						>
							{isLoggingIn ? (
								<>
									<Loader2 className="size-5 animate-spin" />
									Loading Demo...
								</>
							) : (
								<>
									Try Demo Account
									<ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
								</>
							)}
						</button>

						<Link
							to="/signup"
							className="btn btn-outline btn-lg gap-2 hover:scale-105 transition-all duration-300"
						>
							Create Account
						</Link>
					</div>

					{/* Tech Stack with wave animation */}
					<div
						className={`flex flex-wrap gap-3 justify-center transition-all duration-1000 delay-900 ${heroInView ? 'opacity-100' : 'opacity-0'}`}
					>
						{techStack.map((tech, i) => (
							<a
								key={tech.name}
								href={tech.url}
								target="_blank"
								rel="noopener noreferrer"
								className="badge badge-lg bg-base-200/80 backdrop-blur-sm border-base-300 hover:bg-primary hover:text-primary-content hover:border-primary hover:scale-110 transition-all duration-300 cursor-pointer animate-float-subtle"
								style={{ animationDelay: `${i * 150}ms` }}
							>
								{tech.name}
							</a>
						))}
					</div>

					{/* Scroll indicator */}
					<div
						className={`mt-16 transition-all duration-1000 delay-1000 ${heroInView ? 'opacity-100' : 'opacity-0'}`}
					>
						<div className="flex flex-col items-center gap-2">
							<span className="text-xs text-base-content/40 animate-pulse">
								Scroll to explore
							</span>
							<div className="w-6 h-10 border-2 border-base-content/30 rounded-full flex justify-center pt-2 animate-bounce-slow">
								<div className="w-1.5 h-3 bg-primary rounded-full animate-scroll-dot" />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Stats Section */}
			<div className="py-16 bg-base-200/50 backdrop-blur-sm border-y border-base-300/50">
				<div className="max-w-6xl mx-auto px-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
						{[
							{ value: 2, suffix: '', label: 'Polished Themes' },
							{ value: 100, suffix: '%', label: 'Real-time' },
							{ value: 6, suffix: '', label: 'Emoji Reactions' },
							{ value: 24, suffix: '/7', label: 'Always Online' }
						].map((stat, i) => (
							<div
								key={i}
								className="space-y-2 group"
							>
								<div className="text-4xl md:text-5xl font-bold text-primary group-hover:scale-110 transition-transform duration-300">
									<AnimatedCounter
										end={stat.value}
										suffix={stat.suffix}
									/>
								</div>
								<div className="text-base-content/60 group-hover:text-primary transition-colors duration-300">
									{stat.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div
				ref={featuresRef}
				className="py-24 px-4"
			>
				<div className="max-w-6xl mx-auto">
					<div
						className={`text-center mb-16 transition-all duration-1000 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
					>
						<h2 className="text-4xl md:text-5xl font-bold mb-4">
							Powerful <span className="text-primary">Features</span>
						</h2>
						<p className="text-base-content/60 max-w-2xl mx-auto text-lg">
							Built with modern technologies and best practices for a smooth
							user experience.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{features.map((feature, i) => (
							<div
								key={feature.title}
								className={`group card bg-base-200/50 backdrop-blur-sm border border-base-300 hover:border-primary/50 transition-all duration-500 overflow-hidden ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
								style={{ transitionDelay: `${i * 100}ms` }}
							>
								{/* Animated background on hover */}
								<div
									className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
								/>

								<div className="card-body relative z-10">
									<div className="size-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-primary/20">
										<feature.icon className="size-7 text-primary group-hover:animate-bounce-once" />
									</div>
									<h3 className="card-title text-xl group-hover:text-primary transition-colors duration-300">
										{feature.title}
									</h3>
									<p className="text-base-content/60 group-hover:text-base-content/80 transition-colors duration-300">
										{feature.description}
									</p>
								</div>

								{/* Shimmer effect on hover */}
								<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Screenshot Preview Section */}
			<div
				ref={previewRef}
				className="py-24 px-4 bg-base-200/30"
			>
				<div className="max-w-6xl mx-auto">
					<div
						className={`text-center mb-16 transition-all duration-1000 ${previewInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
					>
						<h2 className="text-4xl md:text-5xl font-bold mb-4">
							Clean & <span className="text-primary">Modern</span> Interface
						</h2>
						<p className="text-base-content/60 max-w-2xl mx-auto text-lg">
							A responsive design that works beautifully on desktop and mobile
							devices.
						</p>
					</div>

					{/* Chat Preview Mockup */}
					<div
						className={`transition-all duration-1000 delay-300 ${previewInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
					>
						<div className="mockup-window bg-base-300 border border-base-300 max-w-4xl mx-auto shadow-2xl hover:shadow-3xl transition-shadow duration-500 animate-float-slow">
							<div className="bg-base-100 flex h-96">
								{/* Sidebar Preview */}
								<div className="w-1/3 border-r border-base-300 p-4 space-y-4">
									{[1, 2, 3].map((_, i) => (
										<div
											key={i}
											className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-500 hover:bg-base-200 cursor-pointer ${i === 0 ? 'bg-base-200' : ''}`}
											style={{
												animationDelay: `${500 + i * 200}ms`,
												animation: previewInView
													? 'slideInLeft 0.5s ease forwards'
													: 'none',
												opacity: 0
											}}
										>
											<div
												className={`size-10 rounded-full ${i === 0 ? 'bg-primary/30 animate-pulse-subtle' : 'bg-base-300'}`}
											/>
											<div className="flex-1">
												<div
													className={`h-3 ${i === 0 ? 'w-24' : 'w-20'} bg-base-300 rounded`}
												/>
												<div className="h-2 w-16 bg-base-300 rounded mt-1 opacity-60" />
											</div>
											{i === 0 && (
												<div className="size-2 rounded-full bg-success animate-ping-slow" />
											)}
										</div>
									))}
								</div>

								{/* Chat Preview */}
								<div className="flex-1 flex flex-col p-4">
									<div className="flex-1 space-y-4 overflow-hidden">
										{[
											{ text: 'Hey! How are you? 👋', sent: false, delay: 800 },
											{
												text: "I'm doing great! Thanks for asking 😊",
												sent: true,
												delay: 1200
											},
											{
												text: "That's awesome! Let's chat more.",
												sent: false,
												delay: 1600
											}
										].map((msg, i) => (
											<div
												key={i}
												className={`chat ${msg.sent ? 'chat-end' : 'chat-start'}`}
												style={{
													animationDelay: `${msg.delay}ms`,
													animation: previewInView
														? `${msg.sent ? 'slideInRight' : 'slideInLeft'} 0.5s ease forwards`
														: 'none',
													opacity: 0
												}}
											>
												<div
													className={`chat-bubble ${msg.sent ? '' : 'chat-bubble-primary'} text-sm hover:scale-105 transition-transform cursor-default`}
												>
													{msg.text}
												</div>
											</div>
										))}

										{/* Typing indicator - continuous animation */}
										<div
											className="chat chat-start"
											style={{
												animationDelay: '2000ms',
												animation: previewInView
													? 'slideInLeft 0.5s ease forwards'
													: 'none',
												opacity: 0
											}}
										>
											<div className="chat-bubble chat-bubble-primary py-3">
												<span className="loading loading-dots loading-sm"></span>
											</div>
										</div>
									</div>

									<div className="flex gap-2 mt-4 pt-4 border-t border-base-300">
										<div className="flex-1 h-12 bg-base-200 rounded-lg animate-pulse-subtle" />
										<div className="size-12 bg-primary/20 rounded-lg flex items-center justify-center hover:bg-primary/30 transition-colors cursor-pointer group">
											<ArrowRight className="size-5 text-primary group-hover:translate-x-1 transition-transform" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div
				ref={ctaRef}
				className="py-24 px-4 relative overflow-hidden"
			>
				{/* Animated background elements */}
				<div className="absolute inset-0 -z-10">
					<div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
					<div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-float delay-1000" />
				</div>

				<div
					className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
				>
					<h2 className="text-4xl md:text-5xl font-bold mb-6">
						Ready to start{' '}
						<span className="text-primary animate-pulse">chatting</span>?
					</h2>
					<p className="text-base-content/60 mb-10 text-lg">
						Try the demo account instantly or create your own account to get
						started.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button
							onClick={handleDemoLogin}
							className="group btn btn-primary btn-lg gap-2 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
							disabled={isLoggingIn}
						>
							{isLoggingIn ? (
								<>
									<Loader2 className="size-5 animate-spin" />
									Loading...
								</>
							) : (
								<>
									Try Demo Account
									<ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
								</>
							)}
						</button>
						<Link
							to="/login"
							className="btn btn-ghost btn-lg hover:scale-105 transition-all duration-300"
						>
							Already have an account? Sign in
						</Link>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="py-12 bg-base-200/50 backdrop-blur-sm border-t border-base-300">
				<div className="max-w-6xl mx-auto px-4 text-center">
					<div className="flex items-center justify-center gap-2 mb-4">
						<div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center animate-float">
							<MessageSquare className="size-5 text-primary" />
						</div>
						<span className="font-bold text-xl">Avetbook</span>
					</div>
					<p className="text-base-content/60 mb-2">
						A portfolio project demonstrating real-time web application
						development.
					</p>
					<p className="text-base-content/40 text-sm">
						Built with React, Node.js, Socket.io, MongoDB, and Tailwind CSS
					</p>
				</div>
			</footer>
		</div>
	)
}

export default LandingPage
