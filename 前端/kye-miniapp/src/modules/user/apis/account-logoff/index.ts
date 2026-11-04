import { ref, Ref } from 'vue'
import { http } from '@/public/utils/request'
import {
  WebOrderGetDataDictionaryByCodeIn,
  WebOrderGetDataDictionaryByCodeOut,
} from './web.order.getDataDictionaryByCode'
import { WebSsoUserLogOffIn, WebSsoUserLogOffOut } from './web.ssoUser.logOff'
import { WebHelpGetHelpIn, WebHelpGetHelpOut } from './web.help.getHelp'
import {
  WebLoginVerificationSendSmsCodeIn,
  WebLoginVerificationSendSmsCodeOut,
} from './web.login.verification.sendSmsCode'
import {
  WebLoginVerificationCheckSmsCodeIn,
  WebLoginVerificationCheckSmsCodeOut,
} from './web.login.verification.checkSmsCode'
import { WebH5ApiAgreementListIn, WebH5ApiAgreementListOut } from './web.h5Api.agreement.list'

export interface RequestPayloadMap {
  'web.order.getDataDictionaryByCode': WebOrderGetDataDictionaryByCodeIn
  'web.ssoUser.logOff': WebSsoUserLogOffIn
  'web.help.getHelp': WebHelpGetHelpIn
  'web.login.verification.checkSmsCode': WebLoginVerificationCheckSmsCodeIn
  'web.login.verification.sendSmsCode': WebLoginVerificationSendSmsCodeIn
  'web.h5Api.agreement.list': WebH5ApiAgreementListIn
}

export interface ResponseDataMap {
  'web.order.getDataDictionaryByCode': WebOrderGetDataDictionaryByCodeOut
  'web.ssoUser.logOff': WebSsoUserLogOffOut
  'web.help.getHelp': WebHelpGetHelpOut
  'web.login.verification.checkSmsCode': WebLoginVerificationCheckSmsCodeOut
  'web.login.verification.sendSmsCode': WebLoginVerificationSendSmsCodeOut
  'web.h5Api.agreement.list': WebH5ApiAgreementListOut
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
    return await http<ResponseDataMap[K]>(code, data)
  } finally {
    loadings[code].value = false
  }
}

api.loadings = loadings

export * from './web.order.getDataDictionaryByCode'
export * from './web.ssoUser.logOff'
export * from './web.help.getHelp'
export * from './web.login.verification.checkSmsCode'
export * from './web.login.verification.sendSmsCode'
export * from './web.h5Api.agreement.list'
