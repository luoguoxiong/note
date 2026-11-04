import Taro from '@tarojs/taro'
import { AiAddrAnalysis, resultFlagtype } from '@order-public-sub-public/apis/address/types'
import { aiAddrAnalysis } from '@order-public-sub-public/apis/address'
import { getAddressType, getDetailAddressSceneType } from '@order-public-sub-public/utils/waybillInfo'
import { AddressType, AddressValue, EAM_ORDER_ADDRESS_SCENE_TYPE } from '@order-public-sub-public/constants'
import useCommon from '@order-public-sub-public/hooks/address/useCommon'
import { getValueOrEmpty } from '@order-public-sub-public/utils'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const useSelectAppAddress = ({ moduleStyle }: { moduleStyle: string }) => {
  const { addressSelect } = useCommon()
  const analysisMsg = async (msg: string) => {
    const waybillNumber = piniaStore.order.waybillNumber
    let addressInfo: AiAddrAnalysis = {}
    const address = getAddressType(moduleStyle)
    const { data } = await aiAddrAnalysis({
      addressType: 30,
      text: msg,
      fillTownToDetails: 10,
      businessId: waybillNumber,
      sceneType: EAM_ORDER_ADDRESS_SCENE_TYPE.回单返单识别,
    })
    if (data.resultFlag === resultFlagtype.需要提示) {
      addressInfo = await addressSelect(data.addressInfos, address === AddressType.SENDER ? '寄件' : '收件')
    } else {
      addressInfo = data.addressInfos?.[0] || {}
    }
    const addressInfoNew: AddressValue = {
      province: getValueOrEmpty(addressInfo.province),
      city: getValueOrEmpty(addressInfo.city),
      county: getValueOrEmpty(addressInfo.county) || getValueOrEmpty(addressInfo.district),
      detailAddress: `${getValueOrEmpty(addressInfo.address)}`,
    }
    return addressInfoNew
  }
  const getAppAddress = async () => {
    try {
      const res = await Taro.chooseAddress()
      const { userName, provinceName, cityName, countyName, detailInfo, telNumber } = res
      const msg = `${provinceName}${cityName}${countyName}${detailInfo}`
      const detailAddress = await analysisMsg(msg)
      return {
        ...detailAddress,
        person: getValueOrEmpty(userName),
        mobile: getValueOrEmpty(telNumber),
      }
    } catch (e) {
      return
    }
  }
  return {
    getAppAddress,
  }
}
