import { sleep } from '@/public/utils'
import Taro from '@tarojs/taro'

const defaultImg = 'https://ic-img.ky-express.com/netc/20251225_31060_!!1766665250265_750_1624.png'

export const siginPreloadImg = {
  remoteImg: defaultImg,
  localImg: defaultImg,
  async preloadImage() {
    await sleep(2000)
    Taro.getImageInfo({
      src: defaultImg,
    })
  },
}
