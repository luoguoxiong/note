import Switch from './src/switch.vue'
import { App } from 'vue'

Switch.name = 'ky-switch'

Switch.install = (app: App): void => {
  // 注册组件
  app.component(Switch.name, Switch)
}

export default Switch
