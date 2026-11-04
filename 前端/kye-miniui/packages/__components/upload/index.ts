import Upload from './src/uploader.vue'
import { App } from 'vue'

Upload.name = 'ky-upload'

Upload.install = (app: App): void => {
  // 注册组件
  app.component(Upload.name, Upload)
}

export default Upload
