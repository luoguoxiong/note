export * from './device'
export * from './address'

// 判空
export const isEmptyText = (val: unknown) => {
  return val === '' || val === null || val === undefined
}

/**
 * 金额格式化纯函数（本地副本，从 kye-miniapp-order estimated-cost/utils.ts 迁移）
 */
export const handleMoneyAmountShow = (v: any) => Number(v || 0)?.toFixed(2)

/**
 * 特殊文本处理纯函数（本地副本，从 kye-miniapp-order estimated-cost/utils.ts 迁移）
 */
export const specialText = (text: any, list = ['免单', '暂无报价']) => {
  if (typeof text === 'string') {
    return list.includes(text)
  }
  return false
}
