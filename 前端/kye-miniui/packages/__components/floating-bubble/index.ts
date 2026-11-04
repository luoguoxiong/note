import FloatingBubble from './src/floating-bubble.vue'
import { App } from 'vue'

FloatingBubble.name = 'ky-floating-bubble'

FloatingBubble.install = (app: App): void => {
  // 注册组件
  app.component(FloatingBubble.name, FloatingBubble)
}

export default FloatingBubble
