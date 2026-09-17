import ChatContainer from '../components/ChatContainer'
import NoChatSelected from '../components/NoChatSelected'
import Sidebar from '../components/Sidebar'
import { useChatStore } from '../store/useChatStore'

const ChatPage = () => {
	const { selectedUser } = useChatStore()

	return (
		<div className="h-screen bg-base-200">
			<div className="flex items-center justify-center pt-20 px-2 sm:px-4">
				<div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)]">
					<div className="flex h-full rounded-lg overflow-hidden">
						{/*
							Responsive layout:
							- Mobile: show either the sidebar or the open conversation,
							  toggled by whether a user is selected (WhatsApp-style).
							- Desktop (lg+): show both side by side.
						*/}
						<div
							className={`${selectedUser ? 'hidden' : 'flex'} lg:flex h-full`}
						>
							<Sidebar />
						</div>

						<div
							className={`${
								selectedUser ? 'flex' : 'hidden'
							} lg:flex flex-1 h-full`}
						>
							{!selectedUser ? <NoChatSelected /> : <ChatContainer />}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ChatPage
