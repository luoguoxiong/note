/* eslint-disable no-unreachable */

import {
  ENABLE_TRACKING,
  getCurrentChannel,
  getPlateForm,
  getSafeApp,
  getSourceID,
  handleError,
} from '@/packages/idcard/idcard-report'
import { uuid } from '@/public/utils'
import { report_CLK_event, report_EXP_event } from '@public/utils/reportUtil'
import Taro from '@tarojs/taro'
import type {
  ModuleMapType,
  ReportCardDetailParams,
  ReportEditModeParams,
  ReportPagesParams,
  UserInfo,
} from '../idcard-report/idcard-report_type.js'

/** 模块映射常量 */
export const ModuleMap: ModuleMapType = {
  1: '个人介绍',
  2: '视频号',
  3: '公司简介',
  4: '行业解决方案',
  5: '企业荣誉',
  6: '服务方式',
  7: '自定义模块',
}

/**
 * 上传openid
 */
export const uploadReportOpenid = (): void => {
  if (!ENABLE_TRACKING) return

  try {
    const openId = Taro.getStorageSync('openId')
    // TODO:恢复
    // aPlus({ openid: openId })
  } catch (error) {
    handleError(error, '上传openid')
  }
}

/**
 * 点击事件埋点
 * @param eventName 事件名称
 * @param buttonName 按钮名称
 * @param exParams 额外参数
 */
export const trackEvent = (eventName: string, buttonName: string, extraParams: Record<string, any> = {}): void => {
  if (!ENABLE_TRACKING) return

  try {
    const app = getSafeApp()
    if (!app) return

    report_CLK_event(eventName, {
      button_name: buttonName,
      channel: getCurrentChannel(),
      page_name: 'page_business_card_homepage',
      work_id: uuid(),
      source_id: getSourceID(),
      x_source_name: getSourceID(),
      platform: getPlateForm(),

      ...extraParams,
    })
  } catch (error) {
    handleError(error, '点击事件埋点')
  }
}

/**
 * 页面曝光埋点
 * @param params 曝光参数
 */
export const reportPagesFn = ({ isSales, isEdit }: ReportPagesParams, parmas?: {}): void => {
  if (!ENABLE_TRACKING) return

  try {
    const app = getSafeApp()
    if (!app) return

    const pageCode = isSales ? `page_business_card_${isEdit ? 'edit' : 'preview'}` : 'page_business_card_homepage'

    report_EXP_event(pageCode, {
      channel: getCurrentChannel(),
      work_id: uuid(),
      source_id: getSourceID(),
      x_source_name: getSourceID(),
      platform: getPlateForm(),

      ...parmas,
    })
  } catch (error) {
    handleError(error, '页面曝光埋点')
  }
}

/**
 * 卡片详情上报
 * @param type 上报类型
 * @param params 额外参数
 * @param isSales 是否销售
 */
export const reportCardDetail = (type: string, params: ReportCardDetailParams = {}, isSales?: boolean): void => {
  if (!ENABLE_TRACKING) return

  try {
    const app = getSafeApp()
    if (!app) return

    const userInfo = Taro.getStorageSync<UserInfo>('USER_INFO')
    const version = Taro.getApp()?.globalData?.shellVersion || ''
    const phone = userInfo?.phone || ''

    const trackingParams: Record<string, any> = {
      app_version: version,
      phone,
      work_id: uuid(),
      source_id: getSourceID(),
      x_source_name: getSourceID(),
      platform: getPlateForm(),

      ...(isSales !== undefined && { is_sale: isSales }),
      ...params,
    }

    report_EXP_event('', {
      ...trackingParams,
    })
  } catch (error) {
    handleError(error, '卡片详情上报')
  }
}

/**
 * 编辑模式点击事件埋点
 * @param params 编辑模式参数
 */
export const reportEditModeRecord = ({ info }: ReportEditModeParams): void => {
  if (!ENABLE_TRACKING) return

  try {
    const app = getSafeApp()
    if (!app) return

    report_CLK_event('clk_business_card_preview_edit', {
      button_name: '编辑',
      channel: getCurrentChannel(),
      page_name: 'page_business_card_preview',
      employee_id: info.baseInfo.hrUserId,
      sales_id: info.baseInfo.hrUserId,
      work_id: uuid(),
      source_id: getSourceID(),
      x_source_name: getSourceID(),
      platform: getPlateForm(),
    })
  } catch (error) {
    handleError(error, '编辑模式点击埋点')
  }
}

/**
 * 编辑模式曝光埋点
 */
export const reportEditMode = (): void => {
  if (!ENABLE_TRACKING) return

  try {
    const app = getSafeApp()
    if (!app) return

    report_EXP_event('page_business_card_edit', {
      x_source_name: getSourceID(),
    })
  } catch (error) {
    handleError(error, '编辑模式曝光埋点')
  }
}

/**
 * 访客数据-页面曝光事件
 */
export const reportVisitorData = (salesId: string | undefined): void => {
  if (!ENABLE_TRACKING) return

  try {
    const app = getSafeApp()
    if (!app) return

    report_EXP_event('page_business_card_data', {
      sales_id: salesId,
      x_source_name: getSourceID(),
    })
  } catch (error) {
    handleError(error, '访客数据-页面曝光事件')
  }
}
