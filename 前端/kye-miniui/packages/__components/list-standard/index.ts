import ListStandard from './src/list-standard.vue'
import { App } from 'vue'

ListStandard.name = 'ky-list-standard'

ListStandard.install = (app: App): void => {
  // 注册组件
  app.component(ListStandard.name, ListStandard)
}

export default ListStandard
