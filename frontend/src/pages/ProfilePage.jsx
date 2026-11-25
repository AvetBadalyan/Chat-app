import { Camera, Mail, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/useAuthStore'

const ProfilePage = () => {
	const { authUser, isUpdatingProfile, updateProfile } = useAuthStore()

	const handleImageUpload = async e => {
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
		reader.readAsDataURL(file)

		// The photo on screen changes only after the server has saved it
		reader.onload = async () => {
			await updateProfile({ profilePic: reader.result })
		}
	}

	return (
		<div className="min-h-screen pt-20 pb-10 animate-fade-in">
			<div className="max-w-2xl mx-auto p-4">
				<div className="bg-base-200/50 rounded-2xl p-6 space-y-8 border border-base-content/5">
					<div className="text-center">
						<h1 className="text-2xl font-bold">Profile</h1>
						<p className="mt-2 text-base-content/60">
							Your profile information
						</p>
					</div>

					{/* Avatar upload */}
					<div className="flex flex-col items-center gap-4">
						<div className="relative">
							<img
								src={authUser?.profilePic || '/avatar.png'}
								alt="Profile"
								className="size-32 rounded-full object-cover border-4 border-base-content/10"
							/>
							<label
								htmlFor="avatar-upload"
								className={`
									absolute bottom-0 right-0 bg-primary hover:bg-primary/90
									p-2 rounded-full cursor-pointer transition-all duration-200
									focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-base-100
									${isUpdatingProfile ? 'animate-pulse pointer-events-none' : ''}
								`}
							>
								<Camera
									className="size-5 text-primary-content"
									aria-hidden="true"
								/>
								<span className="sr-only">Change profile photo</span>
								<input
									type="file"
									id="avatar-upload"
									className="sr-only"
									accept="image/*"
									onChange={handleImageUpload}
									disabled={isUpdatingProfile}
								/>
							</label>
						</div>
						<p className="text-sm text-base-content/60">
							{isUpdatingProfile
								? 'Uploading...'
								: 'Click the camera icon to update your photo'}
						</p>
					</div>

					{/* User info */}
					<div className="space-y-4">
						<div className="space-y-1.5">
							<div className="text-sm text-base-content/60 flex items-center gap-2">
								<User className="size-4" />
								Full Name
							</div>
							<p className="px-4 py-2.5 bg-base-content/5 rounded-lg">
								{authUser?.fullName}
							</p>
						</div>

						<div className="space-y-1.5">
							<div className="text-sm text-base-content/60 flex items-center gap-2">
								<Mail className="size-4" />
								Email Address
							</div>
							<p className="px-4 py-2.5 bg-base-content/5 rounded-lg">
								{authUser?.email}
							</p>
						</div>
					</div>

					{/* Account info */}
					<div className="bg-base-content/5 rounded-xl p-6">
						<h2 className="text-lg font-medium mb-4">Account Information</h2>
						<div className="space-y-3 text-sm">
							<div className="flex items-center justify-between py-2 border-b border-base-content/5">
								<span className="text-base-content/60">Member Since</span>
								<span>
									{authUser?.createdAt
										? new Date(authUser.createdAt).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'long',
												day: 'numeric'
											})
										: '—'}
								</span>
							</div>
							<div className="flex items-center justify-between py-2">
								<span className="text-base-content/60">Account Status</span>
								<span className="text-success">Active</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ProfilePage
