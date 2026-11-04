import Taro from '@tarojs/taro'
// 存储数据
export const setStorageWithExpiration = (key: string, value: any, expireInMinutes: number) => {
  const expirationTime = Date.now() + expireInMinutes * 60 * 1000 // 计算过期时间戳
  const data = {
    value,
    expirationTime,
  }
  Taro.setStorage({
    key,
    data,
  })
}

// 获取数据
export const getStorageWithExpiration = (key: string) => {
  try {
    const res = Taro.getStorageSync(key)
    const { value, expirationTime } = res
    console.log('Date.now() ', Date.now())
    if (Date.now() > expirationTime) {
      // 数据已经过期
      Taro.removeStorage({ key })
      return null
    }

    return value // 返回存储的数据
  } catch (error) {
    return null // 如果没有找到数据，返回null
  }
}
