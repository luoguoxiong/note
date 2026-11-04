import { ref, Ref } from 'vue'

import { http } from '@/public/utils/request'
import {
  WebLoginWeChatAuthorizedLoginByRiskIn,
  WebLoginWeChatAuthorizedLoginByRiskOut,
} from './web.login.weChat.authorizedLoginByRisk'
import { WebLoginWeChatAuthorizedBindIn, WebLoginWeChatAuthorizedBindOut } from './web.login.weChat.authorizedBind'
import {
  WebLoginVerificationSendSmsCodeIn,
  WebLoginVerificationSendSmsCodeOut,
} from './web.login.verification.sendSmsCode'

export interface RequestPayloadMap {
  'web.login.weChat.authorizedLoginByRisk': WebLoginWeChatAuthorizedLoginByRiskIn
  'web.login.weChat.authorizedBind': WebLoginWeChatAuthorizedBindIn
  'web.login.verification.sendSmsCode': WebLoginVerificationSendSmsCodeIn
}

export interface ResponseDataMap {
  'web.login.weChat.authorizedLoginByRisk': WebLoginWeChatAuthorizedLoginByRiskOut
  'web.login.weChat.authorizedBind': WebLoginWeChatAuthorizedBindOut
  'web.login.verification.sendSmsCode': WebLoginVerificationSendSmsCodeOut
}

const loadings = new Proxy({} as Record<keyof RequestPayloadMap, Ref<boolean>>, {
  get(target, prop: keyof RequestPayloadMap) {
    target[prop] = target[prop] || ref(false)
    return target[prop]
  },
})

export async function api<K extends keyof RequestPayloadMap>(code: K, data: RequestPayloadMap[K]) {
  try {
    loadings[code].value = true
    return await http<ResponseDataMap[K] & { type: number }>(code, data)
  } finally {
    loadings[code].value = false
  }
}

api.loadings = loadings
