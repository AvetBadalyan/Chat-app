import axios from 'axios'

export const axiosInstance = axios.create({
	baseURL:
		import.meta.env.MODE === 'development'
			? 'http://localhost:5001/api'
			: '/api',
	withCredentials: true
})

/**
 * Normalizes any axios/network error into a user-friendly message.
 * The backend returns either { message } (auth) or { error } (messages),
 * so we check both before falling back to network-aware defaults.
 */
export const getErrorMessage = error => {
	const data = error?.response?.data
	const message = data?.message || data?.error
	if (message) return message
	if (error?.code === 'ERR_NETWORK')
		return 'Unable to connect to server. Please check your connection.'
	return 'Something went wrong. Please try again.'
}
