import toast from 'react-hot-toast'
import { create } from 'zustand'
import { axiosInstance, getErrorMessage } from '../lib/axios'
import { useAuthStore } from './useAuthStore'

export const useChatStore = create((set, get) => ({
	messages: [],
	users: [],
	selectedUser: null,
	isUsersLoading: false,
	isMessagesLoading: false,
	typingUsers: {}, // { odvrčt123: true } - tracks who is typing
	unreadCounts: {}, // { odvrčt123: 2 } - tracks unread message counts per user

	getUsers: async () => {
		set({ isUsersLoading: true })
		try {
			const res = await axiosInstance.get('/messages/users')
			set({ users: res.data })
		} catch (error) {
			toast.error(getErrorMessage(error))
		} finally {
			set({ isUsersLoading: false })
		}
	},

	getMessages: async userId => {
		set({ isMessagesLoading: true })
		try {
			const res = await axiosInstance.get(`/messages/${userId}`)
			set({ messages: res.data })
		} catch (error) {
			toast.error(getErrorMessage(error))
		} finally {
			set({ isMessagesLoading: false })
		}
	},

	sendMessage: async messageData => {
		const { selectedUser, messages } = get()
		try {
			const res = await axiosInstance.post(
				`/messages/send/${selectedUser._id}`,
				messageData
			)
			set({ messages: [...messages, res.data] })
		} catch (error) {
			toast.error(getErrorMessage(error))
		}
	},

	addReaction: async (messageId, emoji) => {
		try {
			await axiosInstance.post(`/messages/react/${messageId}`, { emoji })
			// Real-time update will come via socket
		} catch (error) {
			toast.error(getErrorMessage(error))
		}
	},

	// Subscribe to all socket events. Safe to call on every `connect`
	// (including reconnects) because we clear prior listeners first,
	// which prevents duplicate handlers stacking up after a reconnection.
	subscribeToSocket: () => {
		const socket = useAuthStore.getState().socket
		if (!socket) return

		socket.off('newMessage')
		socket.off('messageReaction')
		socket.off('userTyping')
		socket.off('userStoppedTyping')

		// Listen for new messages from anyone
		socket.on('newMessage', newMessage => {
			const { selectedUser, messages, unreadCounts } = get()

			// If message is from currently selected user, add to messages
			if (selectedUser && newMessage.senderId === selectedUser._id) {
				set({ messages: [...messages, newMessage] })
			} else {
				// Otherwise, increment unread count for that sender
				const senderId = newMessage.senderId
				set({
					unreadCounts: {
						...unreadCounts,
						[senderId]: (unreadCounts[senderId] || 0) + 1
					}
				})
			}
		})

		// Listen for reaction updates
		socket.on('messageReaction', ({ messageId, reactions }) => {
			set({
				messages: get().messages.map(msg =>
					msg._id === messageId ? { ...msg, reactions } : msg
				)
			})
		})

		// Listen for typing indicators
		socket.on('userTyping', ({ senderId }) => {
			const { selectedUser, typingUsers } = get()
			if (selectedUser && senderId === selectedUser._id) {
				set({ typingUsers: { ...typingUsers, [senderId]: true } })
			}
		})

		socket.on('userStoppedTyping', ({ senderId }) => {
			const { typingUsers } = get()
			const newTypingUsers = { ...typingUsers }
			delete newTypingUsers[senderId]
			set({ typingUsers: newTypingUsers })
		})
	},

	// Unsubscribe from all socket events (called on logout)
	unsubscribeFromSocket: () => {
		const socket = useAuthStore.getState().socket
		if (!socket) return

		socket.off('newMessage')
		socket.off('messageReaction')
		socket.off('userTyping')
		socket.off('userStoppedTyping')
	},

	// Emit typing event to the selected user
	emitTyping: () => {
		const { selectedUser } = get()
		if (!selectedUser) return
		const socket = useAuthStore.getState().socket
		socket?.emit('typing', { receiverId: selectedUser._id })
	},

	// Emit stop typing event
	emitStopTyping: () => {
		const { selectedUser } = get()
		if (!selectedUser) return
		const socket = useAuthStore.getState().socket
		socket?.emit('stopTyping', { receiverId: selectedUser._id })
	},

	// Clear unread count for a specific user
	clearUnreadCount: userId => {
		const { unreadCounts } = get()
		const newUnreadCounts = { ...unreadCounts }
		delete newUnreadCounts[userId]
		set({ unreadCounts: newUnreadCounts })
	},

	setSelectedUser: selectedUser => {
		// Clear unread count when selecting a user
		if (selectedUser) {
			get().clearUnreadCount(selectedUser._id)
		}
		set({ selectedUser, typingUsers: {} })
	},

	// Called on logout to wipe all conversation state
	resetState: () => {
		set({
			messages: [],
			selectedUser: null,
			typingUsers: {},
			unreadCounts: {}
		})
	}
}))
