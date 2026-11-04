import { printSource, popVisible } from './state'

export enum PrintSourceEnum {
  // 移动端-快速下单-单票成功 70
  // 移动端-预约取货-单票成功 80
  // 移动端-已取消-单票成功 90

  // 移动端-批量下单-批量成功 100
  // 移动端--待通知取货-批量成功 110
  // 移动端-已取消-批量成功 120

  // 移动端-查件列表 130

  // 移动端-运单详情 150

  // 移动端-运单路由 170

  // 移动端-批量打印 180
  'order' = '70',
  'order-pickup' = '80',
  'order-cancel' = '90',

  'batch' = '100',
  'batch-pickup' = '110',
  'batch-cancel' = '120',

  'waybill-search' = '130',
  'waybill-detail' = '150',
  'waybill-route' = '170',
  'batch-print' = '180',
}

export const usePrintSource = () => {
  const setPrintSource = (value: keyof typeof PrintSourceEnum) => {
    try {
      if (PrintSourceEnum[value]) {
        printSource.value = PrintSourceEnum[value]
        console.log(printSource.value)
      } else {
        printSource.value = ''
      }
    } catch (error) {
      printSource.value = ''
      console.log(error)
    }
  }

  return {
    printSource,
    setPrintSource,
  }
}

export const usePopVisible = () => {
  const setPopVisible = (value: boolean) => {
    popVisible.value = value
  }

  return { popVisible, setPopVisible }
}
