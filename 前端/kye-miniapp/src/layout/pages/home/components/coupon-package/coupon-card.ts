import { CouponCategoryEnum } from '../../apis/types'
import type { HomepageCouponCard, HomepageCouponInfo } from '../../apis/types'
import { formatCouponType, formateDiscount } from './formatter'

/** 首页券区域最多展示卡片数（后端已截断，此处仅作防御） */
export const MAX_HOME_COUPON_CARDS = 3

/** 领券卡本地状态（接口无领取/失效字段，按卡 id 本地覆盖） */
export interface ReceiveLocalStatus {
  isGet?: boolean
  invalidated?: boolean
}

/** 领券卡视图数据 */
export interface ReceiveView {
  list: HomepageCouponInfo[]
  isGet?: boolean
  invalidated?: boolean
  total: number
}

/** 统一卡片视图模型：免单券 / 领券 / 下单券（后端已排序合并，前端仅映射） */
export type CouponCard =
  | {
      kind: 'free'
      key: string
      /** 「立即寄件」二次校验匹配键 */
      activityId?: number
      title: string
      /** 免单范围标签 */
      scopeTag: string
      mergedText: string
      validEnd?: number
    }
  | {
      kind: 'receive'
      key: string
      /** 活动 id，领取接口入参 + 本地状态键 */
      id?: number
      receive: ReceiveView
    }
  | {
      kind: 'order'
      key: string
      /** 「立即寄件」二次校验匹配键 */
      couponBaseCode?: string
      amount?: number | null
      discount?: string
      displayType: string
      desc: string
      count: number
      validEnd?: number
    }

/** 折扣类减免形式（展示 X 折）：20-折扣 50-满额折扣 60-新版折扣 */
export const DISCOUNT_RELIEF_FORMS = [20, 50, 60]

type FreeCard = Extract<CouponCard, { kind: 'free' }>
type ReceiveCard = Extract<CouponCard, { kind: 'receive' }>
type OrderCard = Extract<CouponCard, { kind: 'order' }>

/** 免单券卡映射 */
const mapFreeCard = (c: HomepageCouponCard): FreeCard => ({
  kind: 'free',
  key: `free-${c.activityId ?? c.couponTitle}`,
  activityId: c.activityId,
  title: c.couponTitle || '免单券',
  scopeTag: c.freeRangeDesc || '',
  mergedText: c.couponDesc || '',
  validEnd: c.validEnd,
})

/** 领券卡映射；couponInfoList 缺失/为空时无券可渲染（单卡分支直取 list[0]），返回 null 剔除防白屏 */
const mapReceiveCard = (c: HomepageCouponCard, localStatus: Record<number, ReceiveLocalStatus>): ReceiveCard | null => {
  const list = c.couponInfoList || []
  if (list.length === 0) return null
  const local = (c.id !== undefined ? localStatus[c.id] : undefined) || {}
  // 「共N张」前端计算：累加各券 ticketNumber，缺省按 1 计
  const total = list.reduce((sum, info) => sum + (info.ticketNumber ?? 1), 0)
  return {
    kind: 'receive',
    key: `receive-${c.id ?? c.code}`,
    id: c.id,
    receive: {
      list,
      total,
      isGet: local.isGet,
      invalidated: local.invalidated,
    },
  }
}

/** 下单券卡映射（未知 couponCategory 兜底走此分支，保持既有行为） */
const mapOrderCard = (c: HomepageCouponCard): OrderCard => {
  const info = c.couponInfo || {}
  const discount = DISCOUNT_RELIEF_FORMS.includes(Number(info.reliefForm))
  return {
    kind: 'order',
    key: `order-${c.couponBaseCode ?? info.code}`,
    couponBaseCode: c.couponBaseCode,
    amount: discount ? undefined : (info.amount ?? c.amount),
    discount: discount && info.discountRate != null ? formateDiscount(Number(info.discountRate)) : undefined,
    displayType: formatCouponType(info.reliefForm ?? ''),
    desc: info.couponDesc || c.couponDesc || '',
    count: c.couponCount || 1,
    validEnd: c.validEnd,
  }
}

/** 单卡映射调度：按券种分发到各类型映射器 */
const mapCard = (c: HomepageCouponCard, localStatus: Record<number, ReceiveLocalStatus>): CouponCard | null => {
  if (c.couponCategory === CouponCategoryEnum.Free) return mapFreeCard(c)
  if (c.couponCategory === CouponCategoryEnum.Receive) return mapReceiveCard(c, localStatus)
  return mapOrderCard(c)
}

/**
 * 接口卡片 → 视图模型（纯函数）。排序/合并/截断由后端完成，前端不再处理；
 * 领券卡的领取/失效状态按卡 id 从 localStatus 覆盖（接口无此字段）。
 */
export const mapCouponCards = (
  list: HomepageCouponCard[] | undefined,
  localStatus: Record<number, ReceiveLocalStatus> = {},
): CouponCard[] =>
  (list || [])
    .slice(0, MAX_HOME_COUPON_CARDS)
    .map((c) => mapCard(c, localStatus))
    .filter((card): card is CouponCard => card !== null)

/* 获取券埋点上报type_name */
export const getCardTypeName = (card: CouponCard): string | undefined => {
  if (card.kind === 'free') return card.title
  if (card.kind === 'order') return card.displayType
  if (card.kind === 'receive') {
    const couponItem = card?.receive?.list?.[0]
    return card?.receive?.isGet ? formatCouponType(couponItem?.reliefForm ?? '') : '领券'
  }
  return undefined
}
