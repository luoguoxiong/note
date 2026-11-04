/**
 * @Desc: messageHandler 极光push消息处理类型
 * @Date: 2025/8/14
 */

/* 极光push消息处理 */
import kyeNavigate from '@public/utils/native/navigate'
import { navigateByOldUrl, oldUrlHasNative, openWebviewH5, urlContact, getQueryObject, oldUrlFilterLink, report_other_event } from '@public/utils'
import { PushMsgExtraModel, PushMsgResult } from '@public/utils/appPush/types'
import { usePlatformStore } from '@/store/platform'
import { getEnvConfig } from '@/public/config'
import { ApiMsgPushRecordClickReport } from '@public/apis/push'
import { getToken } from '@/public/storage'

/* 推送消息类型 */
enum MsgClass {
  '新闻消息' = '1', // 未使用
  '下单推送' = '2', // 未使用
  '下单推送2' = '3', // 未使用
  '异常登录推送' = '5', // 未使用
  '我的评论' = '6', // TODO 存在单独通知弹窗-产品确认
  '评论推送一级评论' = '7', // 未使用
  '评论推送二级评论' = '8', // 未使用
  '催件推送' = '9', // 未使用
  '推送10' = '10', // TODO 存在 图片弹窗
  '推送11' = '11', // TODO 存在 图片弹窗
  '消息路由' = '12', // TODO 消息路由，[http,native,mp]?
}

const tabBarLists = [
  'layout/pages/home/index',
  'layout/pages/order/index',
  'layout/pages/waybill/index',
  'layout/pages/mine/index',
]

/* 接口返回-消息通用配置-消息路由 */
type MessageRouteItem = {
  pageName: string
  type: 'h5' | 'native' | 'miniProgram'
  url: string
  customParams: Record<string, any>
}

/**
 * 判断极光消息跳转类型
 * @param accessUrl 极光跳转url
 */
const getMsgJumpType = (accessUrl: string) => {
  let jumpType = ''
  if (!accessUrl) {
    return ''
  }
  if (accessUrl.startsWith('native')) {
    // 原生路由页
    jumpType = 'native'
  } else if (accessUrl.startsWith('mp')) {
    // 小程序内部路由
    jumpType = 'mp'
  } else if (accessUrl.startsWith('https')) {
    // h5页面
    jumpType = 'h5'
  }
  return jumpType
}

/**
 * 根据模块编码获取native-accessUrl对应的消息路由配置, 返回的路由配置可能是H5/native
 * @param accessUrl
 */
