import { MessageSquare, RefreshCw } from 'lucide-react'
import { Component } from 'react'

class ErrorBoundary extends Component {
	constructor(props) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error }
	}

	componentDidCatch(error, errorInfo) {
		console.error('Error caught by boundary:', error, errorInfo)
	}

	handleReload = () => {
		window.location.reload()
	}

	handleGoHome = () => {
		window.location.href = '/'
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
					<div className="bg-base-100 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
						<div className="flex justify-center mb-6">
							<div className="size-16 rounded-2xl bg-error/10 flex items-center justify-center">
								<MessageSquare className="size-8 text-error" />
							</div>
						</div>

						<h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
						<p className="text-base-content/60 mb-6">
							We encountered an unexpected error. Please try refreshing the page
							or go back to the home page.
						</p>

						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<button
								onClick={this.handleReload}
								className="btn btn-primary gap-2"
							>
								<RefreshCw className="size-4" />
								Refresh Page
							</button>
							<button
								onClick={this.handleGoHome}
								className="btn btn-ghost"
							>
								Go to Home
							</button>
						</div>

						{import.meta.env.DEV && this.state.error && (
							<details className="mt-6 text-left">
								<summary className="cursor-pointer text-sm text-base-content/60">
									Error details (dev only)
								</summary>
								<pre className="mt-2 p-3 bg-base-200 rounded-lg text-xs overflow-auto">
									{this.state.error.toString()}
								</pre>
							</details>
						)}
					</div>
				</div>
			)
		}

		return this.props.children
	}
}

export default ErrorBoundary
