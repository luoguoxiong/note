<template>
  <div class="page-finish">
    <div class="img-wrap">
      <image class="img" src="./assets/icon-personal.png" alt="" />
    </div>

    <div class="tip">实名认证成功</div>

    <div v-if="isFirstFlag" class="desc">
      <image
        class="congratulations"
        src="https://ic-img.ky-express.com/netc/20260108_45266_!!1767863373701_1372_368.png"
        alt=""
      />
      <span class="success-sub-tips" v-if="!isAliMiniApp">可前往积分中心查看</span>
    </div>

    <div class="btn-wrap">
      <template v-if="isShowContinue || (isFromOrder && !isFromShare) || forceVerifyObj.forceFlag === '20'">
        <ky-button type="primary" @click="goBackContinueOrder">继续寄件</ky-button>
        <ky-button type="primary" plain v-if="isFirstFlag" @click="goIntegralCenter">前往积分中心</ky-button>
      </template>
      <template v-else>
        <ky-button type="primary" @click="goToEle">立即寄件</ky-button>
        <ky-button type="primary" plain v-if="isFirstFlag" @click="goIntegralCenter">前往积分中心</ky-button>
        <ky-button type="primary" plain v-else @click="goBack">返回认证首页</ky-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro, { useRouter } from '@tarojs/taro'
// import { isAppBrowse, isWxApplet, isAliPayClient } from '@/utils/device'
// import { isAppiOS, isAppAndroid, isIphone } from '@/utils/device'
import { clk_id_id_success_button, other_id_id_success, page_id_id_success } from '../report/index'
import { useRealNameStore } from '../store'
import { isAliMiniApp } from '@/public/utils'
import { getEnvConfig } from '@/public/config'
import { useApplication } from '@/public/utils/application/useApplication'
import { ApplicationItem } from '@public/utils/application/applicationType'
import { isFromScan } from '../hooks/useEnterpriseData'
const router = useRouter()
const realNameStore = useRealNameStore()

// 响应式数据
const isFirstFlag = ref(false) // 是否首次认证
const forceVerifyObj = computed(() => realNameStore.forceVerifyObj || {})

// 从路由参数获取数据
const routeParams = router.params || {}
const type = ref(routeParams.type || 'personal')
const isChangeName = ref(routeParams.isChangeName === 'true')
const idType = ref(routeParams.idType || '10')
const workId = ref(routeParams.work_id || '')

// 计算属性
/** 展示 "立即寄件" 按钮 */
// const showSendButton = computed(() => {
//   return true
// })

// 是否下单分享
const isFromShare = computed(() => {
  return forceVerifyObj.value?.isFromShare === 'true'
})

// 是否从巴枪扫码实名
const isFromBaqiang = computed(() => {
  return forceVerifyObj.value?.isFromBaqiang === 'true'
})

// 是否从订单过来
const isFromOrder = computed(() => {
  return realNameStore.isFromOrder
})

// 是否从展会下单过来
const isShowContinue = computed(() => realNameStore.originFromQuery === 'orderExhibition')

// 埋点方法
const buriedPoint = () => {
  const express_type = type.value === 'personal' ? '个人认证' : '企业认证'
  const originFromQuery = realNameStore.originFromQuery
  let current_path = '实名认证'

  const pathMap: Record<string, string> = {
    order_submit: '下单成功',
    order_page: '下单页',
    order_notify_list: '预约取货列表',
    order_notify_detail: '预约取货详情',
    orderExhibition: '展会下单',
  }

  if (originFromQuery && pathMap[originFromQuery]) {
    current_path = pathMap[originFromQuery]
  }

  if (forceVerifyObj.value?.forceFlag === '20') {
    current_path = '下单强制实名弹窗'
  }

  if (isFromShare.value) {
    current_path = '分享实名卡片'
  }

  const type_name = idType.value === '10' ? '外国人永久居留身份证' : '居民身份证'
  const change_name = forceVerifyObj.value?.forceFlag === '20' && isChangeName.value ? '是' : '否'

  other_id_id_success({
    type_name,
    express_type,
    change_name,
    current_path,
    work_id: workId.value,
  })
}

