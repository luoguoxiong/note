import Popover2 from './src/popover.vue'
import { App } from 'vue'

Popover2.name = 'ky-popover2'

Popover2.install = (app: App): void => {
  // 注册组件
  app.component(Popover2.name, Popover2)
}

export default Popover2
