import { Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useChatStore } from '../store/useChatStore'
import SidebarSkeleton from './skeletons/SidebarSkeleton'

const Sidebar = () => {
	const {
		getUsers,
		users,
		selectedUser,
		setSelectedUser,
		isUsersLoading,
		unreadCounts
	} = useChatStore()

	const { onlineUsers } = useAuthStore()
	const [showOnlineOnly, setShowOnlineOnly] = useState(false)

	useEffect(() => {
		getUsers()
	}, [getUsers])

	const filteredUsers = showOnlineOnly
		? users.filter(user => onlineUsers.includes(user._id))
		: users

	// Sort users: those with unread messages first
	const sortedUsers = [...filteredUsers].sort((a, b) => {
		const unreadA = unreadCounts[a._id] || 0
		const unreadB = unreadCounts[b._id] || 0
		return unreadB - unreadA
	})

	if (isUsersLoading) return <SidebarSkeleton />

	return (
		<aside className="h-full w-20 lg:w-72 border-r border-base-content/10 flex flex-col transition-all duration-200">
			<div className="border-b border-base-content/10 w-full p-5">
				<div className="flex items-center gap-2">
					<Users className="size-6" />
					<span className="font-medium hidden lg:block">Contacts</span>
				</div>
				{/* Online filter toggle */}
				<div className="mt-3 hidden lg:flex items-center gap-2">
					<label className="cursor-pointer flex items-center gap-2">
						<input
							type="checkbox"
							checked={showOnlineOnly}
							onChange={e => setShowOnlineOnly(e.target.checked)}
							className="checkbox checkbox-sm"
						/>
						<span className="text-sm">Show online only</span>
					</label>
					<span className="text-xs text-base-content/50">
						({onlineUsers.length - 1} online)
					</span>
				</div>
			</div>

			<div className="overflow-y-auto w-full py-3">
				{sortedUsers.map(user => {
					const unreadCount = unreadCounts[user._id] || 0

					return (
						<button
							key={user._id}
							onClick={() => setSelectedUser(user)}
							className={`
                w-full p-3 flex items-center gap-3 rounded-lg mx-1
                transition-colors animate-fade-in
                ${
									selectedUser?._id === user._id
										? 'bg-primary/10 text-primary'
										: 'hover:bg-base-content/5'
								}
              `}
						>
							<div className="relative mx-auto lg:mx-0">
								<img
									src={user.profilePic || '/avatar.png'}
									alt={user.name}
									className="size-12 object-cover rounded-full"
								/>
								{onlineUsers.includes(user._id) && (
									<span
										className="absolute bottom-0 right-0 size-3 bg-green-500 
                    rounded-full ring-2 ring-base-100"
									/>
								)}
								{/* Unread badge - shown on avatar for mobile */}
								{unreadCount > 0 && (
									<span
										className="absolute -top-1 -right-1 size-5 bg-primary text-primary-content
                    rounded-full flex items-center justify-center text-xs font-bold lg:hidden"
									>
										{unreadCount > 9 ? '9+' : unreadCount}
									</span>
								)}
							</div>

							{/* User info - only visible on larger screens */}
							<div className="hidden lg:block text-left min-w-0 flex-1">
								<div className="flex items-center justify-between">
									<span className="font-medium truncate">{user.fullName}</span>
									{/* Unread badge - shown next to name for desktop */}
									{unreadCount > 0 && (
										<span className="badge badge-primary badge-sm">
											{unreadCount > 99 ? '99+' : unreadCount}
										</span>
									)}
								</div>
								<div className="text-sm text-base-content/60">
									{onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
								</div>
							</div>
						</button>
					)
				})}

				{filteredUsers.length === 0 && (
					<div className="text-center text-base-content/50 py-4">
						No online users
					</div>
				)}
			</div>
		</aside>
	)
}
export default Sidebar
