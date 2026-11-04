import { http } from '@public/utils/request'

export interface CodeVerifyReq {
  ruleId: number
  strategyCode: string
  phone?: string
  captchaInfo?: {
    ticket: string
    randStr: string
    source: string
  }
}

export const codeCheck = (param: CodeVerifyReq) => {
  return http<{ safeVerifyId: string }>('web.uam.riskVerify.userCheck', param)
}
