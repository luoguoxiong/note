/* 切换手机号 */
import { http } from '@public/utils/request'

export type CommonData = Record<string, any>

// 获取可切换手机号列表 (V1.0)
export const getSwitchList = (params) => {
  return http<CommonData>('web.login.switch.getSwitchList', params)
}

// 切换账号登陆 (V1.0)
export const switchLogin = (params) => {
  return http<CommonData>('web.login.switchLogin', params)
}

// 删除切换信息 (V1.0)
export const deleteSwitch = (params) => {
  return http<CommonData>('web.login.switch.deleteSwitch', params)
}

// 设置禁止切换功能 (V1.0)
export const setSwitchFlag = (params) => {
  return http<CommonData>('web.login.switch.setSwitchFlag', params)
}
