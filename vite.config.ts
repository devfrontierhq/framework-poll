import { extname } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import babel from 'vite-plugin-babel'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    babel({
      filter: (path) => path.includes('/src/') && /\.[jt]sx?$/.test(path),
      loader: (path) => {
        const extension = extname(path)

        if (extension === '.tsx') {
          return 'tsx'
        }

        if (extension === '.ts') {
          return 'ts'
        }

        if (extension === '.jsx') {
          return 'jsx'
        }

        return 'js'
      },
      babelConfig: {
        babelrc: false,
        configFile: false,
        parserOpts: {
          plugins: ['jsx', 'typescript'],
        },
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@test': fileURLToPath(new URL('./test', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
