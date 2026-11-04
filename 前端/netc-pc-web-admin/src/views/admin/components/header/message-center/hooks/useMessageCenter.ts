/**
 * useMessageCenter 消息跳转 hook
 * 来源: netc-pc-web/src/views/message-center-entry/hooks/useMessageCenter.js
 *
 * 迁移说明:
 * - router 实例 -> useRouter()
 * - element-ui MessageBox -> element-plus ElMessageBox
 * - @utils/storage getToken -> @/utils/auth getToken
 * - @utils/native (isClientMode/getVersion/nativeOpenUrl/isKuaShenClientMode)
 *   -> @/native/electron 函数式导入
 * - envSdk.backLogin() -> useRouter().push('/login') (老实现即 router.push('/login'))
 */
import { KMessage } from '@netc-design-pc/ui'
import { useRouter } from 'vue-router'
import { isClientMode, isKuaShenClientMode, getVersion, nativeOpenUrl } from '@/native/electron'
import { getToken } from '@/utils/auth'
import { showLogoutDialog } from '@/utils/iframeBridge/logoutDialog'
import { compareVersions } from '@/utils'
import messageConst from '../consts'
import type { MessageRow } from '../service/messageApiService'

// hooks兼容匹配CRM视频在3.0 - 3.1.0壳打开
export const isCRMInformVideoInKuashengClient = (url: string) => {
  return url.includes('inform-video') && isKuaShenClientMode() && !!window['kuasheng_openUrl']
}

// 是否跨声视频页（需携带token）
export const isKuashengVideo = (url: string) => {
  const lists = [
    'kuasheng-h5-uat-cdn.kye-erp.com',
    'kuasheng-h5-cdn.kye-erp.com',
    'erp-kuasheng-h5-uat.kye-erp.com',
    'erp-kuasheng-h5.kye-erp.com',
    'kuasheng-h5.kye-erp.com',
  ]
  const item = lists.find((f) => url.includes(f))
  return !!item
}

/**
 * token 失效重新登录（消息中心打开的新窗口 / iframe 页面回报触发）
 * 统一走全局退登弹窗单例，与其他退登入口互斥
 */
const tokenInvalidated = () => {
  // 对齐老基座：本场景弹窗前不清缓存（旧实现仅 backLogin 跳登录），点确认后退登时才清
  showLogoutDialog({
    message: '用户信息已失效，请重新登录',
    title: '确定登出',
    confirmText: '重新登录',
    reason: 'invalid',
    clearBeforeShow: false,
  })
}

/** window message 监听是否已注册（openMessageWindowBlank 可能被多次调用，避免重复注册） */
let tokenInvalidListenerRegistered = false

/** 跨窗口消息处理：仅认受信任来源的 tokenInvalid 消息 */
const onTokenInvalidMessage = (msg: MessageEvent) => {
  try {
    if (!msg || !msg.data) return
    let data: Record<string, any> = {}
    if (typeof msg.data === 'string') {
      data = JSON.parse(msg.data) || {}
    } else if (typeof msg.data === 'object') {
      data = msg.data
    }
    // tokenInvalid: token失效
    if (data.type === 'tokenInvalid') {
      tokenInvalidated()
    }
  } catch (ex) {
    console.log('getIframeMessage :>> ', ex)
  }
}

/** 监听新窗口 token 失效消息（幂等） */
const listenTokenInvalid = () => {
  if (tokenInvalidListenerRegistered) return
  tokenInvalidListenerRegistered = true
  window.addEventListener('message', onTokenInvalidMessage, false)
}

