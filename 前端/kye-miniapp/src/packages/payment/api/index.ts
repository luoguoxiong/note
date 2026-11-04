import { http } from '@/public/utils/request'

export const payAuthShareCheck = (params: WebUamPayAuthShareCheckIn) => {
  return http<WebUamPayAuthShareCheckOut>('web.uam.payAuth.shareCheck', params)
}

export interface WebUamPayAuthShareCheckIn {
  /**
   * 唯一id
   */
  id: number
}

export interface WebUamPayAuthShareCheckOut {
  /**
   * 校验结果，0：校验成功，1：没有审批权限（去分享），2：未绑码，3：未绑定付款方
   */
  checkResult?: number
  /**
   * 校验失败提示
   */
  tips?: string
  /**
   * 授权状态，校验成功后返回，10审核中 20：已授权
   */
  authStatus?: number
}
