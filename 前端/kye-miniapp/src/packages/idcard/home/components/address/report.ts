import {
  ENABLE_TRACKING,
  getCurrentChannel,
  getPlateForm,
  getSafeApp,
  getSourceID,
  handleError,
} from '@/packages/idcard/idcard-report'
import { uuid } from '@/public/utils'
import { report_CLK_event } from '@public/utils/reportUtil'

/**
 * 埋点信息
 */
export const trackEvent = (eventName: string, buttonName: string, extraParams = {}) => {
  if (!ENABLE_TRACKING) return
  try {
    const app = getSafeApp()
    if (!app) return

    // app.aplus_queue.push({
    //   action: 'aplus.record',
    //   arguments: [
    //     eventName,
    //     'CLK',
    //     {
    //       button_name: buttonName,
    //       channel: getCurrentChannel(),
    //       page_name: 'page_business_card_homepage',
    //       ...extraParams,
    //     },
    //   ],
    // })

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
    handleError(error, '地址点击')
  }
}
