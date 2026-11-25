import { create } from 'zustand'

// Persisted theme key. Values: 'light' | 'dark'
const STORAGE_KEY = 'chat-theme'
const DARK = 'dark'
const LIGHT = 'light'

const savedTheme = localStorage.getItem(STORAGE_KEY)

// Use the saved choice. First-time visitors get their system preference.
let initialTheme
if (savedTheme === DARK || savedTheme === LIGHT) {
	initialTheme = savedTheme
} else {
	const systemPrefersDark = window.matchMedia(
		'(prefers-color-scheme: dark)'
	).matches
	initialTheme = systemPrefersDark ? DARK : LIGHT
}

// Set it right away (before React renders) so the page never flashes the wrong theme.
document.documentElement.setAttribute('data-theme', initialTheme)

export const useThemeStore = create(set => ({
	theme: initialTheme,

	toggleTheme: () => {
		set(state => {
			const next = state.theme === DARK ? LIGHT : DARK
			localStorage.setItem(STORAGE_KEY, next)
			return { theme: next }
		})
	}
}))

export { DARK, LIGHT }