export default function useMessageCenter({
  switchVisibleCallback,
}: { switchVisibleCallback?: (val: boolean) => void } = {}) {
  const router = useRouter()

  /* 关闭消息中心抽屉 */
  const switchVisibleOff = () => {
    switchVisibleCallback && switchVisibleCallback(false)
  }
  /**
   * 消息跳转
   */
  const handleMessageNavigation = async (data: Partial<MessageRow>) => {
    // <pcJumpType> pc端跳转类型 0=不跳转；1=h5；2=原生；3=外部小程序；4=调接口
    const { jumpRestrict, pcJumpType, appJumpType, pcH5JumpType, pcUrl, appUrl, customParams } = data
    if (pcUrl) {
      // 如果是跨越风貌视频链接
      const customParamsParse = JSON.parse(customParams as string)
      if (`${customParamsParse.PUSH_TO_STYLE}` === '1' && isClientMode()) {
        const clientVersion = await getVersion()
        if ((compareVersions(clientVersion as string, 'V3.1.0') ?? 0) >= 0) {
          routerToMessageIframe(pcUrl || appUrl || '')
        } else {
          openMessageWindowBlank({ pcUrl, appUrl })
        }
        return
      }
      switch (pcJumpType) {
        case 1:
          pcH5JumpHandler({ pcH5JumpType, pcUrl, appUrl, jumpRestrict })
          switchVisibleOff()
          break
        case 2: {
          // 对齐老基座: 跳账号权限整合页时补"强制刷新 + 时间戳"
          // (microForceUpdate 由 useRoutePrefetch 消费后重建 iframe, timeStamp 让"已在该页"也能构成真实导航)
          // needQuerySave 用字符串 'false'(新基座统一约定, 消费端均按 === 'false' 判断)
          const isPermissionManage = pcUrl.includes('admin/permission-manage')
          router.push({
            path: pcUrl,
            ...(isPermissionManage
              ? {
                  query: {
                    microForceUpdate: '10',
                    needQuerySave: 'false',
                    timeStamp: String(Date.now()),
                  },
                }
              : {}),
          })
          switchVisibleOff()
          break
        }
        case 0:
          routerToDetail(data)
          break
      }
    } else {
      // 移动端h5跳转
      if (appUrl) {
        switch (appJumpType) {
          case 0:
            routerToDetail(data)
            break
          case 1:
            openMessageWindowBlank({ pcUrl, appUrl, jumpRestrict })
            switchVisibleOff()
            break
          default:
            KMessage.warning(messageConst.h5CrossMessageTip)
            break
        }
      } else {
        KMessage.warning(messageConst.h5CrossMessageTip)
      }
    }
  }
  /**
   * 是否是移动端h5链接
   */
  const isAppH5Url = ({ pcUrl = '', appUrl = '' }: { pcUrl?: string; appUrl?: string } = {}) => {
    return !!(appUrl && !pcUrl)
  }
  /**
   * 是否是互联网移动端h5链接
   */
  const isKYeH5 = (url = '') => {
    return (
      url.includes('ic-h5-uat.kye-erp.com') ||
      url.includes('ic-h5-stg.kye-erp.com') ||
      url.includes('ic-h5.kye-erp.com')
    )
  }
  const isVidos = (url = '') => {
    return url.includes('kuasheng-h5-uat-cdn.kye-erp.com') || url.includes('kuasheng-h5-cdn.kye-erp.com')
  }
  /**
   * 跳转至消息中心详情页
   */
  const routerToDetail = (row: Partial<MessageRow> = {}) => {
    const { messagePushTime, messageSerialNumber, messageType } = row
    router.push({
      path: '/admin/message-center-detail',
      query: {
        messagePushTime,
        messageSerialNumber,
        messageType,
      } as Record<string, any>,
    })
    switchVisibleOff()
  }
  const orderJump = (row: Partial<MessageRow> = {}) => {
    const { messagePushTime, messageSerialNumber, messageType } = row
    switch (row.messageType) {
      case 30: // 积分通告 - 跳转积分中心
        router.push({
          path: '/admin/points-center',
          query: {
            messagePushTime,
            messageSerialNumber,
            messageType,
          } as Record<string, any>,
        })
        switchVisibleOff()
        return true
    }
    return false
  }
  // 打开消息中心iframe内嵌页
  const routerToMessageIframe = (url: string) => {
    if (url) {
      router.push({
        path: '/admin/message-center',
        query: {
          url: url,
        },
      })
    }
  }
  /**
   * 消息中心 - pc端打开H5逻辑
   * @param pcH5JumpType  10-打开新窗口加载H5  20-打开内部新tab加载H5
   */
  const pcH5JumpHandler = ({ pcH5JumpType, pcUrl, appUrl, jumpRestrict }: Partial<MessageRow>) => {
    switch (Number(pcH5JumpType)) {
      case 20:
        routerToMessageIframe(pcUrl || appUrl!)
        break
      case 10:
      default:
        // 打开新窗口加载H5
        openMessageWindowBlank({ pcUrl, appUrl, jumpRestrict })
        break
    }
  }
  /**
   * 为互联网/跨声视频 H5 链接追加 token(保持老项目拼接规则)
   */
  const appendTokenIfNeeded = (url: string) => {
    let nextUrl = url
    if (isKYeH5(nextUrl || '') || isKuashengVideo(nextUrl || '')) {
      const token = getToken()
      const hashPrefix = nextUrl.includes('?') ? '&' : '?'
      nextUrl = `${nextUrl}${hashPrefix}token=${token}`
      if (isVidos(nextUrl)) {
        nextUrl = nextUrl + '&fromType=' + '速运PC'
      }
    }
    return nextUrl
  }

  /**
   * 打开消息展示新窗口
   * @param pcUrl 后端可能返回null
   * @param appUrl 后端可能返回null
   */
  const openMessageWindowBlank = async ({
    pcUrl = '',
    appUrl = '',
  }: {
    pcUrl?: string
    appUrl?: string
    jumpRestrict?: number
  } = {}) => {
    const channelStyle: Record<string, { width: number | string; height: number | string }> = {
      pc: {
        width: '830',
        height: '628',
      },
      h5: {
        width: '470',
        height: '620',
      },
    }
    // 特殊处理：下载页面兼容页面太多，这里会有变形，需要重新设置宽高
    if (pcUrl?.includes('client-download.html')) {
      channelStyle.pc.width = '1216'
      channelStyle.pc.height = '670'
    }
    const isAppUrl = isAppH5Url({ pcUrl, appUrl })
    const channelCurrent = isAppUrl ? channelStyle['h5'] : channelStyle['pc']
    const { width, height } = channelCurrent
    // 兼容副屏left,top
    const left = (window.screenX || window.screenLeft || 0) + (window.screen.width - Number(channelCurrent.width)) / 2
    const top =
      (window.screenY || window.screenTop || 0) + (window.screen.height - 20 - Number(channelCurrent.height)) / 2

    const url = appendTokenIfNeeded(isAppUrl ? (appUrl as string) : (pcUrl as string))
    // 精准通知视频地址,拼接token 处理
    if (url) {
      // hooks兼容 - 匹配CRM视频在3.0壳打开
      const clientVersion = await getVersion()
      if (isCRMInformVideoInKuashengClient(url) && (compareVersions(clientVersion as string, 'V3.1.0') ?? 0) < 0) {
        nativeOpenUrl(url)
        return
      }

      const param = `width=${width},height=${height},left=${left},top=${top}, toolbar='no', menubar='no', scrollbars='no', resizable='no', location='no', status='no'`
      const winURL = window.open(url, '_blank', param)
      console.log('winURL**********', winURL)
      // 监听token 失效，从新登录
      listenTokenInvalid()
    }
  }

  return {
    handleMessageNavigation,
    orderJump,
  }
}
