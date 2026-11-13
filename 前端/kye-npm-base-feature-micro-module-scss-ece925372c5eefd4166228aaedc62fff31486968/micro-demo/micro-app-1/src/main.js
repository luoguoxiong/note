import './public-path' // 必须第一行:在其它 import 之前设置 publicPath
import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './router'
import { registerSubApp } from '@kye-netc/micro-module/sub-app'
import store, { storeKey } from './store'
import native from '@kye-netc/micro-native'

const bootstrap = async () => {
  console.error('sub1-bootstrap')
}

const mount = (container) => {
  console.error('sub1-mounted')
}

const unmount = () => {
  console.error('sub1-unmount')
}

const rootContainer = document.getElementById('sub-app-1')

const mainApp = registerSubApp(
  {
    name: 'user',
    bootstrap,
    mount,
    unmount,
    routes,
    components: {
      button: () => import('./components/Button.vue'),
    },
  },
  App,
  rootContainer,
)

// 设置当前应用名称，onMessage 据此过滤推送给本应用的消息
native.setAppName(native.getMode() === 'iframe' ? 'iframe' : 'micro-module')

mainApp?.use(store, storeKey)

mainApp.mount(rootContainer)
