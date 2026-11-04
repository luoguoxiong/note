import { isEmptyText, isNumericString } from '@order-public-sub-public/utils'
import { sessionStorage, localStorage } from '@order-public-sub-public/utils/storage'

export const isLowerAmountSize = (feeTotal: number | string) => {
  if (typeof feeTotal === 'string') feeTotal = Number(feeTotal)
  const len = (Math.floor(feeTotal) + '').length
  return len >= 6
}

export const iconMap = {
  warnIcon: 'https://ic-img.ky-express.com/netc/20250619_14821_!!1750314362795_40_40.png',
  arrowUpIcon: 'https://ic-img.ky-express.com/netc/20250619_45368_!!1750301878466_80_80.png',
  arrowDownIcon: 'https://ic-img.ky-express.com/netc/20250619_34770_!!1750301768942_80_80.png',
  arrowRightIcon: 'https://ic-img.ky-express.com/netc/20250619_39283_!!1750301830797_49_49.png',
}

export const handleMoneyAmountShow = (v: any) => Number(v || 0)?.toFixed(2)
// export const handleMoneyAmountText = (v: number | undefined | null) =>
//   !isEmptyText(v) ? `${Number(v).toFixed(2)}` : ''
export const handleMoneyAmountText = (v: any) => {
  if (typeof v === 'number' || (typeof v === 'string' && isNumericString(v))) {
    return Number(v || 0)?.toFixed(2)
  }
  return v
}

export const setStorge = (key: string, value: any) => {
  console.log('validateField-Storge', value)
  if (!isEmptyText(value)) {
    localStorage?.setItem(key, JSON.stringify(value))
  }
}
export const getStorge = (key: string) => {
  console.log('-validateField-Storge2', key)
  try {
    const localData = localStorage?.getItem(key)
    const parseLocalData = localData && JSON.parse(localData)
    return parseLocalData
  } catch (error) {
    console.log('validateFieldStorge error', error)
  }
}

// 需要展示特殊文案：例如 免单
export const specialText = (text: any, list = ['免单', '暂无报价']) => {
  if (typeof text === 'string') {
    return list.includes(text)
  }
  return false
}
