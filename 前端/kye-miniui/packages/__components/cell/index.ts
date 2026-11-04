import Cell from './src/cell.vue'
import { App } from 'vue'

Cell.name = 'ky-cell'

Cell.install = (app: App): void => {
  // 注册组件
  app.component(Cell.name, Cell)
}

export default Cell