const getNativeMsgRouteConfig = (accessUrl) => {
  if (!accessUrl) {
    return {}
  }
  const nativePage = accessUrl.replace(/(native|mp):\/\//g, '').split('?')[0]
  const pageQuery = accessUrl.replace(/(native|mp):\/\//g, '').split('?')[1] || ''

  console.log('[appPlugin] 获取转换前路由', nativePage)
  const platformStore = usePlatformStore()

  if (!nativePage || !platformStore?.messageRouteMap) {
    return {}
  }

  // 邀请寄新追加自定义参数
  if (nativePage === 'inviteCode' && pageQuery) {
    // 新增追加自定义参数
    const config = platformStore?.messageRouteMap?.find((f) => f?.pageName === nativePage)
    if (!config) {
      return {}
    }

    let customParams = {}
    const pageQuery = getQueryObject(accessUrl.replace(/(native|mp):\/\//g, ''))
    if (config.customParams && typeof config.customParams === 'object') {
      customParams = { ...config.customParams, ...pageQuery }
    } else {
      customParams = pageQuery || {}
    }
    return {
      ...config,
      customParams,
    }
  } else {
    // 走原来的
    return platformStore?.messageRouteMap?.find((f) => f?.pageName === nativePage)
  }
}

/**
 * 极光push消息数据结构
 * @param msgData
 * @param test
 *     pushMessageHandler({
 *       msgClass: '12',
 *       msgResult: JSON.stringify({
 *         title: '测试聚合-跳转原生页',
 *         content: '22222',
 *         msgRid: '1114a8979394ca39e4a',
 *         userld: '11',
 *         'date Time': '22',
 *         accessUrl: 'native://searchTab50?query=111',
 *         pushld: '96c649ad-aa65-45a6-aOab-339f2£27d325',
 *       }),
 *     })
 */
export const pushMessageHandler = (msgData: PushMsgExtraModel) => {
  if (!msgData) {
    return
  }
  const msgValue = typeof msgData === 'object' ? msgData : JSON.parse(msgData)
  // const { extra } = msgData || {}
  const { msgClass, msgResult } = msgValue || {}
  // msgClass='12'
  if (String(msgClass) === MsgClass['消息路由']) {
    console.log('[appPlugin] msgResult', msgResult)
    const result = msgResult.replace(/\n/g, '\\n')
    const msgResultModel = JSON.parse(result)
    pushMessageClickReport(msgResultModel)
    const { accessUrl } = msgResultModel
    // 极光推送点击已读上报
    const pageQuery = getQueryObject(accessUrl)
    if (pageQuery && pageQuery.mi) {
      report_other_event('other_homepage_message_read', {
        region_code: 'message_read',
        region_name: '消息已读状态上报',
        page_code: 'page_homepage_v1',
        page_name: '移动端新版首页',
        event_code: 'other_homepage_message_read',
        event_name: '访问小程序的所有消息，已读状态上报',
        message_identifier: pageQuery.mi,
      })
    }
    const jumpType = getMsgJumpType(accessUrl)
    console.log('[appPlugin] 跳转类型', jumpType, msgResultModel)
    switch (jumpType) {
      case 'h5':
        pushMessageH5Handler(msgResultModel)
        break
      case 'native':
      case 'mp':
        pushMessageNativeHandler(msgResultModel)
        break
      default:
    }
  }
}

/**
 * push消息-跳转H5
 * @param data
 */
export const pushMessageH5Handler = (data: PushMsgResult) => {
  const { accessUrl } = (data || {}) as PushMsgResult
  if (accessUrl) {
    // TODO H5增加特殊逻辑-旧链接适配(下单/查件)
    // 存在需要转换的H5页面-跳转原生
    if (oldUrlHasNative(accessUrl)) {
      if (oldUrlFilterLink(accessUrl)) {
        openWebviewH5(accessUrl, { needLogin: true })
        return
      }
      const urlParamStr = accessUrl.split('?')[1] || ''
      navigateByOldUrl(accessUrl, { urlParamStr })
    } else {
      // TODO - 拦截实名认证跳转原生路由
      openWebviewH5(accessUrl, { needLogin: true })
    }
  }
}

const isTabBarPage = (url: string) => {
  return !!(url && tabBarLists?.find((f) => url?.includes(f)))
}

/**
 * push消息-跳转路由原生页(路由配置存在H5场景)
 * @param data
 */
export const pushMessageNativeHandler = (data: PushMsgResult) => {
  const { accessUrl } = data || {}
  const { url, type, customParams } = (getNativeMsgRouteConfig(accessUrl) || {}) as MessageRouteItem
  console.log('[appPlugin] 跳转类型 pushMessageNativeHandler', url, type)
  if (url) {
    if (type === 'h5') {
      if (oldUrlHasNative(url)) {
        if (oldUrlFilterLink(url)) {
          openWebviewH5(url, customParams)
          return
        }
        const urlParamStr = url.split('?')[1] || ''
        console.log('[app] navigateByOldUrl', url)
        navigateByOldUrl(url, { urlParamStr })
      } else {
        openWebviewH5(url, customParams)
      }
    } else if (type === 'native' || type === 'miniProgram') {
      // 跳转原生页增加-消息路由列表
      const nativeUrl = urlContact(url, customParams)
      console.log('[appPlugin] 跳转完整连接', nativeUrl)
      const isTabBar = isTabBarPage(url)
      const navigateApi = isTabBar ? 'switchTab' : 'navigateTo'
      kyeNavigate.navigateBefore(navigateApi, {
        url: nativeUrl,
      })
    }
  } else {
    console.error('push消息-跳转路由配置不存在url')
  }
}

/**
 * 极光消息-点击埋点事件
 * @param msgResult
 */
export const pushMessageClickReport = (msgResult) => {
  try {
    const { systemType, platform } = getEnvConfig()
    const { pushId, pushld } = msgResult || {}
    const params = {
      pushId: pushId || pushld,
      channelReport: systemType,
      operatePort: 'APP',
      operatorSystem: platform,
    }
    console.log('[app message report]', params)
    const token = getToken()
    if(!token) return
    ApiMsgPushRecordClickReport(params)
  } catch (e) {
    console.log(e)
  }
}
