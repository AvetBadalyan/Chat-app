import { ArrowLeft, X } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useChatStore } from '../store/useChatStore'

const ChatHeader = () => {
	const { selectedUser, setSelectedUser, typingUsers } = useChatStore()
	const { onlineUsers } = useAuthStore()

	const isTyping = selectedUser && typingUsers[selectedUser._id]
	const isOnline = onlineUsers.includes(selectedUser._id)

	return (
		<div className="p-2.5 border-b border-base-content/10">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					{/* Back arrow on mobile, X on desktop */}
					<button
						onClick={() => setSelectedUser(null)}
						className="btn btn-sm btn-ghost btn-circle hover:bg-base-content/10 lg:hidden"
						aria-label="Back to contacts"
					>
						<ArrowLeft className="size-5" />
					</button>

					{/* Avatar */}
					<div className="avatar">
						<div className="size-10 rounded-full relative">
							<img
								src={selectedUser.profilePic || '/avatar.png'}
								alt={selectedUser.fullName}
							/>
						</div>
					</div>

					{/* User info */}
					<div>
						<h3 className="font-medium">{selectedUser.fullName}</h3>
						<p className="text-sm text-base-content/60">
							{isTyping ? (
								<span className="text-primary flex items-center gap-1">
									<span>typing</span>
									<span className="loading loading-dots loading-xs" />
								</span>
							) : isOnline ? (
								<span className="text-success">Online</span>
							) : (
								'Offline'
							)}
						</p>
					</div>
				</div>

				{/* Close button — desktop only */}
				<button
					onClick={() => setSelectedUser(null)}
					className="btn btn-sm btn-ghost btn-circle hover:bg-base-content/10 hidden lg:flex"
					aria-label="Close conversation"
				>
					<X className="size-5" />
				</button>
			</div>
		</div>
	)
}

export default ChatHeader
