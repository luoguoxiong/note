import PopoverMenu from './src/popover-menu.vue'
import { App } from 'vue'

PopoverMenu.name = 'ky-popover-menu'

PopoverMenu.install = (app: App): void => {
  // 注册组件
  app.component(PopoverMenu.name, PopoverMenu)
}

export default PopoverMenu
