<template>
  <view class="order-page-container masker_root_order">
    <!--    <ky-navbar v-if="isWxMiniApp && hasShow" :leftArrow="true" :title="routerTitle"></ky-navbar>-->
    <!-- 未登录异常状态展示 -->
    <KyEmpty class="order-empty" :type="EmptyTypeEnum.CUSTOM" :custom-config="customConfig" v-if="showEmpty">
      <KyButton @click="login" class="login-btn" size="small" text="登录" v-if="!isTokenAlive"></KyButton>
      <KyButton
        @click="initOrderPage"
        class="login-btn"
        size="small"
        v-else-if="showRefresh"
        text="重新加载"
      ></KyButton>
    </KyEmpty>
    <view v-else class="order-page dialog_root_order" id="order-page">
      <!-- 退出活动 -->
      <ExitActivity :themeName="themeName" @exit="exit" v-if="exitVisible" />
      <scroll-view
        :scrollWithAnimation="true"
        scrollAnimationDuration="200"
        :scroll-y="true"
        :scrollTop="orderPageScrollTop"
        @scroll="handleScroll"
        class="order-content"
        id="orderContent"
        :class="{ 'ios-class': isAppiOS || isIpad, 'pc-miniprogram': isPcMiniprogram }"
        v-exposure-report="{
          eventCode: eventCodeOrder,
        }"
      >
        <!-- todo 通知栏 迁移到schema.layout内部 -->
        <NoticeBar v-if="props.route === OrderPageType.单票 || props.route === OrderPageType.批量寄" />
        <SchemaForm v-if="_schema && initFinished" :schema="_schema as Schema" />
      </scroll-view>
      <!-- todo 是否可以迁移到schema.layout内部 -->
      <view style="position: relative">
        <!-- 优惠券气泡 -->
        <CouponPoper></CouponPoper>
        <OrderFooter v-if="!isPreviewRoute" />
      </view>
    </view>
    <PageCommon v-if="hasShow" />
  </view>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, provide, ref } from 'vue'
import SchemaForm from './components/schemaForm.vue'
// import { useStore } from '@order-public-sub-public/store'
import { isOrderPreviewRoute } from '@order-public-sub-public/utils/route'
import NoticeBar from '@order-public-sub-public/components/business/notice-bar/index.vue'
import OrderFooter from './components/orderFooter.vue'
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'
import CouponPoper from '@order-public-sub-public/components/business/estimated-cost/components/coupon-poper/index.vue'
import { initErrorCode, orderHomeRoute, useInit } from './hooks/useInit'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import { EMPTY_CONFIGS } from '@order-public-sub-public/components/ui/ky-empty/config'
import {
  Channel,
  EmptyTypeEnum,
  ErrorCode,
  InitOrderStatus,
  ModuleType,
  OrderPageType,
} from '@order-public-sub-public/constants'
import { getDefaultSelect } from '@order-public-sub-public/components/business/estimated-cost/hooks/useExpose'
import ExitActivity from '@order-public-sub-public/components/ui/exit-activity/index.vue'
import { orderPageScrollTop, orderPageScrollTopHistory } from './hooks/useScrollTop'
import { getQueryObject, judgeAppVersion } from '@order-public-sub-public/utils'
import { Schema } from '@order-public-sub-public/types'
import { getChannel, setChannel } from '@order-public-sub-public/configs'
import { addDetailPerformance, EReportRenderTime, performanceMark } from '@order-public-sub-public/utils/reportConfig'
import { useSenderRealNameInfoSync } from '@order-public-sub-public/hooks/useSenderRealNameInfoSync'
import { isAppiOS, isIpad, isWechat } from '@order-public-sub-public/utils/device'
import { isDesktopMiniprogram } from '@order-public-sub-public/utils/native'
import { setTemplateId } from './hooks/template'
import { useRoute, useRouter } from '@order-public-sub-public/vue-router/index'
import {
  orderMountedReport,
  orderPreload,
  pageShowReport,
  pageShowReportNew,
  pagExpressSingleReport,
} from '@order-public-sub-root-pages/order-single/report'
import { resetWaybillInfo } from '@order-public-sub-public/utils/waybillInfo'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import '@order-global-package-order-sub/styles/common.scss'
import { initFinished } from './hooks/routerStatus'
import { hasRest, timeFlag } from '@order-public-sub-public/hooks/asynrender'
import { useDidShow } from '@tarojs/taro'
import useEffect from '@order-public-sub-public/validate'
import { useDoms } from '@order-public-sub-public/hooks/useDoms'
import Taro from '@tarojs/taro'
import { throttle } from 'lodash-es'
import { useCommonDataHook } from '@public/storage/hooks/useCommonHook'
import { showLoadingToast, closeToast } from '@order-public-sub-public/hooks/useShowToast'
import { useGlobalPopover } from '@order-global-package-order-sub/components/business/popover-effect/hooks/useUpdate'
import { useOrderRootStore } from '@order-public-sub-public/store/pinia'
import { useSchemaStore } from '@order-public-sub-public/store/modules/schema/pinia'
import { useGlobalDataStore } from '@order-public-sub-public/store/modules/globalData/pinia'

