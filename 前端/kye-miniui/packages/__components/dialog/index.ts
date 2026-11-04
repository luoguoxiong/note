import Dialog from './src/dialog.vue'
import { showDialog } from './src/showDialog'
import { App } from 'vue'

Dialog.name = 'ky-dialog'

Dialog.install = (app: App): void => {
  // 注册组件
  app.component(Dialog.name, Dialog)
}

export { showDialog }

export default Dialog
