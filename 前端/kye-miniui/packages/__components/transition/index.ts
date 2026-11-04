import Transition from './src/transition.vue'
import { App } from 'vue'

Transition.name = 'ky-transition'

Transition.install = (app: App): void => {
  // 注册组件
  app.component(Transition.name, Transition)
}

export default Transition
