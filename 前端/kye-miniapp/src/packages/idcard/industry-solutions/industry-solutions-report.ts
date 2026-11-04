/* eslint-disable no-unreachable */
import {
  ENABLE_TRACKING,
  getCurrentChannel,
  getPlateForm,
  getSourceID,
  handleError,
} from '@/packages/idcard/idcard-report'
import { uuid } from '@/public/utils'
import { report_CLK_event, report_EXP_event } from '@public/utils/reportUtil'

/**
 * 埋点信息
 */
export const trackEvent = (eventName: string, buttonName: string, extraParams = {}) => {
  if (!ENABLE_TRACKING) return

  try {
    report_CLK_event(eventName, {
      button_name: buttonName,
      channel: getCurrentChannel(),
      page_name: 'page_business_card_homepage',
      source_id: getSourceID(),
      x_source_name: getSourceID(),
      platform: getPlateForm(),
      work_id: uuid(),
      ...extraParams,
    })
  } catch (error) {
    handleError(error, '埋点信息错误')
  }
}

export const reportPagePv = (params) => {
  try {
    if (!ENABLE_TRACKING) return
    report_EXP_event('page_scheme_editor_edit', {
      work_id: uuid(),
      source_id: getSourceID(),
      x_source_name: getSourceID(),
      channel: getCurrentChannel(),
      platform: getPlateForm(),
      ...params,
    })
  } catch (error) {
    handleError(error, '行业解决方案曝光埋点错误')
  }
}
