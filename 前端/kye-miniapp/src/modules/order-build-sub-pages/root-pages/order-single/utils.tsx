import { Module, SchemaLayout } from '@order-public-sub-public/types'
import { DefinedComponent } from '@vue/test-utils/dist/types'
import { has, omit } from 'lodash-es'
import { preConfigInitResponse } from '@order-public-sub-public/apis/init/types'
import { isAliPayClient, isWxApplet } from '@order-public-sub-public/utils/device'
// import { decompressFromEncodedURIComponent } from 'lz-string'
import { channelDiffReport, reportCacheFail, reportConfigCache } from '@order-public-sub-root-pages/order-single/report'
import { getChannel } from '@order-public-sub-public/configs'
import { Channel, ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { $native, judgeAppVersion } from '@order-public-sub-public/utils'
import { requestIdleCallbackIfAvailable } from '@order-public-sub-public/utils/common'
import { getEnv } from '@order-public-sub-public/utils/env'
import { useData } from '@order-public-sub-public/components/business/coupon/hooks'
import { useToggleExpand } from '@order-public-sub-public/components/business/more-module/hooks/useState'
import { getCurrentPageName } from '@order-public-sub-public/validate/utils'
import { useStore } from '@order-public-sub-public/store'
import Taro from '@tarojs/taro'
import delayRender from './delayComponet'
import { localStorage } from '@order-public-sub-public/utils/storage'

const { toggleExpand } = useToggleExpand()
const piniaStore = useStore()

/**
 * 根据moduleIdc查找module
 * @param modules
 * @param moduleId
 * @returns
 */
export const findModule = (modules: { [key: string]: Module }, moduleId: string) => {
  const module = modules[moduleId]
  return module ? module : null
}

/**
 * @description 渲染实际业务组件
 * @param Component
 * @param layout
 * @param module
 */
export const renderModule = (
  Component: DefinedComponent,
  layout: SchemaLayout,
  module: Module | null,
  index: number,
) => {
  // 将所有属性作为props传给组件
  const allProps = { ...omit(layout, ['children']), ...module }
  // console.log(index, 'index=========', allProps)
  // if (['Sender', 'Receive'].includes(allProps?.moduleId)) {
  // return <Component {...allProps} key={allProps?.type} />
  // } else {
  // const DelayedMyComponent = delayRender((index + 1) * 2)(Component)
  // return <DelayedMyComponent {...allProps} key={allProps?.type} />
  // }
  return <Component {...allProps} key={allProps?.moduleStyle} />
}

/**
 * 获取layout的visible，兼容visible和v属性
 */
export const getLayoutVisible = (layout: SchemaLayout): boolean => {
  if (has(layout, 'visible')) {
    return !!layout.visible
  }
  return !!layout.v
}

/**
 * 获取layout的visible，兼容visible和v属性
 */
export const getLayoutChildren = (layout: SchemaLayout) => {
  if (has(layout, 'children')) {
    return layout.children
  }
  return layout.c
}

/**
 * 获取layout的visible，兼容visible和v属性
 */
export const getModuleVisible = (module: Module) => {
  if (!module) return false
  if (has(module, 'visible')) {
    return !!module.visible
  }
  return !!module?.v || false
}

/**
 * 判断下单配置的缓存是否可以用,并转成json
 */
export const judgeQuickOrderInitConfig = (quickOrderInitConfig: string | undefined) => {
  let result: preConfigInitResponse | undefined = undefined
  if (typeof quickOrderInitConfig !== 'string') {
    return result
  }
  try {
    result = JSON.parse(quickOrderInitConfig) as preConfigInitResponse
    if (!result?.pageInitConfigResponse) {
      return undefined
    }
    result.pageInitConfigResponse.batchId = ''
  } catch (e) {
    //上报个请求
    reportCacheFail(quickOrderInitConfig)
    console.error(e)
  }
  return result
}
/**
 * 获取下单配置的缓存
 */
export const getCacheInitData = () => {
  // const orderState = useStore()?.public
  let configString: string | undefined = undefined
  const cacheData = Taro.getApp().orderConfigCache
  if (cacheData) {
    configString = JSON.stringify(cacheData)
  }
  reportConfigCache(configString?.length)
  return judgeQuickOrderInitConfig(configString)
}

//通知更新缓存
export const updateInitConfigCache = (forceRefresh = '1') => {
  if (getChannel() !== Channel.快速寄件) {
    return
  }
  if (isWxApplet || isAliPayClient) {
    //通知刷新下单配置缓存
    $native.postMessage({
      actionType: 'UPDATE_STORAGE_ORDER_CONFIG',
      data: {
        forceRefresh,
      },
    })
  } else {
    $native.getPreloadOrderData({
      refresh: 1,
      forceRefresh,
    })
  }
  console.log('通知更新缓存')
}

//将埋点等数据告诉小程序
export const senderParamsToWxApplet = (orderId: string) => {
  if (!isWxApplet) {
    return
  }
  $native.postMessage({
    actionType: 'UPDATE_ORDER_PARAMS',
    data: {
      orderId: orderId,
    },
  })
}

let hasPreloadCouponStatic = false
//提前加载优惠券的静态资源
export const preLoadCouponStatic = async () => {
  const { visible } = useData()
  try {
    if (hasPreloadCouponStatic || !visible.value) {
      return
    }
    await requestIdleCallbackIfAvailable()
    const url =
      getEnv() === 'PROD'
        ? 'https://open-h5.ky-express.com/crm/crm-marketing-coupons/coupon/home.html'
        : 'https://open-h5-uat.ky-express.com/crm/crm-marketing-coupons/coupon/home.html'
    const iframe = document.createElement('iframe')
    iframe.src = url
    iframe.height = '0'
    document.body.appendChild(iframe)
    // 修改bug#475351，插入iframe 触发键盘时导致底部按钮高度不正确，此处改为加载资源后再移除iframe
    setTimeout(() => {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe)
      }
    }, 2000)
    hasPreloadCouponStatic = true
  } catch (e) {
    console.error(e)
  }
}

//判断气泡是否在不常用功能，如果有的话自动打开
export const judgeBubbleInMoreModule = (key: string) => {
  const firstKey = key.split('.')[0]
  const unUsedFields = piniaStore.globalData.preConfigProcess?.processCheckResponse?.configDimension?.unUsedFields || []
  const unUsedFieldsModuleList = unUsedFields.filter((i) => i.fold).map((a) => a.module)
  if (!unUsedFieldsModuleList?.includes(firstKey as ModuleType)) {
    return
  }
  toggleExpand(true)
}

export const redirectOrderUrl = () => {
  try {
    const pageName = getCurrentPageName()
    if (
      ![
        'sender-page',
        'receive-page',
        'receipt-resources',
        'address-book-sender',
        'address-book-receive',
        'dispatch-information',
        'pickup-information',
      ].includes(pageName)
    ) {
      return
    }
    let url = localStorage?.getItem('orderSingeUrl') || ''
    url = decodeURIComponent(url)
    const orderPageType = piniaStore.root.getOrderPageType
    if (!url || orderPageType !== OrderPageType.单票 || url?.indexOf('/#/order') === -1) {
      return
    }
    channelDiffReport()
    location.replace(url)
  } catch (e) {
    console.error(e)
  }
}
