import { http } from '@order-public-sub-public/utils/request'

/* 获取客户编码信息 - 用于心跳检测 - 后端-胡勇飞 */
export const fetchScanQrcodeGetConfig = () => {
  return http('web.login.checkLogin', { source: 20 }, { hideToast: true })
}
