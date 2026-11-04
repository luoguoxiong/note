import { confirmClickAd, getAdDetails } from '@order-public-sub-public/apis/waybill/orderSuccess'
import { AdResponse, AdType, Banner, ConfirmAdParams, Popup } from '@order-public-sub-public/apis/waybill/types'
import { advertisementJump, getReportSorce } from '@/public/components/business/advertise-center/utils'
import { TrueOrFalseNumber } from '@order-public-sub-public/constants'
import { $native as native } from '@order-public-sub-public/utils'
import { isAliPayClient } from '@order-public-sub-public/utils/device'
import { sleep } from '@order-public-sub-public/utils/sleep'
import dayjs from 'dayjs'
import { ref } from 'vue'
import { isH5FSEnv } from '@/public/utils'
import { getEnvConfig } from '@/public/config'
import { reportEvent } from '@public/apis/home'

export const loading = ref(false)

const getDetailsList = (data: AdResponse[], areaStyleCode: 'PC_BANNER_003' | 'MP_POPUP_001' | 'MP_BANNER_038') => {
  let list: (Banner | Popup)[] = []

  const areaMap = {
    PC_BANNER_003: 'advertisementBannerDto',
    MP_BANNER_038: 'advertisementBannerDto',
    MP_POPUP_001: 'advertisementPopupDto',
  }

  const adObj = data.find((i) => i.areaStyleCode === areaStyleCode)
  if (adObj?.detailsList) {
    list = adObj?.detailsList.map((detail) => {
      const _detail = Reflect.get(detail, areaMap[areaStyleCode]) || {}
      return {
        ..._detail,
        advertisementCode: detail.advertisementCode,
        advertisementTitle: detail.advertisementTitle,
      }
    })
  }
  return list
}

const getChannelCode = () => {
  const { systemType, isApp } = getEnvConfig()
  if (isApp) {
    return systemType === 'iOS' ? 'iOS' : 'android'
  } else {
    return 'miniprogram'
  }
}

/**
 * @description 获取广告数据
 */
export const getAdvertisement = async () => {
  let adList: Banner[] = [],
    popupList: Popup[] = []

  if (isAliPayClient) {
    return { adList, popupList }
  }

  try {
    const { data } = await getAdDetails({
      appCode: isH5FSEnv ? 'KYE_FS' : undefined,
      pageCode: 'orderSuccess',
      adTypeList: [AdType.BANNER, AdType.POPUP],
      channelCode: getChannelCode(), // 找国雄要的方法
      latestUpdateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    })
    // 下单成功页areaStyleCode写死为PC_BANNER_003，线上逻辑
    const SUCCESS_PAGE_AREA_CODE = 'PC_BANNER_003'
    const SUCCESS_PAGE_AREA_CODE_FEISHU = 'MP_BANNER_038'
    // 纯图片弹窗编码，默认设置使用
    const PURE_IMAGE_AREA_CODE = 'MP_POPUP_001'

    if (Array.isArray(data)) {
      adList = getDetailsList(data, isH5FSEnv ? SUCCESS_PAGE_AREA_CODE_FEISHU : SUCCESS_PAGE_AREA_CODE) as Banner[]
      popupList = getDetailsList(data, PURE_IMAGE_AREA_CODE) as Popup[]
    }
  } catch (error) {
    console.log('获取广告数据失败', error)
  }

  return { adList, popupList }
}

/**
 * @description 独立上报函数
 * @param adDetail
 * @param index
 * @param extraParams
 * @returns
 */
export const confirmByUser = async (
  adDetail: Banner | Popup,
  index: number,
  extraParams?: {
    noLongerRemindFlag?: TrueOrFalseNumber
    eventType?: string // 1 确定 2 关闭
  },
) => {
  if (!adDetail) {
    return
  }

  const source = await native?.getSource()
  const channelCode = source?.source

  const { noLongerRemindFlag = 0, eventType = '1' } = extraParams || {}

  const params: ConfirmAdParams = {
    channelSource: channelCode,
    eventType,
    buttonIndex: index.toString(),
    advertisementCodeList: [adDetail.advertisementCode],
    noLongerRemindFlag: noLongerRemindFlag,
  }

  if (noLongerRemindFlag) {
    params.noLongerRemindDays = (adDetail as Popup).noLongerRemindDays
  }

  confirmClickAd(params)
}

/**
 * @description 打开广告
 */
export const openAdvertisement = async (
  adDetail: Banner | Popup,
  index: number,
  extraParams?: {
    noLongerRemindFlag?: TrueOrFalseNumber
    eventType?: string // 1 确定 2 关闭
  },
) => {
  const { advertisementCode } = adDetail
  reportEvent({
    adCodes: [advertisementCode],
    eventType: 4,
    ...getReportSorce(),
  })
  if (!adDetail || loading.value) {
    return
  }

  // 跳转方式 0=不跳转；1=h5；2=原生；3=外部小程序；4=调接口
  const { jumpMode } = adDetail
  if (jumpMode === 0) return

  loading.value = true

  const source = await native?.getSource()
  const channelCode = source?.source

  try {
    confirmByUser(adDetail, index, extraParams)
    // 使用app公共跳转方法1
    advertisementJump(adDetail)
    if (channelCode === 'miniprogram') {
      await sleep(200)
      loading.value = false
    }
  } finally {
    loading.value = false
  }
}
