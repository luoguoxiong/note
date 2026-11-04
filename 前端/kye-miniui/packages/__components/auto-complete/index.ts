import AutoComplete from './src/auto-complete.vue'
import { App } from 'vue'

AutoComplete.name = 'ky-auto-complete'

AutoComplete.install = (app: App): void => {
  // 注册组件
  app.component(AutoComplete.name, AutoComplete)
}

export default AutoComplete
