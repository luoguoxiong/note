import Tag from './src/tag.vue'
import { App } from 'vue'

Tag.name = 'ky-tag'

Tag.install = (app: App): void => {
  // 注册组件
  app.component(Tag.name, Tag)
}

export default Tag
