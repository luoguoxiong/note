import { fetchApplicationInfoList } from '@order-public-sub-public/apis/application'
import { ApplicationListResponseData } from '@order-public-sub-public/apis/application/types'
import grayHeaderStore from '@order-public-sub-public/utils/request/grayHeader'
import { setStorageSync } from '@order-public-sub-public/storage'

type GetApplicationInfoOptions = {
  // forceCheck 是否强制刷新
  forceCheck?: boolean
  // isCurrentTime 是否传入当前时间
  isCurrentTime?: boolean
}

/**
 * 获取轻应用列表
 * @param areaCodes 刷新区域码
 * @param options
 * @returns {() => Promise<HttpResponse<unknown>>}
 */
const __getApplicationInfoList = (areaCodes = [], options: GetApplicationInfoOptions = {}) => {
  let applicationLastTime = 0

  const params = {
    updateTime: applicationLastTime,
    areaCodes,
  }
  // 是否强制刷新
  if (options && options.forceCheck) {
    params['forceCheck'] = '1'
  }

  return function () {
    return fetchApplicationInfoList(params).then((res) => {
      if (res.code === 0 && res.data) {
        return res.data
      } else {
        return {}
      }
    })
  }
}