// TODO 原生刷新跑马灯 - 已确认,不需要
// const nativeRefreshLamp = () => {
// if (isAppiOS) {
//   window.webkit?.messageHandlers?.refreshLamp?.postMessage?.({ callback: 'hello' })
//   console.log('ios刷新跑马灯')
// } else if (isAppAndroid) {
//   window.kye?.refreshLamp?.()
//   console.log('安卓刷新跑马灯')
// } else if (isWxApplet || window.$native?.isKyeMiniApp) {
//   window.$native?.postMessage?.({ data: { type: 'refreshLamp' } })
//   console.log('小程序刷新跑马灯')
// } else {
//   console.log('环境不支持')
// }
// }

// 页面跳转方法
const goToEle = () => {
  clk_id_id_success_button({ button_name: '立即寄件' })
  Taro.redirectTo({ url: '/modules/order-build/pages/order/index' })
}

const goBackContinueOrder = () => {
  clk_id_id_success_button({ button_name: '继续寄件' })
  Taro.navigateBack()
}

// 前往积分中心
const goIntegralCenter = () => {
  const { isProd } = getEnvConfig()
  useApplication().navigateApplication({
    menuCode: 'M6425',
    applicationCode: 'H5_INTEGRAL_MINI_V1',
    customParam: '',
    loadAddress:
      `https://ic-h5${isProd ? '' : '-uat'}.kye-erp.com/netc-h5-marketing-optimize/integral-center-new/integral-center.html#/integral-home`,
    accessMode: 0,
    smallIcon: '',
  } as ApplicationItem)
}

const goBack = () => {
  clk_id_id_success_button({ button_name: '返回认证首页' })

  if (isFromShare.value || isFromBaqiang.value || isFromScan.value) {
    Taro.redirectTo({ url: '/modules/user/pages/realname/home/index' })
    // Taro.navigateBack()
    realNameStore.setForceVerifyObj({
      orderPageSource: '',
      uniqueId: '',
      forceFlag: '',
      otherPhone: '',
      idName: '',
      isFromShare: '',
      isFromBaqiang: '',
    })
  } else {
    // Taro.redirectTo({ url: '/modules/user/pages/realname/home/index' })
    Taro.navigateBack()
  }
}

// 生命周期
onMounted(() => {
  page_id_id_success({})
  isFirstFlag.value = routeParams.firstFlag === '10'
  buriedPoint()
  // sessionStorage.setItem('authCreditCode', '') TODO - 检查干嘛用的
})
</script>

<style lang="scss">
.page-finish {
  min-height: 100vh;
  background-color: #ffffff;
  // @include multi-screen-max-width;

  .img-wrap {
    overflow: hidden;
    .img {
      display: block;
      width: 240px;
      height: 240px;
      margin: 64px auto 32px;
    }
  }

  .tip {
    font-size: 36px;
    font-weight: 600;
    line-height: 52px;
    text-align: center;
    letter-spacing: 0px;
    color: #24262b;
  }

  .desc {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin-top: 32px;
    line-height: 40px;
    .congratulations {
      width: 686px;
      height: 184px;
    }

    .success-sub-tips {
      font-size: 26px;
      font-weight: normal;
      line-height: 36px;
      text-align: center;
      color: #8c8f99;
      margin-top: 24px;
    }

    .kye_integral {
      width: 34px;
      height: 34px;
    }
  }

  .btn-wrap {
    position: fixed;
    display: flex;
    flex-direction: column;
    gap: 32px;
    bottom: 124px;
    margin: 0 auto;
    overflow: hidden;
    left: 50%;
    transform: translateX(-50%);
    font-weight: 600;
    .ky-button--primary {
      height: 88px !important;
      width: 452px !important;
    }
  }
}
</style>
