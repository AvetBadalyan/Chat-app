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
	typingUsers: {}, // { userId: true } - tracks who is typing
	unreadCounts: {}, // { userId: 2 } - tracks unread message counts per user

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
			// Ignore this answer if the user already opened a different chat
			if (get().selectedUser?._id === userId) {
				set({ messages: res.data })
			}
		} catch (error) {
			toast.error(getErrorMessage(error))
		} finally {
			// An older request must not hide the skeleton of a newer one
			if (get().selectedUser?._id === userId) {
				set({ isMessagesLoading: false })
			}
		}
	},

	// Returns true when the message was sent, false when it failed
	sendMessage: async messageData => {
		const { selectedUser } = get()
		try {
			const res = await axiosInstance.post(
				`/messages/send/${selectedUser._id}`,
				messageData
			)
			// Read the latest messages now (new ones may have arrived while sending),
			// and only add it if the same chat is still open.
			if (get().selectedUser?._id === selectedUser._id) {
				set({ messages: [...get().messages, res.data] })
			}
			get().bumpContact(selectedUser._id)
			return true
		} catch (error) {
			toast.error(getErrorMessage(error))
			return false
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

	// Remember "now" as the latest message time of a contact, so that
	// contact moves to the top of the list.
	bumpContact: contactId => {
		set({
			users: get().users.map(user =>
				user._id === contactId
					? { ...user, lastMessageAt: new Date().toISOString() }
					: user
			)
		})
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

			get().bumpContact(newMessage.senderId)
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
		// Clicking the chat that is already open changes nothing
		if (selectedUser && selectedUser._id === get().selectedUser?._id) return

		// Clear unread count when selecting a user
		if (selectedUser) {
			get().clearUnreadCount(selectedUser._id)
		}
		// Clear the old chat right away so it is never shown inside the new one
		set({
			selectedUser,
			messages: [],
			isMessagesLoading: Boolean(selectedUser),
			typingUsers: {}
		})
	},

	// Called on logout to wipe all conversation state
	resetState: () => {
		set({
			messages: [],
			users: [],
			selectedUser: null,
			isMessagesLoading: false,
			typingUsers: {},
			unreadCounts: {}
		})
	}
}))
