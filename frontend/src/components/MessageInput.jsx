import { Image, Send, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useChatStore } from '../store/useChatStore'

const MessageInput = () => {
	const [text, setText] = useState('')
	const [imagePreview, setImagePreview] = useState(null)
	const fileInputRef = useRef(null)
	const textareaRef = useRef(null)
	const typingTimeoutRef = useRef(null)
	const { sendMessage, emitTyping, emitStopTyping } = useChatStore()

	// Auto-resize textarea to fit content, up to the CSS max-height
	const resizeTextarea = () => {
		const el = textareaRef.current
		if (!el) return
		el.style.height = 'auto'
		el.style.height = `${el.scrollHeight}px`
	}

	// Cleanup typing timeout on unmount
	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current)
				emitStopTyping()
			}
		}
	}, [emitStopTyping])

	const handleTyping = useCallback(() => {
		emitTyping()

		// Clear existing timeout
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current)
		}

		// Set new timeout to stop typing after 2 seconds of inactivity
		typingTimeoutRef.current = setTimeout(() => {
			emitStopTyping()
		}, 2000)
	}, [emitTyping, emitStopTyping])

	const handleImageChange = e => {
		const file = e.target.files[0]
		if (!file) return

		if (!file.type.startsWith('image/')) {
			toast.error('Please select an image file')
			return
		}

		if (file.size > 5 * 1024 * 1024) {
			toast.error('Image must be smaller than 5 MB')
			return
		}

		const reader = new FileReader()
		reader.onloadend = () => {
			setImagePreview(reader.result)
		}
		reader.readAsDataURL(file)
	}

	const removeImage = () => {
		setImagePreview(null)
		if (fileInputRef.current) fileInputRef.current.value = ''
	}

	const handleSendMessage = async e => {
		e?.preventDefault()
		if (!text.trim() && !imagePreview) return

		// Stop typing indicator when sending
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current)
		}
		emitStopTyping()

		try {
			await sendMessage({
				text: text.trim(),
				image: imagePreview
			})

			// Clear form and reset textarea height
			setText('')
			setImagePreview(null)
			if (fileInputRef.current) fileInputRef.current.value = ''
			if (textareaRef.current) {
				textareaRef.current.style.height = 'auto'
			}
		} catch (error) {
			console.error('Failed to send message:', error)
		}
	}

	const handleTextChange = e => {
		setText(e.target.value)
		resizeTextarea()
		if (e.target.value.trim()) {
			handleTyping()
		} else {
			// Stop typing if text is empty
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current)
			}
			emitStopTyping()
		}
	}

	// Send on Enter, new line on Shift+Enter
	const handleKeyDown = e => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSendMessage()
		}
	}

	return (
		<div className="p-4 w-full">
			{imagePreview && (
				<div className="mb-3 flex items-center gap-2">
					<div className="relative">
						<img
							src={imagePreview}
							alt="Preview"
							className="w-20 h-20 object-cover rounded-lg border border-base-content/10"
						/>
						<button
							onClick={removeImage}
							className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-base-300 hover:bg-base-content/20
              flex items-center justify-center transition-colors"
							type="button"
							aria-label="Remove image"
						>
							<X className="size-3" />
						</button>
					</div>
				</div>
			)}

			<form
				onSubmit={handleSendMessage}
				className="flex items-end gap-2"
			>
				<div className="flex-1 flex gap-2">
					<textarea
						ref={textareaRef}
						className="w-full textarea rounded-lg resize-none min-h-[44px] max-h-32 py-3 leading-tight bg-base-200/50 border border-base-content/10 focus:border-primary/30 focus:bg-base-200 overflow-y-auto"
						placeholder="Type a message..."
						value={text}
						onChange={handleTextChange}
						onKeyDown={handleKeyDown}
						rows={1}
					/>
					<input
						type="file"
						accept="image/*"
						className="hidden"
						ref={fileInputRef}
						onChange={handleImageChange}
					/>

					<button
						type="button"
						className={`flex btn btn-circle btn-ghost self-end
                     ${imagePreview ? 'text-success' : 'text-base-content/40 hover:text-base-content/70'}`}
						onClick={() => fileInputRef.current?.click()}
						aria-label="Attach image"
					>
						<Image size={20} />
					</button>
				</div>
				<button
					type="submit"
					className="btn btn-circle btn-primary"
					disabled={!text.trim() && !imagePreview}
					aria-label="Send message"
				>
					<Send size={20} />
				</button>
			</form>
		</div>
	)
}
export default MessageInput
