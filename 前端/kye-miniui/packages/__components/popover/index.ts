import Popover from './src/popover.vue'
import { App } from 'vue'

Popover.name = 'ky-popover'

Popover.install = (app: App): void => {
  // 注册组件
  app.component(Popover.name, Popover)
}

export default Popover
