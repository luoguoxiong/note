import Field from './src/field.vue'
import { App } from 'vue'

Field.name = 'ky-field'

Field.install = (app: App): void => {
  // 注册组件
  app.component(Field.name, Field)
}

export default Field
