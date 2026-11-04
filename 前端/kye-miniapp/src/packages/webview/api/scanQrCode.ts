import { http } from '@public/utils/request'
import { GRAY_HEADER_USER_CENTER } from '@public/utils/grayHeader/userCenter'

export const getThirdBusinessSignStatus = (param) => {
  return http('web.activity.graphicCode.faceCheckInCodeVerify', param)
}

export const getSiginThirdAppAddress = (param) => {
  return http('web.lightApplication.getApplicationInfoList', param, { extraHeader: GRAY_HEADER_USER_CENTER })
}
