import ListVirtual from './src/list-virtual-test.vue'
import { App } from 'vue'

ListVirtual.name = 'ky-list-virtual'

ListVirtual.install = (app: App): void => {
  // 注册组件
  app.component(ListVirtual.name, ListVirtual)
}

export default ListVirtual
