/**
 * ky-message-popup 内部类型定义
 *
 * 弹窗 DTO / 按钮类型直接复用 @/apis/home/types 的 AdvertisementPopupDto / AdvertisementButton，
 * 这里只定义组件内部运行态使用的辅助类型。
 */
import type { AdvertisementButton, AdvertisementPopupDto, BannerDetailItem } from '@/apis/home/types'

/** 弹窗运行态 model：showDialog 入参 = BannerDetailItem，子组件主要用 advertisementPopupDto + advertisementCode + pushToStyle */
export interface PopupShowModel {
  advertisementCode: string
  pushToStyle?: number
  advertisementPopupDto: AdvertisementPopupDto | null
  advertisementBannerDto?: BannerDetailItem['advertisementBannerDto']
  advertisementFloatDto?: BannerDetailItem['advertisementFloatDto']
  advertisementTitle?: string
}

/** 上报用户操作的运行参数 */
export interface ReportUserActionParams {
  advertisementCode: string
  eventType: number
  buttonIndex?: number
  noLongerRemindFlag: number
}

/** handleSubmit 的运行态按钮（带 buttonText 以便上报） */
export type PopupActionButton = AdvertisementButton & { buttonText?: string }

/** 弹窗分类（与后端 areaStyleCode 对应） */
export const AREA_STYLE_CODE = {
  /** 纯图活动弹窗 */
  ACTIVITY: 'PC_POPUP_004',
  /** 图文弹窗 */
  TEXT_IMAGE_005: 'PC_POPUP_005',
  TEXT_IMAGE_006: 'PC_POPUP_006',
  /** 调价通知图文弹窗（本次不实现 AdjustPriceNotice，仍走图文弹窗兜底） */
  TEXT_IMAGE_MODIFY_PRICE: 'PC_POPUP_MODIFY_PRICE_006',
} as const

/** 判断 areaStyleCode 是否为纯图弹窗 */
export function isActivityStyle(code: string): boolean {
  return code === AREA_STYLE_CODE.ACTIVITY
}

/** 判断 areaStyleCode 是否为图文弹窗 */
export function isTextImageStyle(code: string): boolean {
  return (
    code === AREA_STYLE_CODE.TEXT_IMAGE_005 ||
    code === AREA_STYLE_CODE.TEXT_IMAGE_006 ||
    code === AREA_STYLE_CODE.TEXT_IMAGE_MODIFY_PRICE
  )
}
