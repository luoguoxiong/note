/**
 * adapter.js
 * 适配器，用于封装同一功能，在网页/客户端实现不一致的情况
 */

import { Any } from '@/types'
import native from '@/utils/native/index'

/**
 * 打开链接
 */
const openLink = async (url: string) => {
  if (await native.isClientMode) {
    // TODO
  } else {
    // 网页打开新页签
    window.open(url)
  }
}
/**
 * 导出excel数据，在electron版本壳子，做转换
 * form
 * [{
 *  key:'value'
 * }]
 * to
 * [
 *  {
 *      name:'',
 *      data:[[key],[value]]
 *  }
 * ]
 */
const xlsxDataInElectron = (data: Any) => {
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
