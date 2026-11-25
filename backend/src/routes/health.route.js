import express from 'express'
import User from '../models/user.model.js'

const router = express.Router()

/**
 * Keep-alive health check.
 *
 * Runs one tiny, read-only query against MongoDB so an uptime monitor
 * (e.g. UptimeRobot) pinging this endpoint keeps the Atlas cluster warm and
 * prevents free-tier idling. estimatedDocumentCount() reads collection
 * metadata only — no documents are scanned and nothing is written.
 *
 * 200 { ok: true }            on success
 * 500 { ok: false }           if the database is unreachable
 */
router.get('/', async (_req, res) => {
	try {
		await User.estimatedDocumentCount()
		res.status(200).json({ ok: true })
	} catch (error) {
		console.error('Health check failed:', error.message)
		res.status(500).json({ ok: false })
	}
})

export default router