const rootStore = useOrderRootStore()
const schemaStore = useSchemaStore()
const globalDataStore = useGlobalDataStore()

import { getToken } from '@order-public-sub-public/storage'
const { onTokenChange } = useCommonDataHook()
// const { removeValidateSinge } = useGlobalPopover()

const router = useRouter()
const route = useRoute()
const { effectInOrderPage } = useEffect()
const hasShow = ref(false)
window.$umpOtherReport = umpOtherReport
// 解决onTokenChange token不变更也触发的问题
const tokenBackup = ref('')
// token变更 调用
onTokenChange((token) => tokenChangeUpdatePageInit(token))
const localNumberInit = ref(0)
const tokenChangeUpdatePageInit = (token) => {
  if (!token) {
    return
  }
  // 多次重复调用，只执行一次
  if (token !== tokenBackup.value && localNumberInit.value === 0) {
    localNumberInit.value = 1
    tokenBackup.value = token
    setTimeout(() => {
      showLoadingToast({ message: '加载中', forbidClick: true })
      localNumberInit.value = 0
    }, 1500)
    pageInit()
  }
}

router.beforeEach((to, from) => {
  console.log('to', to, 'from', from)
  return true
})

performanceMark('setup')

const props = withDefaults(defineProps<{ data?: Schema; route?: OrderPageType; orderTitle?: string }>(), {
  route: OrderPageType.单票,
})
if (props.route === OrderPageType.单票) {
  // initStore(props.route)
}

provide('orderPageType', props.route)

const isPcMiniprogram = computed(() => {
  return isDesktopMiniprogram()
})

const routerMap = {
  [OrderPageType.单票]: '快速寄件',
  [OrderPageType.返程单]: '返程单',
  [OrderPageType.预览]: '预览',
  [OrderPageType.批量寄]: '批量寄',
  [OrderPageType.批量寄单票]: '批量寄单票',
}
const routerTitle = computed(() => {
  return props.orderTitle || routerMap[props.route]
})

// 引入初始化hook
const { schema, init, exit, exitVisible, themeName, initOrderBackPage, initPageStatus } = useInit(props.route)

const layoutIndex = ref(5)

const _schema = computed(() => {
  return {
    ...schema.value,
    layout: schema.value?.layout,
  }
})

useDidShow(async () => {
  effectInOrderPage()
})

const changeLayoutIndex = () => {
  setTimeout(() => {
    layoutIndex.value = schema.value?.layout.length || 10
    hasRest.value = true
  }, 100)
}

const handleScroll = throttle((e: any) => {
  orderPageScrollTopHistory.value = e.detail.scrollTop
  // removeValidateSinge()
}, 100)

// 定义组件名，用于keepAlive白名单判断
defineOptions({
  name: 'order',
})

// 是否预览路由
const isPreviewRoute = computed(() => isOrderPreviewRoute())

//显示缺省页, 排除预览界面
const showEmpty = computed(() => {
  return (!isTokenAlive.value || initPageStatus.value === InitOrderStatus.FAILED) && !isPreviewRoute.value
})

const showRefresh = computed(() => {
  const ignoreCode = [ErrorCode.运单已删除, ErrorCode.暂无数据, ErrorCode.非下单人身份, ErrorCode.已下单成功]
  return !ignoreCode.includes(initErrorCode.value?.code as ErrorCode)
})

