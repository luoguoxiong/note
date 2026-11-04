<template>
  <view
    v-if="showList.length"
    id="ma-exp"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_marketing_region_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        region_code: 'marketing_region',
        event_name: '移动端新版首页_营销区域_菜单入口曝光',
        region_name: '营销区域',
        access_name: showList.map((item) => item.title).join('、'),
        customer_name: '老客',
      },
    }"
    :class="['ma', { 'ma--compact': showList.length >= 3 }]"
  >
    <view
      v-for="item in showList"
      :key="item.title"
      :id="item.id"
      class="ma__item"
      :style="{ background: item.background }"
      @click="item.onClick"
    >
      <view class="ma__item__info">
        <text class="ma__item__title">{{ item.title }}</text>

        <text class="ma__item__desc">
          <text
            v-for="(split, index) in formatterDescription(item.desc)"
            :key="index"
            :class="{ ['ma__item__text--highlight']: split.highlight }"
          >
            {{ split.text }}
          </text>
        </text>

        <view class="ma__item__button">
          <text>{{ item.actionText }}</text>
          <view class="ma__item__button-arrow"></view>
        </view>
      </view>
      <ky-lazy-image :delay="500" :src="item.icon" class="ma__item__icon" :style="item.iconStyle" mode="aspectFit" />
    </view>
    <CustomerBindDialog express-type="预存运费" v-model:visible="isShowCustomerBindDialog" />
  </view>
</template>

<script lang="ts" setup>
import { useRoleFlags } from '../../hooks'
import { computed, onMounted, ref } from 'vue'
import { useApplication } from '@public/utils/application/useApplication'
import { useHomeStore } from '../../store'
import * as Apis from '../../apis'
import Taro from '@tarojs/taro'
import { isEmployee } from '@/public/apis/user'
import { useUserInfo } from '@/public/hooks'
import { AreaCodePlatMap, MenuCodeMap } from '@/public/utils/application/constants'
import { ApplicationItem } from '@/public/utils/application/applicationType'
import { useBindCustomer } from '@/public/hooks/useBindCustomer'
import { useGetAreaLightApp } from '@/public/hooks/useGetAreaLightApp'
import { http } from '@/public/utils/request'
import { DailyTask } from '../../apis/types'
import { reportMarketAreaClick } from '../../report'
import './index.scss'
import { useExposureReport } from '@/public/hooks/useExposureReport'
import { px2real } from '@/public/utils'
import { siginPreloadImg } from '../../utils/sigin'
import CustomerBindDialog from '@/modules/user/pages/customer-code/customer-code-popup/index.vue'

/** 图标素材走 CDN（与项目既有券背景图同域名） */
const signIcon = 'https://ic-img.ky-express.com/netc/20261012_12436_!!1791770072645_160_160.png'
const introduceIcon = 'https://ic-img.ky-express.com/netc/20261012_41620_!!1791770072643_136_204.png'
const depositIcon = 'https://ic-img.ky-express.com/netc/20261012_67735_!!1791770072641_192_184.png'

defineOptions({ name: 'ma' })

const emits = defineEmits(['sign-success-new'])

useExposureReport(['ma-exp'])

const { isLogin, isSign } = useRoleFlags()
const { navigateApplication } = useApplication()
const { customerInfo } = useBindCustomer({ openCustomerApi: false })
const homeStore = useHomeStore()

const isShowCustomerBindDialog = ref(false)

const { lightApps } = useGetAreaLightApp(AreaCodePlatMap['首页-营销区'])

const { userInfo } = useUserInfo()

const integralAmount = ref(30)

const navigateToApp = (menuCode: string) => {
  const lightApp = lightApps.value.find((item: ApplicationItem) => item.menuCode === menuCode)
  lightApp && navigateApplication(lightApp)
}

type SignTask = Required<Required<DailyTask>['detailList']>[number]

/** 静默拦截错误码，前端终止流程且不弹窗 */
const SILENT_INTERCEPT_CODE = 100201

/** 请求来源：小程序 */
const SOURCE_MINIAPP = 3

const showTipModal = (content: string) => {
  Taro.showModal({
    title: '温馨提示',
    content,
    confirmText: '我知道了',
    showCancel: false,
    confirmColor: '#8365f6',
  })
}

/** 签到前置管控校验：账号限送分及消费时拦截，返回是否放行 */
const checkIntegralBeforeSign = async () => {
  const signTask = ((homeStore.data.taskList || []) as unknown as SignTask[]).find(
    (item) => item.taskCode === 'dailyAttendance',
  )
  if (!signTask || signTask.beforeIntercept !== 1 || !signTask.beforeApi) return true
  try {
    await http(
      signTask.beforeApi,
      {
        taskId: signTask.id,
        customerCode: customerInfo.value?.customerCode,
        source: SOURCE_MINIAPP,
      },
      { hideToast: true },
    )
    return true
  } catch (err) {
    if (typeof err === 'string') {
      showTipModal(err)
    } else if (err && err.code !== SILENT_INTERCEPT_CODE) {
      showTipModal(err.msg || err.message || '网络异常，请稍后重试')
    }
    return false
  }
}

