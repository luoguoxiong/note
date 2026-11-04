import { report_EXP_event, report_other_event } from '@/public/utils/reportUtil'
import Taro from '@tarojs/taro'
import { uuid } from '@/public/utils'

import {
  addDetailPerformance,
  getPerformanceNow,
  initPagePerformance,
  wxPerformanceGetEntriesByTypeApi,
} from './performenceReport'
import { is_sign_in_h5 } from './signUtils'
import { getQueryObject } from '@/public/utils'

// 面对面签到事件
const SignReportEventMap = {
  面签小程序扫码落地曝光: 'page_logon_transfer_v1',
  '面对面签到-小程序码落地页': 'other_sign_in_face_to_face_scan',
  '面对面签到-入口扫码签到页': 'other_sign_in_face_to_face_qr_scan',
}

const getLoginErrorMessage = (err) => {
  if (err && (err.msg || err.message || err.errMsg)) {
    return `${err.code ? 'code:' + err.code : ''} msg: ${err.msg || err.message || err.errMsg}`
  }
  return err ? (err.toString().indexOf('Error') !== -1 ? err.toString() : JSON.stringify(err)) : ''
}
let signWorkId = null

export const useSignInReport = () => {
  // hooks语法写入数据存在延迟,此处不适用
  // const [signWorkId, setSignWorkId] = useState(null)
  // 生成面对面work_id(链路：小程序 > h5 url)
  const reportSignWorkIdInit = () => {
    signWorkId = uuid()
  }
  // 获取面对面签到work_id
  const reportWorkIdGet = () => {
    return signWorkId
  }

  // 获取签到页work_id qt标准格式
  const getWorkIdMapStr = (id) => {
    return JSON.stringify({ signInWorkId: id || reportWorkIdGet() })
  }

  // 面签页面didShow埋点页面初始化
  const reportSignInPageInit = (params = {}) => {
    // 生产面签页workId
    reportSignWorkIdInit()
    reportEventSignInPage({
      type: 'initial',
      request_result: '面对面-扫码成功-进入小程序',
      time_node: '面对面签到-小程序码落地页-useDidShow',
      ...params,
    })
    addDetailPerformance('面对面签到-小程序码落地页-useDidShow')
    // 面签页面曝光
    report_EXP_event(SignReportEventMap['面签小程序扫码落地曝光'])
  }
  /* 面签上报公共参数*/
  const reportCommonParams = ({ work_id } = {}) => {
    try {
      const performanceNow = Math.floor(getPerformanceNow())
      const entryNavigations = wxPerformanceGetEntriesByTypeApi('navigation') || []
      const entryNavigationsFirst = (entryNavigations && entryNavigations[0]) || {}
      // 用户埋点数据
      const { open_id, userid, mobile_number } = Taro.getApp().aplusUserData || {}
      return {
        performanceNow: performanceNow,
        performanceDiff: performanceNow - entryNavigationsFirst.startTime,
        navigationFirst: { ...entryNavigationsFirst },
        work_id: getWorkIdMapStr(work_id),
        // 用户埋点信息
        employee_number: mobile_number,
        userid,
        open_id,
      }
    } catch (e) {
      console.log(e)
    }
  }
  /* 小程序码落地页 - 自定义事件上报 */
  const reportEventSignInPage = (params) => {
    try {
      const paramsResult = {
        page_code: SignReportEventMap['面签小程序扫码落地曝光'],
        ...params,
        ...reportCommonParams({ work_id: signWorkId }),
      }
      report_other_event(SignReportEventMap['面对面签到-小程序码落地页'], paramsResult)
      console.log('paramsResult', paramsResult)
    } catch (e) {
      console.log(e)
    }
  }
  /**
   *  面对面签到入口 - 自定义事件上报
   * @param params
   * @param workId
   */
  const reportEventEntryPage = (params, workId) => {
    try {
      const paramsResult = {
        ...params,
        ...reportCommonParams({ work_id: workId || reportWorkIdGet() }),
      }
      report_other_event(SignReportEventMap['面对面签到-入口扫码签到页'], paramsResult)
      console.log('paramsResult', paramsResult)
    } catch (e) {
      console.log(e)
    }
  }
  /* 小程序码落地页自定义事件上报 - 调用接口后 */
  const reportEventSignInPageApiAfter = (params = {}, err) => {
    const reportParams = {
      type: 'api-after',
      ...params,
    }
    // 存在失败原因
    if (err) {
      reportParams['err_msg'] = getLoginErrorMessage(err)
    }
    return reportEventSignInPage(reportParams)
  }
  const reportSignInApplicationCLKEvent = (item) => {
    // 面对面签到入口
    if (item && item.menuCode === 'M2047') {
      // 重新生成面签work-id
      reportSignWorkIdInit()
      reportEventEntryPage({
        name: '面对面签到-常用功能-点击入口',
        entry: 'page_home_mine',
        button_name: item.menuName,
        page_name: 'page_home_mine',
      })
      // work_id写入应用信息
      item['_work_id'] = signWorkId
    }
  }
  /**
   * 面对面签到openWebview, 手动上报
   * @param url
   * @param work_id
   */
  const reportSignInApplicationOpenWebviewShow = (url, work_id) => {
    try {
      // 不存在work_id,代表来源非寄件小程序，来自(跨声-分享,企微分享)
      if (!work_id) {
        reportSignWorkIdInit()
      }
      if (url && is_sign_in_h5(url)) {
        const { sourceFrom } = getQueryObject(decodeURIComponent(url))
        const source_from = sourceFrom ? sourceFrom : work_id ? 'page_home_mine' : '跨声分享|企微分享'
        reportEventEntryPage(
          {
            name: '面对面签到-二维码扫码页',
            source_from: source_from,
            source_action: work_id ? 'page_home_button' : 'other',
          },
          work_id,
        )

        addDetailPerformance('面对面签到-签到页-useDidShow')
        setTimeout(() => {
          initPagePerformance()
        }, 100)
      }
    } catch (e) {
      console.log(e)
    }
  }

  // 网络埋点
  const networkReport = async () => {
    try {
      const res = await Taro.getNetworkType()
      const paramsResult = { networkType: res.networkType }
      report_other_event('sign_webview_netework', paramsResult)
      console.log('paramsResult', paramsResult)
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取到轻应用链接时上报
   * @param url
   */
  const getLinkReport = (url) => {
    try {
      const paramsResult = { src: url }
      report_other_event('sign_webview_getlink', paramsResult)
      console.log('paramsResult', paramsResult)
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * webview 加载超时上报
   * @param time
   */
  const webviewTimeoutReport = (time) => {
    try {
      const paramsResult = { time }
      report_other_event('sign_webview_timeout', paramsResult)
      console.log('paramsResult', paramsResult)
    } catch (e) {
      console.log(e)
    }
  }

  /**
   *
   * @param type 上报类型：sign_webview_success | sign_webview_fail
   * @param url 加载 url
   */
  const webviewLoadLoadReport = (type, url) => {
    try {
      const paramsResult = { src: url }
      report_other_event(type, paramsResult)
      console.log('paramsResult', paramsResult)
    } catch (e) {
      console.log(e)
    }
  }

  return {
    signWorkId,
    reportWorkIdGet,
    getWorkIdMapStr,
    reportSignInPageInit,
    reportSignWorkIdInit,
    reportEventSignInPage,
    reportEventSignInPageApiAfter,
    reportSignInApplicationCLKEvent,
    reportSignInApplicationOpenWebviewShow,
    networkReport,
    getLinkReport,
    webviewTimeoutReport,
    webviewLoadLoadReport,
  }
}
