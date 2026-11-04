import { computed } from 'vue'
import { AddedServiceConfig } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'

import { CustomerFile } from '@order-public-sub-public/components/business/added-service/types'
import dayjs from 'dayjs'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

/**
 * 获取文件后缀
 * @returns {*}
 */
export const getFileSuffix = (fileName = '') => {
  return fileName?.split('.')?.pop()?.toLowerCase() as string
}

/**
 * 检测文件大小
 * @param { file | file[] } files 文件对象
 * @param { number } maxSize 大小
 * @returns { Boolean } 如果文件大小超出 maxSize 则返回 true 否则为 false
 */
export const isOversize = (files: CustomerFile, maxSize: number) => {
  return toArray(files).some((file) => {
    if (file) {
      return file.fileSize > maxSize
    }
    return false
  })
}

/**
 * 转换为数组
 * @param { any | any[] } item 文件对象
 * @returns { any[] } 返回一个数组
 */
export const toArray = (item: any) => {
  return Array.isArray(item) ? item : [item]
}

/**
 * 转换单位
 * @returns {*}
 */
export const toUnitSize = (fileSize = 0) => {
  if (fileSize <= 100) {
    return `${(fileSize / 1).toFixed(2)}K`
  }
  return `${(fileSize / 1024).toFixed(2)}M`
}

/**
 * 读取文件
 * @param { file } file 文件对象
 * @param { string } dataurl 文件的 base64
 * @param { string } filename 文件名称
 * @returns { file } 返回一个 File 对象
 */
export const dataURLtoFile = (dataurl: string, filename: string) => {
  // 获取到base64编码
  const arr = dataurl.split(',')
  // 将base64编码转为字符串
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n) // 创建初始化为0的，包含length个元素的无符号整型数组
  // eslint-disable-next-line no-plusplus
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, {
    type: 'image/jpeg',
  })
}

/**
 * 格式化日期
 */
export const formateDate = (date: number, formateDate: string) => {
  return dayjs(date).format(formateDate || 'YYYY-MM-DD HH:mm')
}

export const filterChinese = (value = '', unit = '元') => {
  if (Number(value) < 10000) {
    return value
  } else {
    const prefixNumber = parseInt((Number(value) / 10000).toString())
    const suffixNumber = parseFloat(value.toString().substring(prefixNumber.toString().length))
    const suffixString = suffixNumber.toString()
    const hasZero = suffixString.length === 1 ? '零' : ''
    return prefixNumber + '万' + (suffixNumber > 0 ? `${hasZero}${suffixNumber}` : '') + unit
  }
}

export const isShowTitle = computed(() => {
  const fieldsConfig = piniaStore.schema.moduleConfigData(ModuleType['增值服务'])?.fieldsConfig || []
  const config = fieldsConfig.filter((item) => item.visible)
  return config.length > 0
})

export const showTitleLength = computed(() => {
  const fieldsConfig = piniaStore.schema.moduleConfigData(ModuleType['增值服务'])?.fieldsConfig || []
  const config = fieldsConfig.filter((item) => item.visible)
  return config.length
})
