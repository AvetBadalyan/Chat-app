import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore'

import { SmilePlus } from 'lucide-react'
import { formatMessageTime } from '../lib/utils'
import { useAuthStore } from '../store/useAuthStore'
import ChatHeader from './ChatHeader'
import MessageInput from './MessageInput'
import MessageSkeleton from './skeletons/MessageSkeleton'

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡']

const TypingIndicator = () => {
	return (
		<div className="chat chat-start">
			<div className="chat-bubble bg-base-300 flex items-center gap-1 py-2 px-4">
				<span className="loading loading-dots loading-sm"></span>
			</div>
		</div>
	)
}

const ReactionPicker = ({ onSelect, onClose, position }) => {
	// Position picker above or below based on message position
	const positionClass =
		position === 'end' ? 'right-0 bottom-full mb-2' : 'left-0 bottom-full mb-2'

	return (
		<div
			className={`absolute ${positionClass} bg-base-100 rounded-xl p-1.5 shadow-lg flex gap-0.5 z-50 border border-base-content/10 animate-scale-in`}
		>
			{REACTION_EMOJIS.map(emoji => (
				<button
					key={emoji}
					onClick={e => {
						e.stopPropagation()
						onSelect(emoji)
						onClose()
					}}
					className="hover:bg-base-content/10 p-1.5 rounded-lg transition-all text-lg hover:scale-110 active:scale-95"
				>
					{emoji}
				</button>
			))}
		</div>
	)
}

const MessageReactions = ({
	reactions,
	onAddReaction,
	authUserId,
	messageId,
	openPickerId,
	setOpenPickerId,
	position
}) => {
	const isPickerOpen = openPickerId === messageId

	// Group reactions by emoji and count them
	const groupedReactions =
		reactions?.reduce((acc, reaction) => {
			if (!acc[reaction.emoji]) {
				acc[reaction.emoji] = { count: 0, userIds: [] }
			}
			acc[reaction.emoji].count++
			acc[reaction.emoji].userIds.push(reaction.userId)
			return acc
		}, {}) || {}

	const handleTogglePicker = e => {
		e.stopPropagation()
		setOpenPickerId(isPickerOpen ? null : messageId)
	}

	return (
		<div className="flex items-center gap-1 mt-1 flex-wrap">
			{Object.entries(groupedReactions).map(([emoji, data]) => {
				const hasUserReacted = data.userIds.includes(authUserId)
				return (
					<button
						key={emoji}
						onClick={() => onAddReaction(emoji)}
						className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm transition-all
              ${
								hasUserReacted
									? 'bg-primary/15 border border-primary/30'
									: 'bg-base-content/5 hover:bg-base-content/10'
							}`}
					>
						<span>{emoji}</span>
						<span className="text-xs">{data.count}</span>
					</button>
				)
			})}

			<div className="relative">
				<button
					onClick={handleTogglePicker}
					className="p-1 rounded-full hover:bg-base-content/10 transition-colors opacity-0 group-hover:opacity-100"
				>
					<SmilePlus className="size-4 text-base-content/50" />
				</button>
				{isPickerOpen && (
					<ReactionPicker
						onSelect={onAddReaction}
						onClose={() => setOpenPickerId(null)}
						position={position}
					/>
				)}
			</div>
		</div>
	)
}

const ChatContainer = () => {
	const {
		messages,
		getMessages,
		isMessagesLoading,
		selectedUser,
		subscribeToMessages,
		unsubscribeFromMessages,
		typingUsers,
		addReaction
	} = useChatStore()
	const { authUser } = useAuthStore()
	const messageEndRef = useRef(null)
	const [openPickerId, setOpenPickerId] = useState(null)

	const isSelectedUserTyping = selectedUser && typingUsers[selectedUser._id]

	useEffect(() => {
		getMessages(selectedUser._id)

		subscribeToMessages()

		return () => unsubscribeFromMessages()
	}, [
		selectedUser._id,
		getMessages,
		subscribeToMessages,
		unsubscribeFromMessages
	])

	useEffect(() => {
		if (messageEndRef.current && messages) {
			messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
		}
	}, [messages, isSelectedUserTyping])

	// Close picker when clicking outside
	useEffect(() => {
		const handleClickOutside = () => {
			if (openPickerId) {
				setOpenPickerId(null)
			}
		}
		document.addEventListener('click', handleClickOutside)
		return () => document.removeEventListener('click', handleClickOutside)
	}, [openPickerId])

	const handleAddReaction = (messageId, emoji) => {
		addReaction(messageId, emoji)
	}

	if (isMessagesLoading) {
		return (
			<div className="flex-1 flex flex-col overflow-auto">
				<ChatHeader />
				<MessageSkeleton />
				<MessageInput />
			</div>
		)
	}

	return (
		<div className="flex-1 flex flex-col overflow-auto">
			<ChatHeader />

			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.length === 0 ? (
					<div className="flex-1 flex flex-col items-center justify-center h-full text-center animate-fade-in">
						<div className="text-4xl mb-4">👋</div>
						<h3 className="font-medium text-lg mb-1">No messages yet</h3>
						<p className="text-base-content/60 text-sm">
							Send a message to start the conversation
						</p>
					</div>
				) : (
					messages.map(message => {
						const isOwnMessage = message.senderId === authUser._id
						return (
							<div
								key={message._id}
								className={`chat group animate-slide-up ${isOwnMessage ? 'chat-end' : 'chat-start'}`}
							>
								<div className="chat-image avatar">
									<div className="size-10 rounded-full border border-base-content/10">
										<img
											src={
												isOwnMessage
													? authUser.profilePic || '/avatar.png'
													: selectedUser.profilePic || '/avatar.png'
											}
											alt="profile pic"
										/>
									</div>
								</div>
								<div className="chat-header mb-1">
									<time className="text-xs opacity-50 ml-1">
										{formatMessageTime(message.createdAt)}
									</time>
								</div>
								<div className="chat-bubble flex flex-col">
									{message.image && (
										<img
											src={message.image}
											alt="Attachment"
											className="sm:max-w-[200px] rounded-md mb-2"
										/>
									)}
									{message.text && <p>{message.text}</p>}
								</div>
								<div
									className={`chat-footer ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
								>
									<MessageReactions
										reactions={message.reactions}
										onAddReaction={emoji =>
											handleAddReaction(message._id, emoji)
										}
										authUserId={authUser._id}
										messageId={message._id}
										openPickerId={openPickerId}
										setOpenPickerId={setOpenPickerId}
										position={isOwnMessage ? 'end' : 'start'}
									/>
								</div>
							</div>
						)
					})
				)}

				{/* Typing indicator */}
				{isSelectedUserTyping && <TypingIndicator />}

				<div ref={messageEndRef} />
			</div>

			<MessageInput />
		</div>
	)
}
export default ChatContainer
