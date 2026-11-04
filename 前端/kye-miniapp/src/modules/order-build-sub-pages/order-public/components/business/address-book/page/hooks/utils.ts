import { OrderPageType } from '@order-public-sub-public/constants'
import { ListItem, ListReactiveType } from '../../types'
import { UnwrapNestedRefs } from 'vue'
import { OrderInfo } from '@order-public-sub-public/types'
import { showDialog } from '@order-global-package-order-sub/hooks/useShowToast'
import { BatchOrderInfo } from '@order-public-sub-public/apis/types'
import Taro from '@tarojs/taro'

type AddressKey = 'province' | 'city' | 'county' | 'detailAddress'

/**
 * @description  bug#446628 下拉加载或者changeTab之后处理选中
 */
export const setSelectStatus = (params: {
  orderPageType: OrderPageType
  state: UnwrapNestedRefs<ListReactiveType>
  batchSelectList?: ListItem[]
}) => {
  // const { orderPageType, state, batchSelectList = [] } = params
  // if (orderPageType === OrderPageType.批量寄) {
  //   state.list?.forEach((item) => {
  //     if (batchSelectList?.find((selectItem) => selectItem.onlyMd5UniqueId === item.onlyMd5UniqueId)) {
  //       item.isSelectItem = true
  //     }
  //   })
  // }
}

/**
 * @description bug#447760 切换tab需要定位到顶部
 */
export const scrollTop = (top?: number) => {
  // const scrollDiv = document.querySelector('.list-refresh-load')
  //   Taro.createSelectorQuery()
  //     .select('#ky-list-container-scroll-view')
  //     .node((res) => {
  //       const node = res.node
  //       if (node) {
  //         node.scrollTop = top
  //         node?.scroll({ top: top || 0 })
  //       }
  //     })
  //     .exec()
}

/**
 * @description 批量
 * @param orderInfo
 */
export const checkSameAddress = (sender: OrderInfo['sender'], receive: OrderInfo['receive']) => {
  const detailAddressSame = ['provice', 'city', 'county', 'detailAddress'].every(
    (key: string) => sender[key as AddressKey] === receive[key as AddressKey],
  )

  return detailAddressSame
}

/**
 * @description 批量检查寄收地址一致
 * @param batchOrderInfo
 * @param selectedList
 */
export const checkBatchSameAddress = (sender: OrderInfo['sender'], selectedList: OrderInfo[]) => {
  return selectedList.some((item) => checkSameAddress(sender, item.receive))
}

/**
 * @description 提示寄收一致
 */
export const toastSameAddress = () => {
  showDialog({
    title: '温馨提示',
    message: '寄件地址和收件地址一致无法下单，请重新选择',
    confirmButtonText: '我知道了',
  })
}

export const getCurrentSender = (orderState: BatchOrderInfo | OrderInfo, orderPageType: OrderPageType) => {
  // if (orderPageType === OrderPageType.批量寄) {
  //   return (orderState as BatchOrderInfo).commonWaybillInfo.waybillInfo.sender
  // } else {
  return (orderState as OrderInfo).sender
  // }
}
