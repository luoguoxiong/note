import { OrderPageType } from '@order-public-sub-public/constants'

export const useMoveStore = () => {
  // 更新orderPageType
  piniaStore.root.setOrderPageType(OrderPageType.批量寄单票)
}
