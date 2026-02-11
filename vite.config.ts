import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project Apex - Complete Health Platform
export default defineConfig({
    plugins: [react()],
    base: '/',
    server: {
        port: 4200,
        open: true,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            },
            '/ws': {
                target: 'ws://localhost:3000',
                ws: true,
                changeOrigin: true,
            },
        },
    },
    build: {
        target: 'esnext',
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    'framer-motion': ['framer-motion'],
                    charts: ['recharts'],
                    icons: ['lucide-react'],
                },
            },
        },
        sourcemap: false,
        cssCodeSplit: true,
    },
})
