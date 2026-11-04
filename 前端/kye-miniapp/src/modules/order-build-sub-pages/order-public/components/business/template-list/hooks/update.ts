import { computed, nextTick, ref } from 'vue'
import { useTabCache } from '@order-public-sub-public/components/business/template-list/hooks/useTabCache'
import { getQueryObject } from '@order-public-sub-public/utils'
import { reportDialogResult } from '@order-public-sub-public/apis'
import { clearAllErrClass, closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import {
  handleGetTemplateList,
  templateList,
  templateRecommendPop,
  useRefresh,
} from '@order-public-sub-root-pages/order-single/hooks/useInit'
import { Channel, LOCAL, OrderPageType } from '@order-public-sub-public/constants'
import {
  getTemplateId,
  loadingToastOptions,
  setTemplateId,
} from '@order-public-sub-root-pages/order-single/hooks/template'
import { getChannel, getOrderConfigUrl, saveNeedBindCustomerCode } from '@order-public-sub-public/configs'
import { resetWaybillInfo } from '@order-public-sub-public/utils/waybillInfo'
import { TemplateDataDB } from '@order-public-sub-public/utils/db/instance/template'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { cancelApi } from '@order-public-sub-public/utils/cancel'
import { ITemplate } from '@order-public-sub-public/types'

import { closeToast, showLoadingToast } from '@order-public-sub-public/hooks/useShowToast'
import { clearReturnWaybill } from '../../return-waybill/hooks/useModuleStore'
import { getDefaultSelect } from '../../estimated-cost/hooks/useExpose'
import { resetOverLengthAndWeightFee } from '../../product-info/hooks/useOverLengthAndWeigth'
import { clearFeeData } from '@order-public-sub-public/components/business/estimated-cost/hooks/singleFeePolling'
import { sleep } from '@order-public-sub-public/utils/sleep'
import { getToken } from '@public/storage/user'
import { getEnvConfig } from '@/public/config'
import { clk_sendtemplate_itc } from './report'
import { awaitPageShow } from '@order-public-sub-public/validate/utils'
import { isDesktopMiniprogram } from '@order-public-sub-public/utils/native'
import { localStorage } from '@order-public-sub-public/utils/storage'
import Taro from '@tarojs/taro'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const orderPageType = computed(() => piniaStore.root.getOrderPageType)
const { clearErrorClassObj } = globalUseValidate()

export const channelList = [Channel.快速寄件, Channel.扫二维码下单, Channel.退出活动]

export const defaultBaseUrl = ref<string>('')
export const templateUrl = ref('')
export const scrollLeft = ref(0)
export const isPcMiniprogram = computed(() => {
  return isDesktopMiniprogram()
})
const { setTabCacheData, getTabCacheData, updateOrderByTabCache, clearTabCacheData } = useTabCache()
const router = useRouter()

// 模板列表是否可见
export const visible = computed(() => {
  return templateList.value?.length && channelList.includes(getChannel()) && orderPageType.value === OrderPageType.单票
})

// 监听visible的回调
export const isInit = ref(true)
export const onVisibilityChange = async (id) => {
  const templateId = id?.toString()
  setTemplateId(id)
  clearTabCacheData()
  let hasRefreshList = false
  if (document.visibilityState === 'visible' && templateId) {
    isInit.value = false
    // 删除操作，数据格式：delete_id
    if (templateId.includes('delete')) {
      const id = +templateId?.split('_')?.[1]
      let _item = { templateId: getTemplateId() } as ITemplate
      // 删除的是当前选中模板ID,清空名称和当前选中模板
      if (id === getTemplateId()) {
        _item = { templateId: null } as ITemplate
        isInit.value = true
      }
      handleToViewport(_item)
      hasRefreshList = true
      removeTemplateId()
      return
    }
    const item = { templateId: +templateId } as ITemplate
    const newUrl = getOrderConfigUrl({ ...getQueryObject(), templateId: +templateId })
    location.replace(newUrl)
    handleToViewport(item)
    removeTemplateId()
  }
  //临时处理列表返回刷新模版列表
  if (document.visibilityState === 'visible' && !hasRefreshList) {
    handleGetTemplateList()
    if (!templateId) {
      isInit.value = false
    }
  }
  hasRefreshList = false
}

export const removeTemplateId = () => {
  localStorage.removeItem(LOCAL.TEMPLATE_ID_FROM_DEFAULT_CONFIG)
  TemplateDataDB.removeItem(LOCAL.TEMPLATE_ID_FROM_DEFAULT_CONFIG)
}

//清除已存在的运单及初始化数据
const clearInitData = () => {
  cancelApi()
  // 每次选中都需要调用接口，防止新增和删除未同步
  handleGetTemplateList()
  // 清空超长超重费用提示
  resetOverLengthAndWeightFee()
}

export const handleScroll = () => {
  setTimeout(() => {
    // 可视窗口内才滚动
    const _templateId = getTemplateId() || -1
    const query = Taro.createSelectorQuery()
    query.select('.template-list').boundingClientRect()
    query.select('.template-item-' + _templateId).boundingClientRect()
    query.exec((res) => {
      if (res && res[0] && res[1]) {
        const container = res[0] // scroll-view容器信息
        const target = res[1] // 目标元素信息
        const left = target.left - container.width / 2 + target.width / 2
        scrollLeft.value = left
      }
    })
  }, 100)
}

export const handleToViewport = async (item: ITemplate) => {
  saveNeedBindCustomerCode(false)

  if (orderPageType.value === OrderPageType.返程单) {
    return
  }
  // 测试和产品意见不一致，以产品为准，有值不管是否一致，都切换
  setTemplateId(item.templateId)
  const channel = getChannel()
  clearInitData()
  await sleep(0)
  clearErrorClassObj()
  if (getTabCacheData()) {
    // 清空费用提示
    clearFeeData()
    resetWaybillInfo(orderPageType.value === OrderPageType.批量寄)
    // 清空返程单信息
    clearReturnWaybill()
    // 重新获取预估费用协议勾选
    setTimeout(() => getDefaultSelect(true), 500)
    await updateOrderByTabCache()
    return
  }
  showLoadingToast(loadingToastOptions)
  // useRefresh 里面已经包含了 清除运单和费用等逻辑
  useRefresh(channel)
  setTabCacheData()
  // 清空副作用
  nextTick(() => {
    closeToast()
    closeTippy()
    clearAllErrClass()
    handleScroll()
  })

  clk_sendtemplate_itc(templateList.value?.length, item?.title)
}
const handleClick = () => {
  router.push({ path: '/template-view' })
}
// 跳转寄件模板
export const handleToList = async (type = '') => {
  // handleClick()
  // if (visible) {
  //   return
  // }
  let useAiSuggest = ''
  if (type && templateRecommendPop.value) {
    useAiSuggest = '&useAiSuggest=true'
    templateRecommendPop.value = false
    try {
      // 暂时屏蔽,联调完后再打开
      reportDialogResult({
        bizSource: 'templateRecommendPop',
        channel: getChannel() || Channel.快速寄件,
        bizData: { notRemind: true },
      })
    } catch (e) {
      console.log(e)
    }
  }
  const xForm = getEnvConfig().xForm
  const url = `${defaultBaseUrl.value}#/${type}?sourcePage=order-config&sourceAction=template-list${useAiSuggest}&token=${getToken()}&xForm=${xForm}&isMiniApp=1`
  // const url = `http://10.32.82.76:8082/#/${type}?sourcePage=order-config&sourceAction=template-list${useAiSuggest}&token=${getToken()}&xForm=${xForm}`
  // 设置缓存，在默认设置获取并做判断

  // 设置缓存，在默认设置获取并做判断
  localStorage?.setItem(LOCAL.SOURCE_ORDER_CONFIG, 'SOURCE_ORDER_CONFIG')
  removeTemplateId()
  clearTabCacheData()
  updateTemplateListInMiniprogram()
  templateUrl.value = url
  handleClick()
}

//兼容pc小程序
const updateTemplateListInMiniprogram = () => {
  if (!isPcMiniprogram.value) {
    return
  }
  awaitPageShow().then(() => {
    sessionStorage.removeItem('hasShowRemoteCheckDataHandOut')
    handleGetTemplateList()
  })
}

// 缓存监听
export const handleStorageListener = (storage: StorageEvent) => {
  const { key, newValue } = storage
  // key值来源于默认配置
  // 监听storage
  if (key === LOCAL.TEMPLATE_ID_FROM_DEFAULT_CONFIG && newValue) {
    // 删除操作，数据格式：delete_id
    if (newValue.includes('delete')) {
      const id = +newValue?.split('_')?.[1]
      let _item = { templateId: getTemplateId() } as ITemplate
      // 删除的是当前选中模板ID,清空名称和当前选中模板
      if (id === getTemplateId()) {
        _item = { templateId: null } as ITemplate
        isInit.value = true
      }
      handleToViewport(_item)
      localStorage.removeItem(LOCAL.TEMPLATE_ID_FROM_DEFAULT_CONFIG)
      return
    }
    const item = { templateId: +newValue } as ITemplate
    const newUrl = getOrderConfigUrl({ ...getQueryObject(), templateId: +newValue })
    location.replace(newUrl)
    handleToViewport(item)
    localStorage.removeItem(LOCAL.TEMPLATE_ID_FROM_DEFAULT_CONFIG)
  }
}

export const setLocalTemplateData = (data) => {
  localStorage.setItem(LOCAL.TEMPLATE_DATA_FROM_DEFAULT_CONFIG, JSON.stringify(data))
}
export const getLocalTemplateData = () => {
  try {
    let res = localStorage.getItem(LOCAL.TEMPLATE_DATA_FROM_DEFAULT_CONFIG)
    return JSON.parse(res) || {}
  } catch (e) {
    return {}
  }
}

export const resetTemplateUpdataInit = async () => {
  let obj = getLocalTemplateData()
  if (obj?.templateIdType && obj?.templateIdType !== 'init') {
    setTemplateId(obj.templateId)
    const item = { templateId: obj.templateId }
    if (obj?.templateIdType === 'delete') {
      item.templateId = ''
      isInit.value = true
    }
    await handleToViewport(item)
    localStorage.removeItem(LOCAL.TEMPLATE_DATA_FROM_DEFAULT_CONFIG)
  }
}

export const addEventTemplateMessage = (event) => {
  if (event.target && event.target.type === 'UPDATE_ORDER_TEMPLATE_ID') {
    console.log('object-event-message-id', event.target)
    const { message } = event.target
    // setTemplateId(message.templateId)
    // handleToViewport(message.templateId)
    setLocalTemplateData(message)
    // resetTemplateUpdataInit()
    // onVisibilityChange(message.templateId)
  }
}
