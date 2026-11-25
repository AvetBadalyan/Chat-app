import { config } from 'dotenv'

// Import this file first so every other module sees the .env values.
config({ quiet: true })

export const isProduction = process.env.NODE_ENV === 'production'

// The only website allowed to call the API and open sockets.
export const CLIENT_ORIGIN = isProduction
	? 'https://avetbook-chat-app.onrender.com'
	: 'http://localhost:5173'
