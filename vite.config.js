import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // LAN の別端末からアクセスできるように IP で公開
  server: {
    host: true, // 0.0.0.0 で待ち受け。ブラウザ表示用にローカルIPが出ます
    port: 5173, // 任意: 固定したい場合。空けたい場合は削除可
  },
  preview: {
    host: true,
    port: 4173, // Vite のデフォルト。dev と同時起動しないなら 5173 でも可
  }
})
