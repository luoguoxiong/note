import { reportWechatMsgReadApi } from '../apis/report/index'
import { report_other_event } from '../utils/reportUtil'
import { getQueryObject } from '../utils'

/**
 * 公众号消息已读上报
 */
export function reportWechatMsgRead(query) {
  console.log('reportWechatMsgRead', query)
  const { mid } = query || {}
  if (mid) {
    report_other_event('other_homepage_message_read', {
      region_code: 'message_read',
      region_name: '消息已读状态上报',
      page_code: 'page_homepage_v1',
      page_name: '移动端新版首页',
      event_code: 'other_homepage_message_read',
      event_name: '访问小程序的所有消息，已读状态上报',
      message_identifier: mid,
    })
    reportWechatMsgReadApi({
      msgId: mid,
    })
  }
}

/**
 * 公众号意图、短信短链接已读上报埋点
 */
export function reportMsgReadMD(query) {
  console.log('访问小程序的所有消息，已读状态上报', query)
  const { mi, h5Link } = query || {}
  console.log(h5Link, 'hhhh')
  if (mi) {
    report_other_event('other_homepage_message_read', {
      region_code: 'message_read',
      region_name: '消息已读状态上报',
      page_code: 'page_homepage_v1',
      page_name: '移动端新版首页',
      event_code: 'other_homepage_message_read',
      event_name: '访问小程序的所有消息，已读状态上报',
      message_identifier: mi,
    })
  } else if (h5Link) {
    const originalUrl = decodeURIComponent(h5Link)
    const { mi } = getQueryObject(originalUrl)
    console.log(mi, 'mi')
    if (mi) {
      report_other_event('other_homepage_message_read', {
        region_code: 'message_read',
        region_name: '消息已读状态上报',
        page_code: 'page_homepage_v1',
        page_name: '移动端新版首页',
        event_code: 'other_homepage_message_read',
        event_name: '访问小程序的所有消息，已读状态上报',
        message_identifier: mi,
      })
    }
  }
}
