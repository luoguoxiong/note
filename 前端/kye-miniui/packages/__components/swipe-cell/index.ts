import SwipeCell from './src/swipe-cell.vue'
import { App } from 'vue'

SwipeCell.name = 'ky-swipe-cell'

SwipeCell.install = (app: App): void => {
  // 注册组件
  app.component(SwipeCell.name, SwipeCell)
}

export default SwipeCell
