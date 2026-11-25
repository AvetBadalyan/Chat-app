import express from 'express'
import rateLimit from 'express-rate-limit'
import {
	checkAuth,
	login,
	logout,
	signup,
	updateProfile
} from '../controllers/auth.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'

const router = express.Router()

// Slows down password guessing: at most 30 login/signup tries per IP every 15 minutes
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 30,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	message: { message: 'Too many attempts. Please try again in a few minutes.' }
})

router.post('/signup', authLimiter, signup)
router.post('/login', authLimiter, login)
router.post('/logout', logout)
router.put('/update-profile', protectRoute, updateProfile)
// Visitors with no cookie get 200 + null instead of a 401, so the browser
// console stays free of an error on the public pages.
router.get(
	'/check',
	(req, res, next) => {
		if (!req.cookies.jwt) return res.status(200).json(null)
		next()
	},
	protectRoute,
	checkAuth
)

export default router
