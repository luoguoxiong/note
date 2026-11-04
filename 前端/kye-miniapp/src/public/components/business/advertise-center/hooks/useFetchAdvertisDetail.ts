/* eslint-disable no-unused-vars */
import { ref } from 'vue'
import { formatTime, isLogined } from '@/public/utils'
import { useThrottleAsync } from '@/public/hooks/useThrottleAsync'
import { getChannelCode, getReportSorce } from '../utils'
import { getConfig, PageName } from '../config'
import { getAdvertisementDetail, getWithdrawAmount } from '../api'
import { IdetailList, IGetAdvertisementDetail } from '../type'
import { IBannerProp } from '../banner/type'
import { INoticeProp } from '../notice/type'
import { PopupInfo } from '../popup/type'

/** 10 Banner 20 弹窗 30 跑马灯 */
type AdTypeList = '10' | '20' | '30' | '70'

interface UseFetchAdvertisDetailParmas {
  pageName: PageName
  popupCallback?: (hasPopup: boolean) => void
}

interface AdResult {
  banner: IBannerProp[]
  notice: INoticeProp[]
  popup?: PopupInfo
  floatPanel: IdetailList[]
}

export const useFetchAdvertisDetail = (hooksParams: UseFetchAdvertisDetailParmas) => {
  const result = ref<AdResult>({
    banner: [],
    notice: [],
    floatPanel: [],
  })

  const isFetching = ref(true)
  const configForPage = getConfig(hooksParams.pageName)

  const getDetailData = async ({
    adTypeList = [],
    isHasMoney = false,
  }: {
    adTypeList?: AdTypeList[]
    isHasMoney?: boolean
  } = {}) => {
    try {
      const { operatePort, operatorSystem } = getReportSorce()
      const request = {
        channelCode: getChannelCode(),
        pageCode: configForPage.pageCode,
        appCode: configForPage.appCode,
        adTypeList,
        latestUpdateTime: formatTime(Date.now(), 'YYYY-MM-DD HH:mm:ss'),
        operatePort,
        operatorSystem
      }

      const tasks: Promise<any>[] = [getAdvertisementDetail(request)]

      if (isLogined() && isHasMoney) {
        tasks.push(getWithdrawAmount())
      }

      const [adRes, moneyRes] = await Promise.allSettled(tasks)

      const adList: IGetAdvertisementDetail[] = adRes.status === 'fulfilled' ? (adRes.value.data ?? []) : []

      const moneyNotice: INoticeProp[] =
        moneyRes?.status === 'fulfilled' && +moneyRes.value.data
          ? [
              {
                noticeText: '您有奖励金可提现，前往提现',
                isMoney: true,
                advertisementCode: '',
                h5Link: '',
                jumpMode: 1,
                pageGroupCode: '',
                showStrategy: 1,
                modelRoute: '222',
                customeParam: '',
                urlCustomParam: [],
              },
            ]
          : []

      const adMap = adList.reduce<Record<AdTypeList, IGetAdvertisementDetail | undefined>>(
        (acc, item) => {
          acc[item.advertisementType as AdTypeList] = item
          return acc
        },
        {} as Record<AdTypeList, IGetAdvertisementDetail | undefined>,
      )

      /** Banner */
      const banner =
        adMap['10']?.detailsList?.map((v) => ({
          posterLink: v.advertisementBannerDto.posterLink,
          h5Link: v.advertisementBannerDto.h5Link,
          jumpMode: v.advertisementBannerDto.jumpMode,
          pageGroupCode: v.advertisementBannerDto.pageGroupCode,
          buttonIndex: v.advertisementBannerDto.buttonIndex,
          advertisementCode: v.advertisementCode,
          advertisementTitle: v.advertisementTitle,
          modelRoute: v.advertisementBannerDto.modelRoute,
          customeParam: v.advertisementBannerDto.customeParam,
          urlCustomParam: v.advertisementBannerDto.urlCustomParam,
          showStrategy: v.showStrategy,
        })) ?? []

      /** Notice */
      const notice =
        adMap['30']?.detailsList?.map((v) => ({
          h5Link: v.advertisementNoticeDto.h5Link,
          jumpMode: v.advertisementNoticeDto.jumpMode,
          pageGroupCode: v.advertisementNoticeDto.pageGroupCode,
          advertisementCode: v.advertisementCode,
          noticeText: v.advertisementNoticeDto.noticeText,
          showStrategy: v.showStrategy,
          modelRoute: v.advertisementNoticeDto.modelRoute,
          customeParam: v.advertisementNoticeDto.customeParam,
          urlCustomParam: v.advertisementNoticeDto.urlCustomParam,
        })) ?? []

      /** Popup */
      const popupSource = adMap['20']
      const popupDetail = popupSource?.detailsList?.[0]
      const popup = popupDetail ? { ...popupDetail, areaStyleCode: popupSource?.areaStyleCode } : undefined

      result.value = {
        banner,
        notice: [...moneyNotice, ...notice],
        popup,
        floatPanel: adMap['70']?.detailsList?.slice(0, 3) || [],
      }

      hooksParams.popupCallback?.(!!popup)

      return result.value
    } finally {
      isFetching.value = false
    }
  }

  const { run: getDetailDataThrottle, forceRun: getDetailDataForce } = useThrottleAsync(getDetailData)

  return {
    getDetailDataThrottle,
    getDetailDataForce,
    result,
    isFetching,
  }
}
