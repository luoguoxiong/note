import Taro from '@tarojs/taro'
import { report_other_event } from '@/public/utils/reportUtil'
import { useSignInReport } from './useSignInReport'

export const WxSceneType = {
  1001: '发现页小程序「最近使用」列表',
  1005: '微信首页顶部搜索框的搜索结果页',
  1035: '公众号自定义菜单',
  1036: 'App 分享消息卡片',
  1037: '小程序打开小程序',
  1038: '另一个小程序返回',
  1047: '扫描小程序码',
  1048: '长按图片识别小程序码',
  1049: '扫描手机相册中选取的小程序码',
  1053: '搜一搜的结果页',
  1082: '公众号会话下发的文字链',
  1096: '聊天记录，打开小程序',
}

let timeDetailList = []
//接口数据收集
let apiList = []

/* 微信原生performance当前时间 */
export const getPerformanceNow = () => {
  return wx && wx.getPerformance && wx.getPerformance().now()
}
/* 微信原生performance getEntries */
export const wxPerformanceGetEntriesByTypeApi = (api) => {
  return wx && wx.getPerformance && wx.getPerformance().getEntriesByType(api)
}

export const addDetailPerformance = (type) => {
  try {
    const time = getPerformanceNow()
    const dateNow = Date.now()
    timeDetailList.push({
      performanceNow: Math.floor(time),
      dateNow: dateNow,
      hook: type,
    })
  } catch (e) {
    console.error(e)
  }
}

//页面性能分析汇总数据
export const initPagePerformance = ({ module_name, report_event, work_id_value, system_info_need } = {}) => {
  try {
    const renderTime = Math.floor(getPerformanceNow())
    const navigatorCurrent = navigator || {}
    const performanceCurrent = (wx && wx.getPerformance()) || performance || {}

    //接口相关数据
    const extend1 = apiList
    //性能整体概况
    const extend2 = {
      memory: performanceCurrent.memory,
      navigation: performanceCurrent.navigation,
    }
    const { mobile_number } = Taro.getApp().aplusUserData || {}
    // 小程序启动参数
    const { scene, path, apiCategory, mode } = wx && wx.getLaunchOptionsSync()
    const miniLaunchInfo = {
      scene,
      sceneDesc: WxSceneType[scene] || '',
      path,
      apiCategory,
      mode,
    }
    const { getWorkIdMapStr } = useSignInReport()

    const normalData = {
      work_id: getWorkIdMapStr(work_id_value),
      employee_number: mobile_number || '',
      net_type: navigatorCurrent.connection && navigatorCurrent.connection.effectiveType,
      device_model: navigatorCurrent.userAgent,
      module_name: module_name || '寄件小程序 - 面对面签到',
      renderTime,
      extend1: JSON.stringify(extend1),
      extend2: JSON.stringify(extend2),
      extend3: filterTimeObj(timeDetailList),
      miniLaunchInfo: miniLaunchInfo,
    }
    if (system_info_need) {
      normalData['systemInfo'] = Taro.getSystemInfoSync()
    }
    console.log('性能埋点数据', normalData)
    report_other_event(report_event || 'ks_sign_in_mini_app_user_render_time', normalData)
    timeDetailList = []
  } catch (e) {
    console.error(e)
  }
}

//将性能时间计算成业务格式，并排序
export const filterTimeObj = (timeList) => {
  console.log('timeList', timeList)
  try {
    const list = timeList.sort((a, b) => {
      return a.performanceNow - b.performanceNow
    })
    //先根据时间线排序
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      const { performanceNow, dateNow } = item
      const preItem = list[i - 1] || {
        performanceNow: 0,
        dateNow: 0,
      }
      item.performanceDuration = performanceNow - preItem.performanceNow
      item.dateDuration = dateNow - preItem.dateNow
    }
    return JSON.stringify(timeList)
  } catch (e) {
    console.error(e)
    return ''
  }
}

export default {}
