import jwt from 'jsonwebtoken'

export const generateToken = (userId, res) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: '7d'
	})

	res.cookie('jwt', token, {
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		httpOnly: true, // prevent XSS attacks
		sameSite: 'strict', // prevent CSRF attacks
		secure: process.env.NODE_ENV !== 'development'
	})

	return token
}

// True only for a non-empty string. Stops objects like { $gt: '' } from
// reaching MongoDB queries.
export const isText = value => {
	return typeof value === 'string' && value.trim() !== ''
}

// Only accept uploads that are real image data URLs from our own frontend.
// Cloudinary would also download any http(s) link we pass it, so we block that.
export const isImageDataUrl = value => {
	return typeof value === 'string' && value.startsWith('data:image/')
}
