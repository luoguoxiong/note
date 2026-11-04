import Navbar from './src/navbar.vue'
import { App } from 'vue'

Navbar.name = 'ky-navbar'

Navbar.install = (app: App): void => {
  // 注册组件
  app.component(Navbar.name, Navbar)
}

export default Navbar