//缺省文案配置
const customConfig = computed(() => {
  const codeObj = initErrorCode.value
  const code = codeObj?.code
  const codeMap: Record<ErrorCode, { image: string; description: string | undefined }> = {
    [ErrorCode.运单已删除]: {
      image: EMPTY_CONFIGS.data.image,
      description: codeObj?.msg,
    },
    [ErrorCode.暂无数据]: {
      image: EMPTY_CONFIGS.data.image,
      description: codeObj?.msg,
    },
    [ErrorCode.非下单人身份]: {
      image: EMPTY_CONFIGS.data.image,
      description: codeObj?.msg,
    },
    [ErrorCode.已下单成功]: {
      image: EMPTY_CONFIGS.waybill.image,
      description: codeObj?.msg,
    },
  }
  const description = codeMap[code as ErrorCode]?.description || '加载超时，请重新加载'
  return {
    image: codeMap[code as ErrorCode]?.image || EMPTY_CONFIGS.network.image,
    description: !isTokenAlive.value ? '用户信息已失效，请重新登录' : description,
  }
})
const isTokenAlive = computed(() => rootStore.getIsTokenAlive)

/**
 * @description 登录
 */
const login = () => {
  Taro.navigateTo({
    url: '/modules/user/pages/login/index',
  })
}

const isHideGoodTimes = () => {
  if (getQueryObject()?.isAppointmentPickup) {
    schemaStore.updateModuleConfigByType({
      type: ModuleType['货好时间'],
      data: {
        visible: false,
        required: false,
      },
      orderPageType: props.route,
    })
  }
}

// 感知埋点
const eventCodeOrder = computed(() => {
  return props.route === OrderPageType.返程单
    ? 'other_express_return_perception_v1'
    : 'other_express_single_perception_v1'
})

const initOrderPage = () => {
  addDetailPerformance(EReportRenderTime.初始化开始)
  const initPromise = init(props.route, {
    notFirstTimeEnter: props.route === OrderPageType.单票,
    updateDynamicConfig: false,
  })
  // 将promise保存到store，用于防止提前提交下单
  globalDataStore.setInitDataPromise({ initDataPromise: initPromise })
  initPageStatus.value = InitOrderStatus.BEGIN
  initPromise
    .then(() => {
      if (props.route === OrderPageType.返程单) {
        initOrderBackPage()
      }
    })
    .finally(() => {
      initFinished.value = true
      closeToast()
      getDefaultSelect()
      isHideGoodTimes()
      changeLayoutIndex()
      setTimeout(() => {
        useDoms()
      }, 100)
    })

  // setTimeout(() => {
  //   apm.reportError(new Error('首次进入下单配置单票寄件页'))
  // }, 1000)
}

const pageShowHandle = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.checkOrderConfigPreData = () => {
    //为了不报错，如果调用初始化会有业务问题
    pageShowReport()
    orderPreload.value = true
  }
  pageShowReportNew()
  try {
    const channel = getChannel()
    const { sourceAction = 'entry' } = getQueryObject()
    const notEntry = sourceAction !== 'entry' || channel !== Channel.快速寄件
    orderMountedReport({
      isWechat,
      notEntry,
    })
    if (isWechat || notEntry || !judgeAppVersion('7.61.0')) {
      pageShowReport()
    }

    pagExpressSingleReport()
  } catch (e) {
    console.error(e)
  }
  const { templateId } = route.query
  if (templateId) {
    setTemplateId(templateId as string)
  }
  // localStorage.setItem('orderShowFlag', '1')
}

onBeforeMount(() => {
  hasShow.value = true
  timeFlag.value = Date.now()
  console.log('缓存单票', Date.now())
  pageInit()
  tokenBackup.value = getToken()
})

const setInitChannel = () => {
  const { channel } = orderHomeRoute.value || getQueryObject()
  setChannel(channel)
}

const pageInit = () => {
  console.log('onTokenChange测试执行次数')
  setInitChannel()
  performanceMark('orderOnBeforeMount')
  addDetailPerformance(EReportRenderTime.单票页面onBeforeMount)
  // resetWaybillInfoInit()
  initOrderPage()
  pageShowHandle()
}

const resetWaybillInfoInit = () => {
  if (props.route === OrderPageType.单票) {
    //清楚运单数据
    resetWaybillInfo()
  }
}

useSenderRealNameInfoSync(props.route)
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
