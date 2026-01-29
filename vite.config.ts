import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project Apex - Complete Health Platform
// Using port 4200 to avoid conflicts with other projects
export default defineConfig({
    plugins: [react()],
    base: './',
    server: {
        port: 4200,
        open: true,
        strictPort: true  // Will error if port is taken instead of silently using another
    }
})


