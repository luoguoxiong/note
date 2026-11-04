import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'

export function useImageLoader(url: string, placeholder: string) {
  const currentSrc = ref(placeholder)
  const loaded = ref(false)

  const loadImage = () => {
    Taro.getImageInfo({
      src: url,
      success: () => {
        currentSrc.value = url
        loaded.value = true
      },
      fail: () => {
        console.warn('图片加载失败：', url)
      },
    })
  }

  onMounted(() => {
    loadImage()
  })

  return {
    currentSrc,
    loaded,
  }
}
