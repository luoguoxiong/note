import { createVNode, render } from 'vue'
import Taro from '@tarojs/taro'
import KyImagePreview from './image-preview.vue'

import type { ImagePreviewProps } from './types.vue'
import { isWxPcAppletEnvValue } from '@packages/utils'
// show: boolean
//   images: ImageInterface[]
//   autoplay: string | number
//   isLoop: boolean
//   showIndex: boolean
//   closeable: boolean
//   contentClose: boolean
//   activeIndex: number

interface IShowImagePreview extends Partial<ImagePreviewProps> {
  parentClassName: string
}
/* pc端微信 - 图片查看器 */
const showImagePreviewPc = (options: IShowImagePreview) => {
  const { images, activeIndex } = options || {}
  const urls = images.map((v) => v.src)
  const indexObj = images[activeIndex || 0]
  Taro.previewImage({
    urls,
    current: indexObj.src,
    showmenu: true,
  })
}

export const showImagePreview = (options: IShowImagePreview) => {
  return new Promise<void>((resolve) => {
    if (isWxPcAppletEnvValue) {
      showImagePreviewPc(options)
      return
    }
    const { parentClassName = '' } = options

    const mountNode = document.getElementsByClassName(parentClassName)

    const container = (mountNode.length ? mountNode?.[mountNode.length - 1] : mountNode?.[0]) || document.body

    const unmount = () => {
      render(null, container)
      // container.remove()
    }

    const vnode = createVNode(KyImagePreview, {
      ...options,
      show: true,
      onClose: () => {
        options?.onClose?.()
        unmount()
        resolve()
      },
    })

    render(vnode, container)
  })
}
