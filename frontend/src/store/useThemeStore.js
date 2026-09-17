import { create } from 'zustand'

// Persisted theme key. Values: 'avet-light' | 'avet-dark'
const STORAGE_KEY = 'chat-theme'
const DARK = 'avet-dark'
const LIGHT = 'avet-light'

const savedTheme = localStorage.getItem(STORAGE_KEY)
// Accept legacy values ('dark'/'light') that may still be in storage
const initialTheme = savedTheme === DARK || savedTheme === 'dark' ? DARK : LIGHT

export const useThemeStore = create(set => ({
	theme: initialTheme,

	toggleTheme: () => {
		set(state => {
			const next = state.theme === DARK ? LIGHT : DARK
			localStorage.setItem(STORAGE_KEY, next)
			return { theme: next }
		})
	},

	isDark: () => {
		// Getter helper so components can check without importing constants
		return useThemeStore.getState().theme === DARK
	}
}))

export { DARK, LIGHT }
