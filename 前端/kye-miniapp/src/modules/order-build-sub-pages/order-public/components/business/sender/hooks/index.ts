import { computed } from 'vue'

import { useSwitchVisible } from './useState'

import { switchAddress } from '@order-public-sub-public/hooks/address/useCommon'
import { OrderPageType } from '@order-public-sub-public/constants'

import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const hotZoneStore = computed(() => piniaStore.extend.hotZoneStore)

export function setSwitchVisibleData() {
  const { setSwitchVisible } = useSwitchVisible()
  const data = piniaStore.globalData.dynamicConfig('switchSendRecvInfoShowVo')
  const orderPageType = piniaStore.root.getOrderPageType

  console.log(data, 'setSwitchVisibleData')

  const returnEditDisableInfo = piniaStore.globalData.returnEditDisableInfo('senderExtraInfo', 'address') || {}

  // 修改运单场景，已签到或者调度前签到前修改2次，寄件信息禁用，隐藏切换地址
  const hasDisabledKey = returnEditDisableInfo?.key

  const notBatchOrderPageType = orderPageType !== OrderPageType.批量寄 && orderPageType !== OrderPageType.批量寄单票

  if (data?.visible && !hasDisabledKey && notBatchOrderPageType) {
    setSwitchVisible(true)
  } else {
    setSwitchVisible(false)
  }
}

export function onSwitchAddress() {
  // 寄件校验结果
  let messageType = ''
  if (!hotZoneStore.value.Receive || !hotZoneStore.value.Sender) {
    !hotZoneStore.value.Sender && (messageType = '寄件')
    !hotZoneStore.value.Receive && (messageType = '收件')
    showToast(`当前${messageType}地址信息不完整，无法切换`)
    return
  }
  switchAddress()
  // 销毁遮罩
  const unmount = piniaStore.globalData.getMaskInstance
  if (unmount) {
    unmount()
  }
}
