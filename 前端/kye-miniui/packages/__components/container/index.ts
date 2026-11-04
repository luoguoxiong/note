import Container from './src/container.vue'
import { App } from 'vue'

Container.name = 'ky-container'

Container.install = (app: App): void => {
  // 注册组件
  app.component(Container.name, Container)
}

export default Container
