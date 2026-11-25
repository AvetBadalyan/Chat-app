import mongoose from 'mongoose'
import Message from '../models/message.model.js'
import User from '../models/user.model.js'
import cloudinary from '../lib/cloudinary.js'
import { getReceiverSocketId, io } from '../lib/socket.js'
import { isImageDataUrl } from '../lib/utils.js'

const MAX_MESSAGE_LENGTH = 2000
const MAX_EMOJI_LENGTH = 8

export const getUsersForSidebar = async (req, res) => {
	try {
		const loggedInUserId = req.user._id
		const users = await User.find({
			_id: { $ne: loggedInUserId }
		})
			.select('fullName profilePic') // never send other users' emails
			.lean()

		// Newest first, so the first message we see for each contact is the latest
		const myMessages = await Message.find({
			$or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }]
		}).sort({ createdAt: -1 })

		// lastMessageAt = { contactId: time of the latest message with that contact }
		const lastMessageAt = {}
		for (const message of myMessages) {
			const iSentIt = String(message.senderId) === String(loggedInUserId)
			const contactId = String(iSentIt ? message.receiverId : message.senderId)
			if (!lastMessageAt[contactId]) {
				lastMessageAt[contactId] = message.createdAt
			}
		}

		const usersWithLastMessage = users.map(user => ({
			...user,
			lastMessageAt: lastMessageAt[String(user._id)] || null
		}))

		res.status(200).json(usersWithLastMessage)
	} catch (error) {
		console.error('Error in getUsersForSidebar: ', error.message)
		res.status(500).json({ message: 'Something went wrong. Please try again.' })
	}
}

export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params
		const myId = req.user._id

		if (!mongoose.isValidObjectId(userToChatId)) {
			return res.status(400).json({ message: 'Invalid user id' })
		}

		const messages = await Message.find({
			$or: [
				{ senderId: myId, receiverId: userToChatId },
				{ senderId: userToChatId, receiverId: myId }
			]
		}).sort({ createdAt: 1 })

		res.status(200).json(messages)
	} catch (error) {
		console.error('Error in getMessages controller: ', error.message)
		res.status(500).json({ message: 'Something went wrong. Please try again.' })
	}
}

export const sendMessage = async (req, res) => {
	try {
		const { text, image } = req.body
		const { id: receiverId } = req.params
		const senderId = req.user._id

		if (!mongoose.isValidObjectId(receiverId)) {
			return res.status(400).json({ message: 'Invalid user id' })
		}

		if (image && !isImageDataUrl(image)) {
			return res.status(400).json({ message: 'Please attach a valid image' })
		}

		// A message must contain at least text or an image.
		if (!text?.trim() && !image) {
			return res.status(400).json({ message: 'Message cannot be empty' })
		}

		if (text && text.length > MAX_MESSAGE_LENGTH) {
			return res.status(400).json({
				message: `Message must be at most ${MAX_MESSAGE_LENGTH} characters`
			})
		}

		const receiverExists = await User.exists({ _id: receiverId })
		if (!receiverExists) {
			return res.status(404).json({ message: 'User not found' })
		}

		let imageUrl
		if (image) {
			try {
				const uploadResponse = await cloudinary.uploader.upload(image)
				imageUrl = uploadResponse.secure_url
			} catch (cloudinaryError) {
				console.error('Cloudinary upload error:', cloudinaryError)
				return res.status(500).json({ message: 'Failed to upload image' })
			}
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			text: text?.trim(),
			image: imageUrl,
			reactions: []
		})

		await newMessage.save()

		const receiverSocketId = getReceiverSocketId(receiverId)
		if (receiverSocketId) {
			io.to(receiverSocketId).emit('newMessage', newMessage)
		}

		res.status(201).json(newMessage)
	} catch (error) {
		console.error('Error in sendMessage controller:', error)
		res.status(500).json({ message: 'Something went wrong. Please try again.' })
	}
}

export const addReaction = async (req, res) => {
	try {
		const { messageId } = req.params
		const { emoji } = req.body
		const userId = req.user._id

		if (!mongoose.isValidObjectId(messageId)) {
			return res.status(400).json({ message: 'Invalid message id' })
		}

		if (typeof emoji !== 'string' || !emoji || emoji.length > MAX_EMOJI_LENGTH) {
			return res.status(400).json({ message: 'A valid emoji is required' })
		}

		const message = await Message.findById(messageId)
		if (!message) {
			return res.status(404).json({ message: 'Message not found' })
		}

		// Only participants of the conversation can react to a message.
		const isParticipant =
			message.senderId.toString() === userId.toString() ||
			message.receiverId.toString() === userId.toString()
		if (!isParticipant) {
			return res
				.status(403)
				.json({ message: 'Not authorized to react to this message' })
		}

		// Check if user already reacted with this emoji
		const existingReactionIndex = message.reactions.findIndex(
			r => r.userId.toString() === userId.toString() && r.emoji === emoji
		)

		if (existingReactionIndex > -1) {
			// Remove the reaction (toggle off)
			message.reactions.splice(existingReactionIndex, 1)
		} else {
			// Remove any existing reaction from this user (one reaction per user)
			message.reactions = message.reactions.filter(
				r => r.userId.toString() !== userId.toString()
			)
			// Add new reaction
			message.reactions.push({ userId, emoji })
		}

		await message.save()

		// Emit to both sender and receiver
		const senderSocketId = getReceiverSocketId(message.senderId.toString())
		const receiverSocketId = getReceiverSocketId(message.receiverId.toString())

		const reactionUpdate = {
			messageId: message._id,
			reactions: message.reactions
		}

		if (senderSocketId) {
			io.to(senderSocketId).emit('messageReaction', reactionUpdate)
		}
		if (receiverSocketId && receiverSocketId !== senderSocketId) {
			io.to(receiverSocketId).emit('messageReaction', reactionUpdate)
		}

		res.status(200).json(message)
	} catch (error) {
		console.error('Error in addReaction controller:', error)
		res.status(500).json({ message: 'Something went wrong. Please try again.' })
	}
}
