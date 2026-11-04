import Form from './src/form.vue'
import { App } from 'vue'

Form.name = 'ky-form'

Form.install = (app: App): void => {
  // 注册组件
  app.component(Form.name, Form)
}

export default Form
