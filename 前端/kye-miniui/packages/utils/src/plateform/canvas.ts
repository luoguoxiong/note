import Taro from '@tarojs/taro'
import { isAmapMiniApp } from '.'

export const getCanvasContext = (canvasId: string): Taro.CanvasContext => {
  return new Promise((resolve) => {
    if (isAmapMiniApp) {
      const context = Taro.createCanvasContext(canvasId)
      resolve(context)
    } else {
      Taro.createSelectorQuery()
        .select(`#${canvasId}`)
        .node()
        .exec((res) => {
          const canvas = res[0].node
          const context = canvas.getContext('2d')
          resolve(context)
        })
    }
  })
}

export const canvasDraw = (context: Taro.CanvasContext) => {
  return new Promise((resolve) => {
    context.draw(false, () => {
      resolve(true)
    })
  })
}
