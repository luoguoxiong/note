import SwipeGroup from './src/swipe-group.vue'
import { App } from 'vue'

SwipeGroup.name = 'ky-swipe-group'

SwipeGroup.install = (app: App): void => {
  // 注册组件
  app.component(SwipeGroup.name, SwipeGroup)
}

export default SwipeGroup
