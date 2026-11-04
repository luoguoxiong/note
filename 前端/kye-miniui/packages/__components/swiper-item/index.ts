import SwiperItem from './src/swiper-item.vue'
import { App } from 'vue'

SwiperItem.name = 'ky-swiper-item'

SwiperItem.install = (app: App): void => {
  // 注册组件
  app.component(SwiperItem.name, SwiperItem)
}

export default SwiperItem
