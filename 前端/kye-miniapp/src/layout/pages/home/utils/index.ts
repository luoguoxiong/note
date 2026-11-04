import Taro from '@tarojs/taro'

const ONE_DAY = 24 * 60 * 60 * 1000 // 一天的毫秒数

// 设置缓存（带时间戳）
export const setCache = (key: string, value: any) => {
  const data = {
    value,
    timestamp: Date.now(),
  }
  Taro.setStorageSync(key, data)
}

// 获取缓存，超过一天返回 false
export const getCache = (key: string) => {
  const data = Taro.getStorageSync(key)
  if (!data) return false

  const { timestamp } = data
  if (Date.now() - timestamp > ONE_DAY) {
    // 超过一天，删除缓存并返回 false
    Taro.removeStorageSync(key)
    return false
  }

  return true
}

// 图片预加载函数
export const preloadImage = (img) => {
  Taro.getImageInfo({
    src: img,
    success: () => {
      console.log('图片预加载成功')
      // 预加载完成后将图片加入缓存
      Taro.preloadAssets({
        data: [
          {
            type: 'image',
            src: img,
          },
        ],
        success: () => console.log('图片加入缓存成功'),
        fail: (err) => console.error('图片加入缓存失败:', err),
      })
    },
    fail: (err) => {
      console.error('图片预加载失败:', err)
    },
  })
}
