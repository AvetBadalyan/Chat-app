import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import { connectDB } from './lib/db.js'
import { app, server } from './lib/socket.js'
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'

dotenv.config({ quiet: true })

const PORT = process.env.PORT || 5001
const __dirname = path.resolve()

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

app.use(cookieParser())
app.use(
	cors({
		origin:
			process.env.NODE_ENV === 'production'
				? 'https://chat-app-avetbook.fly.dev'
				: 'http://localhost:5173',
		credentials: true
	})
)

app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)

// 404 for unknown API routes (must come before the SPA fallback)
app.use('/api', (req, res) => {
	res.status(404).json({ message: 'API endpoint not found' })
})

// Serve the built frontend in production
if (process.env.NODE_ENV === 'production') {
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
	const message = err.message || 'Something went wrong. Please try again.'

	res.status(statusCode).json({
		message,
		...(process.env.NODE_ENV === 'development' && { stack: err.stack })
	})
})

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
	connectDB()
})
