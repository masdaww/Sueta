import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `BASE_PATH` is set by the GitHub Pages deploy workflow to `/Sueta/`.
// Locally it stays `/`, so `npm run dev` and `npm run preview` keep working.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH ?? '/',
})
