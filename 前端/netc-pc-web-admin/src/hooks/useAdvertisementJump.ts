/**
 * 广告统一跳转 composable
 *
 * 消费 getAdvertisementDetails（@/apis/home）数据的组件公共跳转入口：
 * 弹窗（ky-message-popup）/ 首页 banner / 首页浮窗 / 头部跑马灯（notice）
 *
 * 统一分发规则（jumpMode）：
 *  - 0/undefined: 不跳转
 *  - 1 (H5):      CRM 视频壳版本兼容 → pcH5JumpType=10 新窗口 → function-feedback 站内 → message-center iframe 兜底
 *  - 2 (站内):    router.push(modelRoute, customeParam + extraQuery)
 *  - 4 (API 按钮): 不在此处理，由弹窗 submit 走 confirmByUser
 *
 * kystyle 拼接统一为正向：pushToStyle 真值时拼接；inform 白名单链接不拼。
 */
import { useRouter } from 'vue-router'
import native from '@/utils/native'
import { normalizeRouteLocation } from '@/utils/appBridge'
import { compareVersions, getQueryObject, isCRMInformVideoInKuashengClient } from '@/utils'
import { urlContact } from '@/utils/micro-utils'

/** 不拼 kystyle 参数的白名单链接（精准通知网页链接助手生成的链接） */
const RAW_LINK_WHITELIST = [
  'https://inform-uat.kye-erp.com',
  'https://inform.ky-express.com',
  '/admin/function-feedback',
]

/** 广告跳转目标（getAdvertisementDetails 各 DTO 共有的跳转字段） */
export interface AdJumpTarget {
  /** 0 不跳转 1 H5 2 站内 3 微信小程序 4 API 按钮 */
  jumpMode?: number
  /** H5 链接 */
  h5Link?: string
  /** 站内路由 */
  modelRoute?: string
  /** 站内路由参数 */
  customeParam?: Record<string, string | number> | null
  /** H5 打开方式：10 新窗口，其他 message-center iframe 承载 */
  pcH5JumpType?: number | string
}

export interface AdJumpOptions {
  /** 真值时拼接 kystyle 参数 */
  pushToStyle?: number | string
  /** 站内跳转(jumpMode=2)附加 query，如 banner 的 needQuerySave */
  extraQuery?: Record<string, string | number>
}

/** 正向拼接 kystyle：pushToStyle 真值才拼，白名单链接不拼 */
function buildH5Link(rawLink: string, pushToStyle?: number | string): string {
  if (!rawLink) return rawLink
  if (RAW_LINK_WHITELIST.some((w) => rawLink.includes(w))) return rawLink
  return pushToStyle ? urlContact(rawLink, { type: 'kystyle' }) : rawLink
}

export function useAdvertisementJump() {
  const router = useRouter()

  /**
   * 广告统一跳转分发
   */
  async function jumpByAdvertisement(target: AdJumpTarget, options: AdJumpOptions = {}): Promise<void> {
    const rawLink = target.h5Link ?? ''

    switch (target.jumpMode) {
      case 1: {
        if (!rawLink || !rawLink.includes('http')) break
        const h5Link = buildH5Link(rawLink, options.pushToStyle)
        // CRM 视频在 3.0 - 3.1.0 壳打开的版本兼容
        if (isCRMInformVideoInKuashengClient(rawLink)) {
          const clientVersion = (await native.getVersion()) as string
          const cmp = compareVersions(clientVersion, 'V3.1.0') as number
          if (cmp >= 0) {
            router.push({ path: '/admin/message-center', query: { url: h5Link } })
          } else {
            native.nativeOpenUrl?.(h5Link)
          }
        } else if (Number(target.pcH5JumpType) === 10) {
          window.open(h5Link, '_blank')
        } else if (h5Link.includes('/admin/function-feedback')) {
          // 兼容从 精准通知--一次性通知--通知内容内--网页链接生成助手 生成的链接
          router.push({ path: '/admin/function-feedback', query: getQueryObject(h5Link) })
        } else {
          router.push({ path: '/admin/message-center', query: { url: h5Link } })
        }
        break
      }
      case 2: {
        if (!target.modelRoute) break
        // modelRoute 为后端下发，可能自带 query(如 ?pageTab=104&microForceUpdate=10)，
        // path 内嵌 query 的合并由 normalizeRouteLocation 统一处理；
        // microForceUpdate 的强刷由 useRoutePrefetch 消费(见其路由 watch)
        router.push(
          normalizeRouteLocation({
            path: target.modelRoute,
            query: {
              ...(target.customeParam ?? {}),
              ...(options.extraQuery ?? {}),
            } as Record<string, string | number>,
          })
        )
        break
      }
      // case 4 由弹窗 submit 处理 confirmByUser
      default:
        break
    }
  }

  return { jumpByAdvertisement, buildH5Link }
}
