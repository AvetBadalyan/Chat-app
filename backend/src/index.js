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
				? 'https://avetbook-chat-app.onrender.com'
				: 'http://localhost:5173',
		credentials: true
	})
)

app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)

// Global error handler
app.use((err, req, res, next) => {
	console.error('Global error:', err)

	const statusCode = err.statusCode || 500
	const message = err.message || 'Internal server error'

	res.status(statusCode).json({
		success: false,
		message,
		...(process.env.NODE_ENV === 'development' && { stack: err.stack })
	})
})

// 404 handler for unknown API routes
app.use((req, res, next) => {
	if (req.path.startsWith('/api/')) {
		res.status(404).json({
			success: false,
			message: 'API endpoint not found'
		})
	} else {
		next()
	}
})

if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, '../frontend/dist')))
	app.get(/.*/, (req, res) => {
		res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'))
	})
}

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
	connectDB()
})
