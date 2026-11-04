import { http } from '@public/utils/request'
import { GRAY_HEADER_USER_CENTER } from '@public/utils/grayHeader/userCenter'
import {
  ApplicationListRequestParam,
  ApplicationListRequestParamNew,
  ApplicationListRequestParamNewRes,
  CheckLoginRequestParam,
  RefreshTokenUserInfoResponse,
  WebUserNativeLightAppListOut,
} from '@public/apis/application/types'
import { shellVersion } from '@public/constants'
import { defaultChannelCode } from '@public/utils/application/constants'
import { ApplicationItem } from '@/public/utils/application/applicationType'

// 区域-菜单-轻应用列表接口
export const fetchApplicationInfoList = (param: ApplicationListRequestParam) => {
  const options = {
    channelCode: defaultChannelCode, // 渠道环境
    shellVersion: shellVersion, // 后端针对版本做了特殊处理
    menuCodes: param.menuCodes || [],
    areaCodes: param.areaCodes || [],
    applicationVersion: param.applicationVersion || '',
    updateTime: param.updateTime,
    forceCheck: param.forceCheck || '0', // ['0' 不强制缓存, '强制等待缓存']
  }
  return http<WebUserNativeLightAppListOut>('web.native.lightApp.getAppInfo', options, {
    hideToast: true,
    extraHeader: GRAY_HEADER_USER_CENTER,
  })
}

/* 获取客户编码信息 - 用于心跳检测 - 后端-胡勇飞 */
export const fetchScanQrcodeGetConfig = (param: CheckLoginRequestParam) => {
  return http('web.login.checkLogin', { source: 20, ...param }, { hideToast: true })
}

export const fetchApplicationInfoListMark = (menuCodes: string[]) => {
  return http<{
    lightApplicationInfos: ApplicationItem[]
  }>(
    'web.native.lightApp.getCornerInfo',
    { menuCodes, channelCode: defaultChannelCode },
    {
      hideToast: true,
    },
  )
}

export const getRealtimeCorner = (menuCodes: string[]) => {
  return http<{
    lightApplicationInfos: ApplicationItem[]
  }>(
    'web.native.lightApp.getRealtimeCorner',
    { menuCodes, channelCode: defaultChannelCode },
    {
      hideToast: true,
    },
  )
}

// 获取轻应用新
export const fetchApplicationInfoListNew = (options: ApplicationListRequestParamNew) => {
  return http<ApplicationListRequestParamNewRes>(
    'web.homepage.user.menus',
    {
      ...options,
      channel: defaultChannelCode,
      // nativeVersion: `v${shellVersion}`,
    },
    {
      hideToast: true,
      extraHeader: GRAY_HEADER_USER_CENTER,
    },
  )
}
