import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
	cors: {
		origin:
			process.env.NODE_ENV === 'production'
				? 'https://chat-app-avetbook.fly.dev'
				: ['http://localhost:5173'],
		credentials: true
	}
})

export function getReceiverSocketId(userId) {
	return userSocketMap[userId]
}

// used to store online users
const userSocketMap = {} // {userId: socketId}

io.on('connection', socket => {
	console.log('A user connected', socket.id)

	const userId = socket.handshake.query.userId
	if (userId) userSocketMap[userId] = socket.id

	// io.emit() is used to send events to all the connected clients
	io.emit('getOnlineUsers', Object.keys(userSocketMap))

	// Typing indicator events
	socket.on('typing', ({ receiverId }) => {
		const receiverSocketId = userSocketMap[receiverId]
		if (receiverSocketId) {
			io.to(receiverSocketId).emit('userTyping', { senderId: userId })
		}
	})

	socket.on('stopTyping', ({ receiverId }) => {
		const receiverSocketId = userSocketMap[receiverId]
		if (receiverSocketId) {
			io.to(receiverSocketId).emit('userStoppedTyping', { senderId: userId })
		}
	})

	socket.on('disconnect', () => {
		console.log('A user disconnected', socket.id)
		delete userSocketMap[userId]
		io.emit('getOnlineUsers', Object.keys(userSocketMap))
	})
})

export { app, io, server }
