import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import { baseReportInstance } from '@order-public-sub-public/reportUmp'

import { getBatchId, getChannel } from '@order-public-sub-public/configs'
import {
  addDetailPerformance,
  EReportRenderTime,
  initPagePerformance,
} from '@order-public-sub-public/utils/reportConfig'
import { Indexable } from '@order-public-sub-public/reportUmp/type/types'
import { StaticConfig } from '@order-public-sub-public/apis/init/types'
import { isAppiOS } from '@order-public-sub-public/utils/device'
import { onGetExternalLinkQuery } from '@order-public-sub-public/configs/waybillMerge'
import { ref } from 'vue'
import { awaitPageShow } from '@order-public-sub-public/validate/utils'
import { OrderPageType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
// D:\AllProject\kye-miniapp-order\src\public\utils\storage.ts
import { sessionStorage } from '@order-public-sub-public/utils/storage'

let hasReportRenderFinish = false

//预加载页面是否打开的标识
export const orderPreload = ref(false)

export const reportSaveFailResult = (err: any) => {
  const { content, customerRichTips, restrictFlag, message } = err || {}
  const reason = content || customerRichTips || restrictFlag || message
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_single_sub_v1',
      regionCode: 'footer',
    },
    {
      failure_reason: reason,
      result_type: '失败',
      batchId: getBatchId(),
    },
  )
}

//项目初始化的时候判断的
export const addOrderPageToReport = () => {
  try {
    const hash = location.hash || ''
    if (hash?.indexOf('update-goods-time') > -1 || hash.indexOf('address-book') > -1) {
      return
    }
    const pageType = hash?.indexOf('order-batch') > -1 ? OrderPageType.批量寄 : OrderPageType.单票
    baseReportInstance.add('orderPageType', pageType)
  } catch (e) {
    console.error(e)
  }
}

export const initPageReport = () => {
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_single_pageInit_v1',
    },
    {
      batchId: getBatchId(),
    },
  )
  addDetailPerformance(EReportRenderTime.页面初始化全部完成)
}

export const reportSuccess = () => {}

export const initConfigReport = () => {
  baseReportInstance.add('work_id', 'workid_single_order')
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_single_pageIniPre_v1',
    },
    {
      batchId: getBatchId(),
    },
  )
}

export const channelDiffReport = (channel = '') => {
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_channel_diff_v1',
    },
    {
      channel,
    },
  )
}

//获取下单配置缓存的数据无法解析使用上报
export const reportCacheFail = (cache: string | undefined) => {
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_single_cache_fail',
    },
    {
      quickOrderInitConfig: cache,
    },
  )
}

//获取下单配置缓存的数据
export const reportConfigCache = (cacheLength: number | undefined) => {
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_single_cache',
    },
    {
      quickOrderInitConfigLength: cacheLength,
    },
  )
}
//进入页面，缓存数据发生了变更
export const reportConfigChange = () => {
  umpOtherReport('OTHER', {
    eventCode: 'other_express_single_cache_dataChangeFlag',
  })
}

//进入获取缓存场景
export const reportConfigChannel = () => {
  umpOtherReport('OTHER', {
    eventCode: 'other_express_single_cache_channel',
  })
}
//下单过程上报
export const submitProcessReport = (type: string, params?: Indexable<string>) => {
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_single_process_event',
      regionCode: 'footer',
    },
    {
      type,
      ...params,
    },
  )
}

export const reportFail = (params?: Indexable<string>) => {
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'show_empty',
    },

    {
      detail: params,
    },
  )
}

//初始化完成上报性能数据
export const renderFinishEndReport = () => {
  if (hasReportRenderFinish) {
    return
  }
  initPageReport()
  initPagePerformance()
  hasReportRenderFinish = true
  if (isAppiOS) {
    setIosUpdateCustomerCode()
  }
}

let hasShow = false
//页面展示上报，解决预加载带来的初始化节点跟用户真实节点不一致的问题
export const pageShowReport = async () => {
  sessionStorage.removeItem('hasShowRemoteCheckDataHandOut')
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'finished_show',
    },
    {
      hasShow: hasShow,
    },
  )
  if (hasShow) {
    return
  }
  umpOtherReport(
    'EXP',
    {
      eventCode: 'show_page_finished_v1',
    },
    {
      batchId: getBatchId(),
    },
  )
  hasShow = true
}

export const orderMountedReport = (params?: Indexable<string | boolean>) => {
  hasShow = false
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'order_page_mounted',
    },
    {
      result: JSON.stringify(params),
    },
  )
}

export const setCommonVersion = (obj: StaticConfig | undefined) => {
  if (!obj) {
    return
  }
  setTimeout(() => {
    const waybillNumber = piniaStore.root.getCurrentWaybillNumber
    const { versionId = '', configId = '' } = obj
    baseReportInstance.add('config_version', versionId)
    baseReportInstance.add('config_id', configId)
    baseReportInstance.add('channel', getChannel() || '')
    baseReportInstance.add('waybill_number', waybillNumber)
  })
}

export const reportActionsAfterInitConfig = (params: Indexable<string>) => {
  pageShowReport()
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'actions_after_init_config',
    },

    {
      detail: params,
    },
  )
}

export const batchIdReport = (type: 'set' | 'get', params: Indexable<string | boolean | null | undefined>) => {
  const eventCode = type === 'set' ? 'save_batchId_report' : 'get_batchId_report'
  umpOtherReport(
    'OTHER',
    {
      eventCode,
    },
    {
      ...params,
    },
  )
}
//测试版，数据正常后，替换pageShowReport
export const pageShowReportNew = async () => {
  await awaitPageShow()
  umpOtherReport(
    'EXP',
    {
      eventCode: 'show_page_new_test',
    },
    {
      batchId: getBatchId(),
    },
  )
}

const setIosUpdateCustomerCode = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!window.updateCustomerCode) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.updateCustomerCode = function () {
      //只是为了解决apm的报错，和排查，目前只有ios有这个报错
      umpOtherReport('OTHER', {
        eventCode: 'ios_update_CustomerCode',
      })
    }
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!window.Aplus4Native) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.Aplus4Native = function () {
      //只是为了解决apm的报错，和排查，目前只有ios有这个报错
      console.log('1')
    }
  }
  /* eslint-disable */
}

export const pagExpressSingleReport = () => {
  const params = onGetExternalLinkQuery()
  if (params.channel_source && params.scene_source) {
    umpOtherReport(
      'EXP',
      {
        eventCode: 'page_express_single_v1',
      },
      { ...params },
    )
  }
}
