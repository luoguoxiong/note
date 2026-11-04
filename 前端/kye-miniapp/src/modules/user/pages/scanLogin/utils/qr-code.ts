import { getDeviceType } from '@/modules/user/utils/device'
import { getToken } from '@/public/storage'
import { urlContact } from '@/public/utils'
import aPlus from '@/public/utils/aplusConfig'
import * as apis from '@/public/apis/user'
import Taro from '@tarojs/taro'
import { WebLoginQrCodeOperationQrCodeOut } from '@/public/apis/user/types'
import { unwrap } from './index'
import { SCAN_PAGE_TYPE } from '@/modules/user/constants/index'

// eslint-disable-next-line no-undef
const H5_BASE_URL = process.env.TARO_APP_HTTP_URL

const BIND_PHONE = `${H5_BASE_URL}/bind-phone.html`

export type QRCodeParams = {
  qrCodeToken: string
  pageType: string
}

export function getBindCodeWebviewURL(bindInfoData: WebLoginQrCodeOperationQrCodeOut, params: QRCodeParams) {
  if (params.pageType !== SCAN_PAGE_TYPE.BIND) {
    return
  }

  const { appletLoginFlag, appletLoginPhone, bindLoginPhone, bindFlag, subscribe } = bindInfoData || {}

  if (!appletLoginPhone || !bindLoginPhone) {
    return
  }

  const token = getToken()

  const queryParams = Object.assign(
    { qrCodeToken: params.qrCodeToken, token },
    {
      appletLoginFlag,
      appletLoginPhone,
      loginPhone: bindLoginPhone,
      bindFlag,
      subscribe,
      deviceType: getDeviceType(),
      from: 6,
    },
  )
  const queryStr = urlContact('', queryParams)
  const url = `${BIND_PHONE}${queryStr}&${aPlus.aplusHeader}`
  return url
}

export async function getQRCodeStatus(params: QRCodeParams) {
  const data = await unwrap(apis.getQRCodeStatus({ qrCodeToken: params.qrCodeToken }))
  const qrCodeStatus = data.qrCodeStatus

  Taro.setStorageSync('sameScan', qrCodeStatus == 0 ? true : false)

  return qrCodeStatus
}
