import Loading from './src/loading.vue'
import { App } from 'vue'

Loading.name = 'ky-loading'

Loading.install = (app: App): void => {
  // 注册组件
  app.component(Loading.name, Loading)
}

export default Loading
