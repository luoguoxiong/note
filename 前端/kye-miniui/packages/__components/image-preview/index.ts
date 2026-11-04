import ImagePreview from './src/image-preview.vue'
import { showImagePreview } from './src/showImagePreview'
import { App } from 'vue'

ImagePreview.name = 'ky-image-preview'

ImagePreview.install = (app: App): void => {
  // 注册组件
  app.component(ImagePreview.name, ImagePreview)
}

export { showImagePreview }

export default ImagePreview
