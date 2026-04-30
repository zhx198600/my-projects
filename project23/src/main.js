import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

let deferredPrompt

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  console.log('PWA 可以安装了')
})

window.installPWA = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`用户${outcome === 'accepted' ? '接受' : '拒绝'}安装PWA`)
    deferredPrompt = null
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    console.log('PWA Service Worker 已准备就绪')
  })
}

const app = createApp(App)
app.use(router)
app.mount('#app')
