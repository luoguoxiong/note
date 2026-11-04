import { http } from '@public/utils/request'

const APPKEY = 55687

export type SignSubscribeStatus = 10 | 20 | '10' | '20'

/** crm.open.accountSubscribe.updateSignStatus */
export function updateSignStatus(param: { mobile: string; channel: string; status: SignSubscribeStatus }) {
  return http('crm.open.accountSubscribe.updateSignStatus', param, {
    appkey: APPKEY,
    hideToast: false,
  })
}
