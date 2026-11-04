import CellGroup from './src/cell-group.vue'
import { App } from 'vue'

CellGroup.name = 'ky-cell-group'

CellGroup.install = (app: App): void => {
  // 注册组件
  app.component(CellGroup.name, CellGroup)
}

export default CellGroup
