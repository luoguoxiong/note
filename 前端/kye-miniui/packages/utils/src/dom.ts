import Taro from '@tarojs/taro'

export const getCanvasNodeById = async (id: string): Promise<HTMLCanvasElement | null> => {
  return new Promise((resolve) => {
    const env = Taro.getEnv()
    if (env === 'WEB') {
      const canvas = document.querySelector(`#${id} > canvas`) as HTMLCanvasElement
      return resolve(canvas)
    } else {
      const query = Taro.createSelectorQuery()
      query
        .select(`#${id}`)
        .node((res: any) => {
          resolve(res?.node)
        })
        .exec()
    }
  })
}

export interface RectIn {
  width: number
  height: number
  top: number
  left: number
  right: number
  bottom: number
}

// 相对于父级的位置
export const boundingClientRect = (id: string): Promise<RectIn> => {
  return new Promise((resolve) => {
    Taro.createSelectorQuery()
      .select(`#${id}`)
      .boundingClientRect()
      .exec((rect: any) => {
        if (rect) {
          resolve(Array.isArray(rect) ? rect[0] : rect)
        }
      })
  })
}
