import FloatPagination from './src/float-pagination.vue'
import { App } from 'vue'

FloatPagination.name = 'ky-float-pagination'

FloatPagination.install = (app: App): void => {
  // 注册组件
  app.component(FloatPagination.name, FloatPagination)
}

export default FloatPagination
