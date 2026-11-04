import Textarea from './src/textarea.vue'
import { App } from 'vue'

Textarea.name = 'ky-textarea'

Textarea.install = (app: App): void => {
  // 注册组件
  app.component(Textarea.name, Textarea)
}

export default Textarea
