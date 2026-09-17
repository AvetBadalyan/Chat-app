import { create } from 'zustand'

export const useThemeStore = create(set => ({
	theme: localStorage.getItem('chat-theme') || 'dark',
	setTheme: theme => {
		localStorage.setItem('chat-theme', theme)
		set({ theme })
	},
	toggleTheme: () => {
		set(state => {
			const newTheme = state.theme === 'dark' ? 'light' : 'dark'
			localStorage.setItem('chat-theme', newTheme)
			return { theme: newTheme }
		})
	}
}))
