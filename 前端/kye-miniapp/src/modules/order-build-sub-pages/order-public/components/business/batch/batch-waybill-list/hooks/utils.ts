import { WaybillInfoList } from '@order-public-sub-public/apis/types'
import { CheckShowType, LimitBlockType, MatchType } from '@order-public-sub-public/constants'

import { isEmptyText } from '@order-public-sub-public/utils'
import { pickerLimit } from '@order-public-sub-public/validate/limit'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

/**
 * @description 检查寄件信息是否有管控
 */
export const checkSenderAddressRestrict = () => {
  const commonAddressRestrict = piniaStore.globalData.restrictData?.addressRestrict
  // 特殊处理寄件取派限制
  if (
    commonAddressRestrict &&
    commonAddressRestrict.restrictedType === LimitBlockType.限制 &&
    commonAddressRestrict.matchType === MatchType.寄件
  ) {
    pickerLimit(commonAddressRestrict)
    return true
  }
  return false
}

/**
 * @description 检查收件信息是否完整
 */
export const showReceiveMask = (item: WaybillInfoList) => {
  // 后端checkResultList 返回的有地址校验
  const checklist = item.checkResultList.find(
    (result) => result.key === 'receive' && result.showType === CheckShowType.BUBBLE,
  )
  const receive = item.waybillInfo.receive
  const checkField = ['city', 'county', 'province', 'person']
  // 收件人信息是否为空，姓名、省市区、|| 固话手机同时为空
  const receiveCheck =
    checkField.some((x) => isEmptyText(Reflect.get(receive, x))) || !(receive?.mobile || receive?.telephone)
  return checklist || receiveCheck
}
