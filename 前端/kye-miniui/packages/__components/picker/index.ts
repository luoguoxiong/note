import Picker from './src/index.vue'
import { App } from 'vue'

Picker.name = 'ky-picker'

Picker.install = (app: App): void => {
  // 注册组件
  app.component(Picker.name, Picker)
}

export default Picker
