import TCaptcha from './index.vue'
import { HttpResponse } from '@/public/utils/types'
import { HttpCode } from '@/public/utils/request/constants'

type CaptchaPayload = {
  ruleId: number
  strategyCode: string
}

type CaptchaRequestFn<T> = (_safeVerifyId?: string) => Promise<HttpResponse<T>>

export function withCaptchaRequest<T = unknown>(
  requestFn: CaptchaRequestFn<T>,
  ref?: InstanceType<typeof TCaptcha>,
  extraParams?: Record<string, any>,
  onCaptchaVisible?: () => void,
) {
  return async () => {
    const resp = await requestFn()
    if (resp.code === HttpCode.CAPTCHA) {
      const payload = resp.data as CaptchaPayload
      onCaptchaVisible?.()
      const safeVerifyId = await ref?.showCaptcha({
        ...extraParams,
        ruleId: payload.ruleId,
        strategyCode: payload.strategyCode,
      })

      return requestFn(safeVerifyId)
    }

    return resp
  }
}
