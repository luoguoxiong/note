import CropperImage from './src/index.vue'
import { App } from 'vue'

CropperImage.name = 'ky-cropper-image'

CropperImage.install = (app: App): void => {
  // 注册组件
  app.component(CropperImage.name, CropperImage)
}

export default CropperImage
