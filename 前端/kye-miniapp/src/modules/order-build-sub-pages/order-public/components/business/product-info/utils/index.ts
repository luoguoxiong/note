import { computed } from 'vue'

import { GoodsSize, GoodsSupplement, GoodsSupplementEnum, ProductInfo } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { preWaybillGoodsSizeList } from '../hooks/state'
import { isEqualWith, cloneDeep } from 'lodash-es'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const getVolumeSize = (sizeList: GoodsSize[]) => {
  let volumeSize = 0
  if (Array.isArray(sizeList)) {
    volumeSize = sizeList.reduce((pre, cur) => {
      pre += (+cur.length * +cur.width * +cur.height * (+cur.count || 1)) / 100 / 100 / 100
      if (Number(pre.toFixed(3)) <= 0) {
        return (pre = 0)
      }
      if (Number(pre) >= 10000) {
        return 9999.999
      }
      return Number(pre.toFixed(3))
    }, 0)
  }

  return volumeSize || 0
}

/**
 * 裸货旧货外显文案组装
 * @param goodsSupplement
 * @returns
 */
const buildoodsSupplementShowLabel = (goodsSupplement?: GoodsSupplement) => {
  if (!goodsSupplement) return ''

  const { oldGoods, nudedGoods } = goodsSupplement
  let showLabel = ''

  if (nudedGoods === GoodsSupplementEnum.选中) {
    showLabel += '裸货'
  }

  if (oldGoods === GoodsSupplementEnum.选中) {
    showLabel += '旧货'
  }

  return showLabel
}

export const cellValue = computed(() => {
  const moduleFormData = piniaStore.order.moduleFormData(ModuleType['货物信息'])
  const resultCellValue: string[] = []
  if (moduleFormData) {
    moduleFormData.goodsType && resultCellValue.push(moduleFormData.goodsType)

    // 裸货旧货
    const goodsSupplementStr = buildoodsSupplementShowLabel(moduleFormData.goodsSupplement)
    goodsSupplementStr && resultCellValue.push(goodsSupplementStr)

    moduleFormData.count && resultCellValue.push(`${moduleFormData.count}件`)
    moduleFormData.actualWeight && resultCellValue.push(`${moduleFormData.actualWeight}kg`)
    formatter(moduleFormData.volumeSize) && resultCellValue.push(`${formatter(moduleFormData.volumeSize)}m³`)
  }
  return resultCellValue.join('/')
})

export const getTotalCount = computed(() => {
  const totalCount = preWaybillGoodsSizeList.value.reduce((pre, cur) => {
    pre += cur.length && cur.width && cur.height && cur.count ? Number(cur.count) : 0
    return pre
  }, 0)
  return totalCount
})
export const getListCount = computed(() => {
  const totalCount = preWaybillGoodsSizeList.value.reduce((pre, cur) => {
    pre += cur.count ? Number(cur.count) : 0
    return pre
  }, 0)
  return totalCount
})

// 判断尺寸新增删除时是否修改过
export const isGoodsSizeEqual = (value: GoodsSize[]) => {
  let result = cloneDeep(value)?.filter((item) => item.width && item.height && item.length && item.count) || []
  result = result.map((item) => ({
    ...item,
    width: Number(item.width),
    height: Number(item.height),
    length: Number(item.length),
    count: Number(item.count),
    singleWeight: Number(item.singleWeight) || 0,
  }))
  const moduleFormData = piniaStore.order.moduleFormData(ModuleType['货物信息'])?.preWaybillGoodsSizeList || []
  return isEqualWith(result, cloneDeep(moduleFormData))
}

export const conditionsGoodsSize = () => {
  let result = false
  const goodsSizeFilter =
    preWaybillGoodsSizeList.value?.filter((item) => item.width && item.height && item.length && item.count) || []
  if (goodsSizeFilter && goodsSizeFilter.length > 0) {
    result = true
  }
  return result
}

const formatter = (value: string | number | undefined) => {
  if (!value) {
    return 0
  }

  value = value.toString().replace(/^[。.]/, '')
  value = value.toString().replace(/[^\d.]/g, '')

  const parts = value.split('.')
  if (parts[0].length > 4) {
    parts[0] = parts[0].substring(0, 4)
  }

  if (parts[1] && parts[1].length > 3) {
    parts[1] = parts[1].substring(0, 3)
  }

  value = parts.join('.')

  return Number(value) || 0
}
