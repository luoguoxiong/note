import { useValidate } from '@freight-time/validate/useValidate'
import { useFreightTimeStore } from '@freight-time/store'
import { showToast } from '@order-global-package-freight-time/hooks/useShowToast'

const { updateValidateKey, removeValidateKey } = useValidate()

export const openValidateKey = (content: string) => {
  updateValidateKey({
    key: 'productInfo.actualWeight',
    content,
    bubbleConfig: {
      offset: [0, 8],
      placement: 'top-end',
      theme: 'dark',
    },
    showType: 1,
    passed: false,
  })
}

export const closeValidateKey = () => {
  removeValidateKey('productInfo.actualWeight')
}

// 计算单件重量*件数之和
export const getSingleWeightSum = (): number => {
  const store = useFreightTimeStore()
  const list = store.productInfo.preWaybillGoodsSizeList
  // 单件重量最多 2 位小数,件数为整数,转成整数运算再还原,避免浮点数累加误差
  return list.reduce((sum, item) => {
    const single = +item.singleWeight || 0
    const count = +item.count || 1
    const itemWeight = Number((Math.round(single * 100) * count) / 100)
    return Number((Math.round(sum * 100) + Math.round(itemWeight * 100)) / 100)
  }, 0)
}

// 展示用单件重量*件数之和:大于60000取60000,否则取原值
export const getDisplayWeightSum = (): number => {
  const weightSum = getSingleWeightSum()
  return weightSum > 60000 ? 60000 : weightSum
}

export const useActualWeightValidate = (): boolean => {
  const store = useFreightTimeStore()
  const actualWeight = store.getActualWeight || 0
  const weightSum = getSingleWeightSum()

  // 校验1：单件重量*件数之和不能大于60000
  if (weightSum > 60000) {
    showToast(`单件重量*件数之和不能超过60000kg`)
    return false
  }

  // 校验2：总重量不能小于单件重量*件数之和
  if (actualWeight < weightSum) {
    const displaySum = getDisplayWeightSum()
    openValidateKey(`总重量不能小于单件重量*件数之和${displaySum.toFixed(2)}kg`)
    return false
  }

  return true
}
