import express from 'express'
import http from 'http'
import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import { CLIENT_ORIGIN } from './env.js'

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
	cors: {
		origin: [CLIENT_ORIGIN],
		credentials: true
	}
})

export function getReceiverSocketId(userId) {
	return userSocketMap[userId]
}

// used to store online users
const userSocketMap = {} // {userId: socketId}

// Only logged-in users may connect. We read the id from the signed JWT cookie,
// never from something the client sends (a client could send any id).
io.use((socket, next) => {
	const cookieHeader = socket.handshake.headers.cookie || ''
	const match = cookieHeader.match(/jwt=([^;]+)/)
	if (!match) return next(new Error('Unauthorized'))

	try {
		const decoded = jwt.verify(match[1], process.env.JWT_SECRET)
		socket.userId = String(decoded.userId)
		next()
	} catch {
		next(new Error('Unauthorized'))
	}
})

io.on('connection', socket => {
	const userId = socket.userId
	userSocketMap[userId] = socket.id

	// io.emit() is used to send events to all the connected clients
	io.emit('getOnlineUsers', Object.keys(userSocketMap))

	// Typing indicator events
	socket.on('typing', data => {
		const receiverSocketId = userSocketMap[data?.receiverId]
		if (receiverSocketId) {
			io.to(receiverSocketId).emit('userTyping', { senderId: userId })
		}
	})

	socket.on('stopTyping', data => {
		const receiverSocketId = userSocketMap[data?.receiverId]
		if (receiverSocketId) {
			io.to(receiverSocketId).emit('userStoppedTyping', { senderId: userId })
		}
	})

	socket.on('disconnect', () => {
		// If the user opened a newer tab, the map already points to that tab,
		// so only remove the entry when it still belongs to this socket.
		if (userSocketMap[userId] === socket.id) {
			delete userSocketMap[userId]
		}
		io.emit('getOnlineUsers', Object.keys(userSocketMap))
	})
})

export { app, io, server }
