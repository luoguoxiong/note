/**
 * pc-web 旧基座 common 模块 (Pinia 版)
 * 来源: netc-pc-web/src/store/modules/common.js (namespaced: 'common')
 *
 * 使用场景(标注):
 *  - 【数据字典】serviceWayDict 服务方式 /
 *    feedbackQtTypeDict 回单图片反馈原因 / goodsTypeDict 托寄物类型 / payWayOptions 付款方式下拉
 *    —— 下单页、运单详情、回单反馈等字典下拉
 *  - 【静态字典】defaultServiceWayDict / defaultGoodsTypeDict —— 接口异常时的兜底字典
 *  - 【静态选项】wrapOptions 包装服务 / receiptOptions 回单类型 —— 下单页固定选项
 *  - 【实名认证】realNameAuthReturnRoute 实名认证完成后的返回路由 —— 实名流程跳转
 *  - 【下载中心】downloadCenter.taskIdList 导出任务ID集合 / needUpdate 是否需要刷新列表
 *    —— 导出任务轮询、下载中心红点
 *
 * 【2026-09 删除】疑似弃用成员: gobiServiceWayDict/setGobiServiceDict/setGobiServiceWayDictAction(旧版 bug,
 * action 从未写入该字段)、mapAddressAnalysisTipsTraceId/setMapAddressAnalysisTipsTraceId、
 * pagePreloadTime/setPagePreloadTime(下单配置页预加载耗时埋点, 轻应用已迁移)
 *
 * 【2026-09 恢复】clientUpdateIng/setClientUpdateIng: header/new-client(新版客户端顶栏)迁移后产生消费方
 * (update.vue 写入 / update-tab.vue 读取, 旧基座经 root getter getClientUpdateIng 中转)
 */
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { queryDataDictionary } from './deps/api'

type AnyRecord = Record<string, any>

interface DictItem {
  value: string
  label: string
}

