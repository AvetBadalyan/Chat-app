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
 * 500 { ok: false, error }    if the database is unreachable
 */
router.get('/', async (_req, res) => {
	try {
		await User.estimatedDocumentCount()
		res.status(200).json({ ok: true })
	} catch (error) {
		res.status(500).json({ ok: false, error: error.message })
	}
})

export default router
