import {
  ENABLE_TRACKING,
  getCurrentChannel,
  getPlateForm,
  getSafeApp,
  getSourceID,
  handleError,
} from '@/packages/idcard/idcard-report'
import type { AplusInstance, AplusQueueItem } from '@/packages/idcard/idcard-report/idcard-report_type'
import { uuid } from '@/public/utils'

/**
 * 埋点事件跟踪
 * @param eventName 事件名称
 * @param buttonName 按钮名称
 * @param extraParams 额外参数 (可选)
 */
export const trackEvent = (eventName: string, buttonName: string, extraParams: Record<string, any> = {}): void => {
  // 如果未开启埋点功能，直接返回
  if (!ENABLE_TRACKING) return

  try {
    // 安全获取应用实例
    const app = getSafeApp() as AplusInstance | null
    if (!app) return

    // 构造埋点数据并加入队列
    const trackingData: AplusQueueItem = {
      action: 'aplus.record',
      arguments: [
        eventName,
        'CLK', // 事件类型：点击
        {
          button_name: buttonName, // 按钮名称
          channel: getCurrentChannel(), // 当前渠道(微信/企微)
          page_name: 'page_sharing_information_edit', // 页面名称
          source_id: getSourceID(),
          x_source_name: getSourceID(),
          work_id: uuid(),
          platform: getPlateForm(),

          ...extraParams, // 合并额外参数
        },
      ],
    }

    app.aplus_queue.push(trackingData)
  } catch (error) {
    // 统一错误处理
    handleError(error, '编辑模式埋点报错')
  }
}

export const trackEventExp = (eventName: string, extraParams: Record<string, any> = {}): void => {
  // 如果未开启埋点功能，直接返回
  if (!ENABLE_TRACKING) return

  try {
    // 安全获取应用实例
    const app = getSafeApp() as AplusInstance | null
    if (!app) return

    // 构造埋点数据并加入队列
    const trackingData: AplusQueueItem = {
      action: 'aplus.record',
      arguments: [
        eventName,
        'EXP', // 事件类型：点击
        {
          channel: getCurrentChannel(), // 当前渠道(微信/企微)
          page_name: 'page_sharing_information_edit', // 页面名称
          source_id: getSourceID(),
          x_source_name: getSourceID(),
          work_id: uuid(),
          platform: getPlateForm(),

          ...extraParams, // 合并额外参数
        },
      ],
    }

    app.aplus_queue.push(trackingData)
  } catch (error) {
    // 统一错误处理
    handleError(error, '编辑模式埋点报错')
  }
}

/**
 * 编辑模式页面PV埋点
 */
export const editModeReportPv = (extraParams): void => {
  if (!ENABLE_TRACKING) return

  try {
    // 安全获取应用实例
    const app = getSafeApp() as AplusInstance | null
    if (!app) return

    // 构造PV埋点数据
    const pvData: AplusQueueItem = {
      action: 'aplus.sendPV',
      arguments: [
        { is_auto: false }, // 非自动上报
        {
          page_name: 'page_sharing_information_edit', // 页面名称
          work_id: uuid(),
          source_id: getSourceID(),
          x_source_name: getSourceID(),
          platform: getPlateForm(),

          ...extraParams, // 合并额外参数
        },
      ],
    }

    app.aplus_queue.push(pvData)
  } catch (error) {
    // 统一错误处理
    handleError(error, '编辑模式PV埋点报错')
  }
}

export const reportAddress = (eventName: string, extraParams): void => {
  if (!ENABLE_TRACKING) return
  try {
    // 安全获取应用实例
    const app = getSafeApp() as AplusInstance | null
    if (!app) return

    const trackingData: AplusQueueItem = {
      action: 'aplus.record',
      arguments: [
        eventName,
        'OTHER',
        {
          channel: getCurrentChannel(), // 当前渠道(微信/企微)
          page_name: 'page_sharing_information_edit', // 页面名称
          source_id: getSourceID(),
          x_source_name: getSourceID(),
          work_id: uuid(),
          platform: getPlateForm(),

          ...extraParams, // 合并额外参数
        },
      ],
    }

    app.aplus_queue.push(trackingData)
  } catch (error) {
    // 统一错误处理
    handleError(error, '分享信息_编辑页_公司地址_确定提交埋点报错')
  }
}
