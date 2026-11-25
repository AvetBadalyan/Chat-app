import { CLIENT_ORIGIN, isProduction } from './lib/env.js' // keep first: loads .env
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import path from 'path'
import { connectDB } from './lib/db.js'
import { app, server } from './lib/socket.js'
import authRoutes from './routes/auth.route.js'
import healthRoutes from './routes/health.route.js'
import messageRoutes from './routes/message.route.js'

// Stop early with a clear message if a required setting is missing.
const requiredEnv = [
	'MONGODB_URI',
	'JWT_SECRET',
	'CLOUDINARY_CLOUD_NAME',
	'CLOUDINARY_API_KEY',
	'CLOUDINARY_API_SECRET'
]
for (const name of requiredEnv) {
	if (!process.env[name]) {
		console.error(`Missing required environment variable: ${name}`)
		process.exit(1)
	}
}

const PORT = process.env.PORT || 5001
const __dirname = path.resolve()

// Render puts one proxy in front of the app. Trust it so the rate limiter
// sees each visitor's real IP instead of the proxy's.
if (isProduction) app.set('trust proxy', 1)

// helmet adds common security headers (CSP, HSTS, X-Frame-Options, ...).
// We only extend the image rule, because chat images and avatars come from
// Cloudinary and the sites used by the seed users.
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				'img-src': [
					"'self'",
					'data:',
					'https://res.cloudinary.com',
					'https://api.dicebear.com',
					'https://randomuser.me'
				]
			}
		}
	})
)

// 10mb because images are sent as base64 text in the JSON body
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser())
app.use(
	cors({
		origin: CLIENT_ORIGIN,
		credentials: true
	})
)

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)

// 404 for unknown API routes (must come before the SPA fallback)
app.use('/api', (req, res) => {
	res.status(404).json({ message: 'API endpoint not found' })
})

// Serve the built frontend in production
if (isProduction) {
	app.use(express.static(path.join(__dirname, '../frontend/dist')))

	app.get(/.*/, (req, res) => {
		res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'))
	})
}

// Global error handler (last middleware). Controllers that call next(err)
// or any framework-level error will land here with a consistent shape.
app.use((err, req, res, next) => {
	console.error('Global error:', err)
	const statusCode = err.statusCode || 500
	// Do not show internal error text for server errors
	const message =
		statusCode === 500
			? 'Something went wrong. Please try again.'
			: err.message

	res.status(statusCode).json({
		message,
		...(process.env.NODE_ENV === 'development' && { stack: err.stack })
	})
})

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
	connectDB()
})
