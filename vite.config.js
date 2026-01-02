import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
    plugins: [react()],
    ssr: {
        noExternal: ['react-router-dom', 'react-helmet-async', 'lucide-react'],
    },
    ssgOptions: {
        script: 'async',
        formatting: 'minify',
    },
    build: {
        rollupOptions: {
            output: isSsrBuild ? undefined : {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
                    ui: ['framer-motion', 'lucide-react', 'react-icons', 'clsx', 'tailwind-merge'],
                    charts: ['recharts'],
                },
            },
        },
    },
}))
