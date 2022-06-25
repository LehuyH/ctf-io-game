import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import voie from 'vite-plugin-voie';
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),voie()],
  resolve: {
    alias: {
      '~': path.resolve('./src'),
    },
  },
  server:{
    hmr:{
      port:443
    }
  }
})
