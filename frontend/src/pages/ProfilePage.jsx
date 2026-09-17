import { Camera, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'

const ProfilePage = () => {
	const { authUser, isUpdatingProfile, updateProfile } = useAuthStore()
	const [selectedImg, setSelectedImg] = useState(null)

	const handleImageUpload = async e => {
		const file = e.target.files[0]
		if (!file) return

		const reader = new FileReader()
		reader.readAsDataURL(file)

		reader.onload = async () => {
			const base64Image = reader.result
			setSelectedImg(base64Image)
			await updateProfile({ profilePic: base64Image })
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
								src={selectedImg || authUser.profilePic || '/avatar.png'}
								alt="Profile"
								className="size-32 rounded-full object-cover border-4 border-base-content/10"
							/>
							<label
								htmlFor="avatar-upload"
								className={`
									absolute bottom-0 right-0 bg-primary hover:bg-primary/90
									p-2 rounded-full cursor-pointer transition-all duration-200
									${isUpdatingProfile ? 'animate-pulse pointer-events-none' : ''}
								`}
							>
								<Camera className="w-5 h-5 text-primary-content" />
								<input
									type="file"
									id="avatar-upload"
									className="hidden"
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
								<User className="w-4 h-4" />
								Full Name
							</div>
							<p className="px-4 py-2.5 bg-base-content/5 rounded-lg">
								{authUser?.fullName}
							</p>
						</div>

						<div className="space-y-1.5">
							<div className="text-sm text-base-content/60 flex items-center gap-2">
								<Mail className="w-4 h-4" />
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
								<span>{authUser.createdAt?.split('T')[0]}</span>
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
