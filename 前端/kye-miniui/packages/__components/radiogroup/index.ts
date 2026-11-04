import Radiogroup from './src/radiogroup.vue'
import { App } from 'vue'

Radiogroup.name = 'ky-radio-group'

Radiogroup.install = (app: App): void => {
  // 注册组件
  app.component(Radiogroup.name, Radiogroup)
}

export default Radiogroup
