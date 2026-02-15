import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    // Compressão Gzip para assets
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    // Compressão Brotli para melhor compressão
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
  ],
  
  build: {
    // Code splitting otimizado
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "react-vendor";
            }
            if (id.includes("lucide-react")) {
              return "ui-vendor";
            }
          }
        },
        // Otimizar nomes de arquivos para melhor cache
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Otimizações de build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2, // Múltiplos passes para melhor minificação
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Source maps apenas para debug
    sourcemap: false,
    // Target para browsers modernos
    target: 'es2020',
    // CSS code splitting
    cssCodeSplit: true,
  },
  
  // Otimizações de performance
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
    // Exclude para evitar pré-bundling de coisas grandes
    exclude: [],
  },
  
  server: {
    // Configurações do servidor de dev
    hmr: {
      overlay: true,
    },
  },
});
