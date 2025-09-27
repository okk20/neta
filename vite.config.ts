import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Allow either VITE_PROXY_TARGET or VITE_API_URL; if API_URL points to .../api, strip the /api for proxy base
  const proxyFromApiUrl = env.VITE_API_URL ? env.VITE_API_URL.replace(/\/?api\/?$/, '') : undefined
  const proxyTarget = env.VITE_PROXY_TARGET || proxyFromApiUrl

  return {
    plugins: [
      react(),
      {
        name: 'figma-asset-placeholder',
        resolveId(id) {
          if (id.startsWith('figma:asset/')) {
            return '\0' + id
          }
        },
        load(id) {
          if (id.startsWith('\0figma:asset/')) {
            const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgQY1JHcAAAAASUVORK5CYII='
            return `export default "${dataUrl}"`
          }
        },
      },
    ],
    resolve: {
      alias: [
        // Strip version suffix from imports like "@radix-ui/react-dialog@1.1.6"
        { find: /^(\@radix-ui\/react-[^@]+)@[^/]+$/, replacement: '$1' },
        // Strip version suffix from imports like "@radix-ui/react-slot@1.1.2"
        { find: /^(\@radix-ui\/react-slot)@[^/]+$/, replacement: '$1' },
        { find: /^(\@radix-ui\/react-label)@[^/]+$/, replacement: '$1' },
        // Strip version suffix from imports like "lucide-react@0.487.0"
        { find: /^(lucide-react)@[^/]+$/, replacement: '$1' },
        // Strip version suffix from imports like "react-hook-form@7.55.0"
        { find: /^(react-hook-form)@[^/]+$/, replacement: '$1' },
        // Generic: strip version suffix from ANY unscoped package e.g. "class-variance-authority@0.7.1"
        { find: /^([a-z0-9-]+)@[^/]+$/i, replacement: '$1' },
        // Generic: strip version suffix from ANY scoped package e.g. "@scope/name@1.2.3"
        { find: /^(\@[^/]+\/[^@/]+)@[^/]+$/, replacement: '$1' },
      ],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Split large libraries into separate chunks
            'react-core': ['react', 'react-dom'],
            'react-hook-form': ['react-hook-form'],
            'radix-ui-components': ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-aspect-ratio', '@radix-ui/react-avatar', '@radix-ui/react-checkbox', '@radix-ui/react-collapsible', '@radix-ui/react-context-menu', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-hover-card', '@radix-ui/react-label', '@radix-ui/react-menubar', '@radix-ui/react-navigation-menu', '@radix-ui/react-popover', '@radix-ui/react-progress', '@radix-ui/react-radio-group', '@radix-ui/react-scroll-area', '@radix-ui/react-separator', '@radix-ui/react-slider', '@radix-ui/react-slot', '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-toggle', '@radix-ui/react-toggle-group', '@radix-ui/react-tooltip', '@radix-ui/react-select'],
            'lucide-icons': ['lucide-react'],
            'charts': ['recharts'],
            'date-picker': ['react-day-picker'],
            'embla-carousel': ['embla-carousel-react'],
          },
        },
      },
      chunkSizeWarningLimit: 1000, // Increase the limit since we're optimizing with manual chunks
    },
    server: proxyTarget
      ? {
          proxy: {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
            },
          },
        }
      : undefined,
  }
})