export const usePcWebCommonStore = defineStore('pcWebCommon', () => {
  const defaultServiceWayDict: DictItem[] = [
    { value: '10', label: '当天达' },
    { value: '20', label: '次日达' },
    { value: '30', label: '隔日达' },
    { value: '40', label: '陆运件' },
    { value: '50', label: '同城次日' },
    { value: '70', label: '同城即日' },
    { value: '160', label: '省内次日' },
    { value: '170', label: '省内即日' },
  ]

  const defaultGoodsTypeDict: DictItem[] = [
    { value: '1', label: '当天达' },
    { value: '2', label: '易碎' },
    { value: '3', label: '危险品' },
    { value: '4', label: '贵重物品' },
    { value: '5', label: '异形、不规则货物类' },
    { value: '6', label: '液体' },
    { value: '7', label: '气体' },
    { value: '8', label: '常规' },
    { value: '9', label: '含锂电池' },
    { value: '10', label: '含磁性' },
    { value: '11', label: '粉末' },
    { value: '12', label: '膏状' },
    { value: '13', label: '含电池' },
  ]

  // ==================== state (旧 common.js state) ====================
  const serviceWayDict = ref<DictItem[]>([]) // 服务方式数据字典
  const feedbackQtTypeDict = ref<DictItem[]>([]) // 回单反馈原因字典
  const payWayOptions = ref<AnyRecord[]>([]) // 付款方式下拉选项
  const wrapOptions = ref<AnyRecord[]>([
    // 包装服务
    { value: ' ', label: '无需包装' },
    { value: '10', label: '帮我打卡板' },
    { value: '20', label: '帮我打木架' },
    { value: '30', label: '帮我打木箱' },
  ])
  const receiptOptions = ref<AnyRecord[]>([
    // 回单类型
    { value: '20', label: '无需回单' },
    { value: '10', label: '回单原件' },
    { value: '30', label: '回单照片' },
    { value: '40', label: '电子回单' },
  ])
  const goodsTypeDict = ref<DictItem[]>([]) // 托寄物类型
  const realNameAuthReturnRoute = ref<AnyRecord | null>(null)
  const clientUpdateIng = ref(false) // 客户端更新中(new-client update.vue 写入 / update-tab.vue 读取)
  const downloadCenter = reactive<{ taskIdList: (string | number)[]; needUpdate: boolean }>({
    taskIdList: [],
    needUpdate: false,
  })

  // ==================== mutations (旧 common.js mutations) ====================

  function setserviceWayDict(dict: DictItem[]) {
    serviceWayDict.value = dict
  }
  function setFeedbackQtTypeDict(dict: DictItem[]) {
    feedbackQtTypeDict.value = dict
  }
  function setPayWayOptions(list: AnyRecord[]) {
    payWayOptions.value = list
  }
  function setGoodsTypeDict(list: DictItem[]) {
    goodsTypeDict.value = list
  }
  function setRealNameAuthReturnRoute(route: AnyRecord | null) {
    realNameAuthReturnRoute.value = route
  }
  function setDownloadCenterNeedUpdate(value: boolean) {
    downloadCenter.needUpdate = value
  }
  function setDownloadCenterTaskIdList(value: (string | number)[]) {
    downloadCenter.taskIdList = value
  }
  /** 客户端更新中标识(旧 common/setClientUpdateIng) */
  function setClientUpdateIng(value: boolean) {
    clientUpdateIng.value = value
  }

  // ==================== actions (旧 common.js actions) ====================

  /** 【字典】拉取服务方式字典(接口异常时兜底 defaultServiceWayDict) */
  async function setServiceWayDictAction() {
    if (serviceWayDict.value?.length > 0) {
      return
    }
    const res = await queryDataDictionary('common_service_type')
    if (res.code === 0 && res.data?.length > 0) {
      const dict = res.data.map((m: AnyRecord) => ({ value: m.lookupCode, label: m.lookupValue }))
      setserviceWayDict(dict)
    } else if (res.code !== 0) {
      serviceWayDict.value = defaultServiceWayDict
    }
  }

  /** 【字典】获取回单图片反馈类型字典(回单反馈弹窗) */
  async function setFeedbackQtTypeDictAction() {
    if (feedbackQtTypeDict.value?.length > 0) {
      return
    }
    const res = await queryDataDictionary('tms_recipt_img_error')
    if (res.code === 0 && res.data?.length > 0) {
      const dict = res.data.map((m: AnyRecord) => ({ value: m.lookupCode, label: m.lookupValue }))
      setFeedbackQtTypeDict(dict)
    }
  }

  /** 【字典】获取付款方式下拉(优先字典 eam_pay_type, 异常时用内置三项) */
  async function setPayWayOptionsAction() {
    if (payWayOptions.value && payWayOptions.value.length > 0) {
      return
    }
    let options: AnyRecord[] = [
      {
        label: '寄方付',
        value: '10',
        tips: '货物交于跨越小哥后，下单人可通过线上支付、扫收款码支付、月结账户支付等方式付款',
      },
      {
        label: '收方付',
        value: '20',
        tips: '货物派送签收时，收件人可通过线上支付、扫收款码、月结账户支付等方式付款',
      },
      {
        label: '第三方付',
        value: '30',
        tips: '货物派送签收后，费用由第三方付款公司进行支付',
      },
    ]
    try {
      const res = await queryDataDictionary('eam_pay_type')
      if (res.code === 0 && res.data && res.data.length > 0) {
        options = res.data.map((d: AnyRecord) => ({
          label: d.lookupValue,
          value: d.lookupCode,
          tips: d.promptMessage,
        }))
      }
    } finally {
      setPayWayOptions(options)
    }
  }

  /** 【字典】拉取托寄物类型字典(接口异常时兜底 defaultGoodsTypeDict) */
  async function setGoodsTypeDictAction() {
    if (goodsTypeDict.value?.length > 0) {
      return
    }
    const res = await queryDataDictionary('tms_goods_type_nature')
    if (res.code === 0 && res.data?.length > 0) {
      const dict = res.data.map((m: AnyRecord) => ({ value: m.lookupCode, label: m.lookupValue }))
      setGoodsTypeDict(dict)
    } else if (res.code !== 0) {
      goodsTypeDict.value = defaultGoodsTypeDict
    }
  }

  return {
    // state
    defaultServiceWayDict,
    defaultGoodsTypeDict,
    serviceWayDict,
    feedbackQtTypeDict,
    payWayOptions,
    wrapOptions,
    receiptOptions,
    goodsTypeDict,
    realNameAuthReturnRoute,
    downloadCenter,
    clientUpdateIng,
    // mutations
    setserviceWayDict,
    setFeedbackQtTypeDict,
    setPayWayOptions,
    setGoodsTypeDict,
    setRealNameAuthReturnRoute,
    setDownloadCenterNeedUpdate,
    setDownloadCenterTaskIdList,
    setClientUpdateIng,
    // actions
    setServiceWayDictAction,
    setFeedbackQtTypeDictAction,
    setPayWayOptionsAction,
    setGoodsTypeDictAction,
  }
})
