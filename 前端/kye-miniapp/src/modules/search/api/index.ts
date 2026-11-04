import { ref, Ref } from 'vue'

import { http } from '@/public/utils/request'
import { HttpOptions } from '@/public/utils/types'
import { WebQuerySearchHistorySaveIn, WebQuerySearchHistorySaveOut } from './web.query.searchHistory.save'
import { WebQuerySearchHistoryLimitIn, WebQuerySearchHistoryLimitOut } from './web.query.searchHistory.limit'
import { WebUserApplicationIndexSearchIn, WebUserApplicationIndexSearchOut } from './web.user.application.indexSearch'
import {
  WebUserApplicationIndexLinkSearchIn,
  WebUserApplicationIndexLinkSearchOut,
} from './web.user.application.indexLinkSearch'
import { WebQuerySearchHistoryDeleteIn, WebQuerySearchHistoryDeleteOut } from './web.query.searchHistory.delete'
import { WebQueryScoreGetIn, WebQueryScoreGetOut } from './web.query.score.get'
import {
  WebQueryWaybillQueryDriverContainOutIn,
  WebQueryWaybillQueryDriverContainOutOut,
} from './web.query.waybill.queryDriverContainOut'

import { ApplicationIndexSearchOut } from './web.user.application.indexSearch.v1'
import { AiClipboardParseIn, AiClipboardParseOut } from './web.tool.aiClipboard.parse'
import { AiClipboardRemindSettingIn } from './web.tool.aiClipboard.remindSetting'

export interface RequestPayloadMap {
  'web.user.application.indexSearch': WebUserApplicationIndexSearchIn
  'web.user.application.indexLinkSearch': WebUserApplicationIndexLinkSearchIn
  'web.query.searchHistory.limit': WebQuerySearchHistoryLimitIn
  'web.query.searchHistory.save': WebQuerySearchHistorySaveIn
  'web.query.searchHistory.delete': WebQuerySearchHistoryDeleteIn
  'web.query.score.get': WebQueryScoreGetIn
  'web.query.waybill.queryDriverContainOut': WebQueryWaybillQueryDriverContainOutIn
  'web.user.application.indexSearch.v1': WebUserApplicationIndexSearchIn
  'web.tool.aiClipboard.parse': AiClipboardParseIn
  'web.tool.aiClipboard.remindSetting': AiClipboardRemindSettingIn
}

export interface ResponseDataMap {
  'web.user.application.indexSearch': WebUserApplicationIndexSearchOut
  'web.user.application.indexLinkSearch': WebUserApplicationIndexLinkSearchOut
  'web.query.searchHistory.limit': WebQuerySearchHistoryLimitOut
  'web.query.searchHistory.save': WebQuerySearchHistorySaveOut
  'web.query.searchHistory.delete': WebQuerySearchHistoryDeleteOut
  'web.query.score.get': WebQueryScoreGetOut
  'web.query.waybill.queryDriverContainOut': WebQueryWaybillQueryDriverContainOutOut
  'web.user.application.indexSearch.v1': ApplicationIndexSearchOut,
  'web.tool.aiClipboard.parse': AiClipboardParseOut
}

const loadings = new Proxy({} as Record<keyof RequestPayloadMap, Ref<boolean>>, {
  get(target, prop: keyof RequestPayloadMap) {
    target[prop] = target[prop] || ref(false)
    return target[prop]
  },
})

export async function api<K extends keyof RequestPayloadMap>(code: K, data: RequestPayloadMap[K], options?: HttpOptions) {
  try {
    loadings[code].value = true
    return await http<ResponseDataMap[K]>(code, data, options)
  } finally {
    loadings[code].value = false
  }
}

api.loadings = loadings

export * from './web.user.application.indexSearch'
export * from './web.user.application.indexLinkSearch'
export * from './web.query.searchHistory.limit'
export * from './web.query.searchHistory.save'
export * from './web.query.searchHistory.delete'
export * from './web.query.score.get'
export * from './web.query.waybill.queryDriverContainOut'
export * from './web.user.application.indexSearch.v1'
export * from './web.tool.aiClipboard.parse'
export * from './web.tool.aiClipboard.remindSetting'
