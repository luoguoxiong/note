import Text from './src/text.vue'
import { App } from 'vue'

Text.name = 'ky-text'

Text.install = (app: App): void => {
  // 注册组件
  app.component(Text.name, Text)
}

export default Text
