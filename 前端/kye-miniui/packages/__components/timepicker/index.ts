import Timepicker from './src/timepicker.vue'
import { App } from 'vue'

Timepicker.name = 'ky-timepicker'

Timepicker.install = (app: App): void => {
  // 注册组件
  app.component(Timepicker.name, Timepicker)
}

export default Timepicker