const toSign = async () => {
  reportMarketAreaClick({
    access_name: '签到',
    customer_name: '老客',
  })
  if (!isLogin.value) {
    Taro.navigateTo({ url: '/modules/user/pages/login/index' })
    return
  }
  const res = await isEmployee({ phone: userInfo.value.phone })

  if (res.data.isEmployee) {
    Taro.showModal({
      title: '温馨提示',
      content: '很遗憾，内部员工限制送分哦',
      confirmText: '我知道了',
      showCancel: false,
    })
    return
  }
  const passed = await checkIntegralBeforeSign()
  if (!passed) return
  if (isSign.value) {
    navigateToApp(MenuCodeMap['首页-积分签到'])
  } else {
    try {
      Taro.showLoading({ title: '加载中' })
      // 弹出签到成功弹窗
      const { data } = await Apis.marketingIntegralSignIntegral({
        taskId: homeStore.data.dailyAttendanceTaskId,
        customerCode: customerInfo.value?.customerCode! as string | undefined,
        source: SOURCE_MINIAPP,
      })
      homeStore.updateData({ isSign: true })
      integralAmount.value = data.integralAmount
      emits('sign-success-new', data.integralAmount)
    } catch (e) {
      if (e?.message) {
        Taro.showModal({
          title: '温馨提示',
          content: e.message,
          confirmText: '我知道了',
          showCancel: false,
          confirmColor: '#8365f6',
        })
      }
      await homeStore.getCouponAndSign()
    } finally {
      Taro.hideLoading()
    }
  }
}

function linkToIntroduce(menuCode: string) {
  reportMarketAreaClick({
    access_name: menuCode === MenuCodeMap['首页-个人介绍'] ? '个人介绍' : '企客介绍',
    customer_name: '老客',
  })
  if (!isLogin.value) {
    Taro.navigateTo({ url: '/modules/user/pages/login/index' })
    return
  }
  navigateToApp(menuCode || MenuCodeMap['首页-个人介绍'])
}

function linkToPay() {
  reportMarketAreaClick({
    access_name: '预存运费',
    customer_name: '老客',
  })
  if (!isLogin.value) {
    Taro.navigateTo({ url: '/modules/user/pages/login/index' })
    return
  }
  if (!userInfo.value.customerCode) {
    isShowCustomerBindDialog.value = true
    return
  }
  navigateToApp(MenuCodeMap['首页-预存入口'])
}

const menuCode = computed<string[]>(() => {
  return lightApps.value.map((item: any) => item.menuCode)
})

const allList = computed(() => {
  const givingIntegralText = Number(homeStore.data.givingIntegral) > 0 ? `##+${homeStore.data.givingIntegral}##` : ''
  return [
    {
      id: 'sign',
      icon: signIcon,
      iconStyle: { width: px2real(80) + 'px', height: px2real(80) + 'px' },
      title: isSign.value ? '今日已签到' : '每日签到',
      desc: isSign.value ? '赚更多积分' : '今日签到' + givingIntegralText,
      actionText: isSign.value ? '前往' : '去签到',
      onClick: toSign,
      show: menuCode.value.includes(MenuCodeMap['首页-积分签到']),
      background:
        'linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), linear-gradient(0deg, #FDFCFF 0%, #D9CFFF 100%)',
    },
    {
      icon: introduceIcon,
      iconStyle: { width: px2real(68) + 'px', height: px2real(102) + 'px' },
      title: '个人介绍',
      desc: '介绍客户拿奖励',
      actionText: '去参与',
      onClick: () => linkToIntroduce(MenuCodeMap['首页-个人介绍']),
      show:
        menuCode.value.includes(MenuCodeMap['首页-个人介绍']) && !menuCode.value.includes(MenuCodeMap['首页-企客介绍']),
      background:
        'linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), linear-gradient(0deg, #FFFCFE 0%, #FFCFE9 100%)',
    },
    {
      icon: introduceIcon,
      iconStyle: { width: px2real(68) + 'px', height: px2real(102) + 'px' },
      title: '企客介绍',
      desc: '介绍客户拿奖励',
      actionText: '去参与',
      onClick: () => linkToIntroduce(MenuCodeMap['首页-企客介绍']),
      show: menuCode.value.includes(MenuCodeMap['首页-企客介绍']),
      background:
        'linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), linear-gradient(0deg, #FFFCFE 0%, #FFCFE9 100%)',
    },
    {
      icon: depositIcon,
      iconStyle: { width: px2real(96) + 'px', height: px2real(92) + 'px', right: 0 },
      title: '预存运费',
      desc: '限时特惠',
      actionText: '去参与',
      onClick: linkToPay,
      show: isLogin.value && menuCode.value.includes(MenuCodeMap['首页-预存入口']),
      background:
        'linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), linear-gradient(0deg, #FFFEFC 0%, #FFE8CF 100%)',
    },
  ]
})

const isHighlight = (text: string) => {
  return text.slice(0, 2) === '##' && text.slice(-2) === '##'
}

const formatterDescription = (text: string) => {
  return (
    text?.split(/(##\+\d+##)/).map((text) => {
      const highlight = isHighlight(text)
      return {
        highlight,
        text: highlight ? text.slice(2, -2) : text,
      }
    }) || []
  )
}

const showList = computed(() => allList.value.filter((item) => item.show))

onMounted(() => {
  siginPreloadImg.preloadImage()
})
</script>
