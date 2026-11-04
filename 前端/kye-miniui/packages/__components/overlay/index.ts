import Overlay from './src/overlay.vue'
import { App } from 'vue'

Overlay.name = 'ky-overlay'

Overlay.install = (app: App): void => {
  // 注册组件
  app.component(Overlay.name, Overlay)
}

export default Overlay
