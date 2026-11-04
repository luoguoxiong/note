import Circle from './src/circle.vue'
import { App } from 'vue'

Circle.name = 'ky-circle'

Circle.install = (app: App): void => {
  // 注册组件
  app.component(Circle.name, Circle)
}

export default Circle
