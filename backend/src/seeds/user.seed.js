import bcrypt from 'bcryptjs'
import { config } from 'dotenv'
import { connectDB } from '../lib/db.js'
import User from '../models/user.model.js'

config()

const seedUsers = [
	// Demo Account - for portfolio visitors to try the app
	{
		email: 'demo@avetbook.com',
		fullName: 'Demo User',
		password: 'demo123456',
		profilePic:
			'https://api.dicebear.com/7.x/avataaars/svg?seed=demo&backgroundColor=b6e3f4'
	},
	// Female Users
	{
		email: 'nare.harutyunyan@example.com',
		fullName: 'Nare Harutyunyan',
		password: '123456',
		profilePic: 'https://randomuser.me/api/portraits/women/1.jpg'
	},
	{
		email: 'anna.stepanyan@example.com',
		fullName: 'Anna Stepanyan',
		password: '123456',
		profilePic: 'https://randomuser.me/api/portraits/women/2.jpg'
	},
	{
		email: 'mariam.hovhannisyan@example.com',
		fullName: 'Mariam Hovhannisyan',
		password: '123456',
		profilePic: 'https://randomuser.me/api/portraits/women/3.jpg'
	},
	{
		email: 'arine.karapetyan@example.com',
		fullName: 'Arine Karapetyan',
		password: '123456',
		profilePic: 'https://randomuser.me/api/portraits/women/4.jpg'
	},
	{
		email: 'lilit.sargsyan@example.com',
		fullName: 'Lilit Sargsyan',
		password: '123456',
		profilePic: 'https://randomuser.me/api/portraits/women/5.jpg'
	},
	{
		email: 'anahit.ghazaryan@example.com',
		fullName: 'Anahit Ghazaryan',
		password: '123456',
		profilePic: 'https://randomuser.me/api/portraits/women/6.jpg'
	},
	{
		email: 'susanna.vardanyan@example.com',
		fullName: 'Susanna Vardanyan',
		password: '123456',
		profilePic: 'https://randomuser.me/api/portraits/women/7.jpg'
	},
	{
		email: 'karine.melkonyan@example.com',
		fullName: 'Karine Melkonyan',
		password: '123456',
		profilePic: 'https://randomuser.me/api/portraits/women/8.jpg'
	},

	// Male Users
	{
		email: 'armen.hakobyan@example.com',
		fullName: 'Armen Hakobyan',
		password: '123456',
		profilePic: 'https://randomuser.me/api/portraits/men/1.jpg'
	},
	{
		email: 'davit.grigoryan@example.com',
		fullName: 'Davit Grigoryan',
		password: '123456',
		profilePic: 'https://randomuser.me/api/portraits/men/2.jpg'
	},
	{
		email: 'aram.khachatryan@example.com',
		fullName: 'Aram Khachatryan',
		password: '123456',
		profilePic: 'https://randomuser.me/api/portraits/men/3.jpg'
	},
	{
		email: 'vahan.simonyan@example.com',
		fullName: 'Vahan Simonyan',
		password: '123456',
		profilePic: 'https://randomuser.me/api/portraits/men/4.jpg'
	},
	{
		email: 'artur.abrahamyan@example.com',
		fullName: 'Artur Abrahamyan',
		password: '123456',
		profilePic: 'https://randomuser.me/api/portraits/men/5.jpg'
	},
	{
		email: 'suren.martirosyan@example.com',
		fullName: 'Suren Martirosyan',
		password: '123456',
		profilePic: 'https://randomuser.me/api/portraits/men/6.jpg'
	},
	{
		email: 'hayk.avetisyan@example.com',
		fullName: 'Hayk Avetisyan',
		password: '123456',
		profilePic: 'https://randomuser.me/api/portraits/men/7.jpg'
	}
]

const seedDatabase = async () => {
	try {
		await connectDB()

		// Hash passwords before inserting
		const salt = await bcrypt.genSalt(10)
		const usersWithHashedPasswords = await Promise.all(
			seedUsers.map(async user => ({
				...user,
				password: await bcrypt.hash(user.password, salt)
			}))
		)

		await User.insertMany(usersWithHashedPasswords)
		console.log(
			'Database seeded successfully with',
			usersWithHashedPasswords.length,
			'users'
		)
	} catch (error) {
		console.error('Error seeding database:', error)
	}
}

seedDatabase()
