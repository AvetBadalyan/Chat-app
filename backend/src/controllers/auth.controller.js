import bcrypt from 'bcryptjs'
import cloudinary from '../lib/cloudinary.js'
import { generateToken, isImageDataUrl, isText } from '../lib/utils.js'
import User from '../models/user.model.js'

export const signup = async (req, res) => {
	const { fullName, email, password } = req.body

	try {
		// Check the types first so objects like { $gt: '' } never reach MongoDB.
		if (!isText(fullName) || !isText(email) || !isText(password)) {
			return res.status(400).json({ message: 'Please fill in all fields' })
		}

		const cleanName = fullName.trim()
		const cleanEmail = email.trim().toLowerCase()

		if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
			return res
				.status(400)
				.json({ message: 'Please enter a valid email address' })
		}

		if (password.length < 6) {
			return res
				.status(400)
				.json({ message: 'Password must be at least 6 characters' })
		}

		// bcrypt only uses the first 72 bytes of a password
		if (password.length > 72) {
			return res
				.status(400)
				.json({ message: 'Password must be at most 72 characters' })
		}

		const user = await User.findOne({ email: cleanEmail })
		if (user) {
			return res
				.status(400)
				.json({ message: 'An account with this email already exists' })
		}

		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(password, salt)

		const newUser = new User({
			fullName: cleanName,
			email: cleanEmail,
			password: hashedPassword
		})

		// Persist the user first, then issue the auth cookie. This avoids
		// handing out a valid token for a user that failed to save.
		await newUser.save()
		generateToken(newUser._id, res)

		res.status(201).json({
			_id: newUser._id,
			fullName: newUser.fullName,
			email: newUser.email,
			profilePic: newUser.profilePic,
			createdAt: newUser.createdAt
		})
	} catch (error) {
		console.error('Error in signup controller', error.message)
		res.status(500).json({ message: 'Something went wrong. Please try again.' })
	}
}

export const login = async (req, res) => {
	const { email, password } = req.body
	try {
		// Same type check as signup: blocks objects like { $gt: '' }
		if (!isText(email) || !isText(password)) {
			return res.status(400).json({ message: 'Please fill in all fields' })
		}

		const user = await User.findOne({ email: email.trim().toLowerCase() })

		if (!user) {
			return res.status(400).json({ message: 'Invalid email or password' })
		}

		const isPasswordValid = await bcrypt.compare(password, user.password)
		if (!isPasswordValid) {
			return res.status(400).json({ message: 'Invalid email or password' })
		}

		generateToken(user._id, res)

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
			profilePic: user.profilePic,
			createdAt: user.createdAt
		})
	} catch (error) {
		console.error('Error in login controller', error.message)
		res.status(500).json({ message: 'Something went wrong. Please try again.' })
	}
}

export const logout = (req, res) => {
	try {
		// Clear the cookie using the same attributes it was set with,
		// otherwise some browsers won't remove it.
		res.cookie('jwt', '', {
			maxAge: 0,
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV !== 'development'
		})
		res.status(200).json({ message: 'Logged out successfully' })
	} catch (error) {
		console.error('Error in logout controller', error.message)
		res.status(500).json({ message: 'Something went wrong. Please try again.' })
	}
}

export const updateProfile = async (req, res) => {
	try {
		const { profilePic } = req.body
		const userId = req.user._id

		if (!isImageDataUrl(profilePic)) {
			return res.status(400).json({ message: 'Please select an image' })
		}

		const uploadResponse = await cloudinary.uploader.upload(profilePic)
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ profilePic: uploadResponse.secure_url },
			{ new: true }
		).select('-password')

		res.status(200).json(updatedUser)
	} catch (error) {
		console.error('Error updating profile:', error.message)
		res
			.status(500)
			.json({ message: 'Could not update profile. Please try again.' })
	}
}

export const checkAuth = (req, res) => {
	try {
		res.status(200).json(req.user)
	} catch (error) {
		console.error('Error in checkAuth controller', error.message)
		res.status(500).json({ message: 'Something went wrong. Please try again.' })
	}
}
