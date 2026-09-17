import mongoose from 'mongoose'

export const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGODB_URI, {
			// TLS options for Node.js 22+ compatibility
			tls: true,
			tlsAllowInvalidCertificates: false,
			tlsAllowInvalidHostnames: false,
			serverSelectionTimeoutMS: 30000,
			socketTimeoutMS: 45000
		})
		console.log(`MongoDB connected: ${conn.connection.host}`)
	} catch (error) {
		console.error('MongoDB connection error:', error)
		process.exit(1)
	}
}
