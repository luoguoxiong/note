import Checkboxgroup from './src/checkboxgroup.vue'
import { App } from 'vue'

Checkboxgroup.name = 'ky-checkbox-group'

Checkboxgroup.install = (app: App): void => {
  // 注册组件
  app.component(Checkboxgroup.name, Checkboxgroup)
}

export default Checkboxgroup
