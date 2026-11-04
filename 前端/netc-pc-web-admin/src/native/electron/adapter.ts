/**
 * Electron 壳适配器
 * 用于封装同一功能在网页/客户端实现不一致的情况
 */
import type { Any } from '@/types'
import { isClientMode, nativeBrowserOpenUrl } from './index'

/**
 * 打开链接
 * @param url 链接地址
 */
export const openLink = async (url: string) => {
  if (isClientMode()) {
    // 客户端模式下打开链接
    return nativeBrowserOpenUrl(url)
  } else {
    // 网页打开新页签
    window.open(url, '_blank')
  }
}

/**
 * 导出 excel 数据，在 electron 版本壳子中做格式转换
 * 转换前: [{ key: 'value' }]
 * 转换后: [{ name: '', data: [[key], [value]] }]
 * @param data 原始数据
 * @returns 转换后的数据
 */
export const xlsxDataInElectron = (data: Any) => {
  if (!data) {
    throw new Error('导出数据不能为空')
  }

  data = typeof data === 'object' ? data : JSON.parse(data)
  const row = Object.keys(data[0])
  const valueList: Any[] = []

  data.forEach((item: Any) => {
    valueList.push(Object.values(item))
  })

  data = JSON.stringify([
    {
      name: '',
      data: [row, ...valueList],
    },
  ])

  return data
}

export default {
  openLink,
  xlsxDataInElectron,
}
