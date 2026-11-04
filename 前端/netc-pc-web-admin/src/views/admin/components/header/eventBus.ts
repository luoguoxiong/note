/**
 * header 共享事件总线
 * 来源: netc-pc-web/src/utils/eventemitter (EE) + $bus
 * 新项目使用 eventemitter3
 */
import EE from 'eventemitter3'

const eventBus = new EE()

export const EE_EVENT = {
  /** 打开消息中心 (旧: ACTION_PAGE_LISTS['打开消息中心']) */
  OPEN_MESSAGE_CENTER: '打开消息中心',
  /** 刷新公告跑马灯 (旧: $bus.emit('refresh-notice')) */
  REFRESH_NOTICE: 'refresh-notice',
  /** 运单审核页签切换 (旧: $bus.emit('review-tab-toggle')) */
  REVIEW_TAB_TOGGLE: 'review-tab-toggle',
  /** 打开客户端设置-版本更新页签 (旧: $bus.emit('waybillV3OpenSetting'), new-client 监听) */
  WAYBILL_V3_OPEN_SETTING: 'waybillV3OpenSetting',
  /** 下载中心打包动效完成过渡隐藏 (旧: $bus.emit('setDownloadCenterAnimationFade')) */
  SET_DOWNLOAD_CENTER_ANIMATION_FADE: 'setDownloadCenterAnimationFade',
  /** 下载中心接口异常中断 (旧: $bus.emit('downloadInterfaceErrorInterrupt')) */
  DOWNLOAD_INTERFACE_ERROR_INTERRUPT: 'downloadInterfaceErrorInterrupt',
  /** 打开下载中心抽屉 (旧: $bus.emit('openDownloadDrawer'), 下载气泡/悬浮球触发) */
  OPEN_DOWNLOAD_DRAWER: 'openDownloadDrawer',
  /** iframe 页签自定义标题 (旧: $bus.emit('selfTabName'), h5-popup 触发) */
  SELF_TAB_NAME: 'selfTabName',
} as const

export default eventBus
