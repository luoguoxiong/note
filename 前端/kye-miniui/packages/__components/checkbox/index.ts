import Checkbox from './src/checkbox.vue'
import { App } from 'vue'

Checkbox.name = 'ky-checkbox'

Checkbox.install = (app: App): void => {
  // 注册组件
  app.component(Checkbox.name, Checkbox)
}

export default Checkbox
