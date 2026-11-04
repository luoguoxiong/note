<template>
  <view class="fb" :class="{ 'fb--fixed': props.fixed }">
    <view class="fb__inner">
      <view v-if="showLoginCard" class="fb__card fb__card--login">
        <view class="fb__main">
          <view class="fb__title">您尚未登录</view>
          <view class="fb__desc">登录后，解锁更多企业专属服务</view>
        </view>
        <ky-button
          class="fb__btn fb__btn--main"
          type="primary"
          size="large"
          :disabled="props.loginLoading"
          @click="onLoginTap"
        >
          <!-- <image
            v-if="props.loginLoading"
            class="fb__btn-loading-icon"
            src="https://ic-img.ky-express.com/netc/20260410_85370_!!1775814915278_31_31.png"
          /> -->
          <text>登录/注册</text>
        </ky-button>
      </view>

      <view v-if="showPlanCard" class="fb__card fb__card--plan">
        <view class="fb__main">
          <view class="fb__title fb__title--sm">1v1商务为您定制服务方案</view>
          <view class="fb__desc">新客专享优惠</view>
        </view>
        <view class="fb__plan">
          <image
            v-show="props.hasLeadCaptureActivity"
            class="fb__tag"
            src="https://ic-img.ky-express.com/netc/20260416_38328_!!1776345994232_353_81.png"
            mode="widthFix"
          ></image>
          <ky-button class="fb__btn fb__btn--main" type="primary" size="large" @click="onPlanTap">
            获取专属服务方案
          </ky-button>
        </view>
      </view>

      <view v-if="showActionBar" class="fb__card fb__card--actions">
        <view class="fb__row" :class="{ 'fb__row--single': noQyWechat }">
          <ky-button
            :class="['fb__btn', 'fb__btn--grow', noQyWechat ? 'fb__btn--main' : 'fb__btn--line']"
            type="primary"
            size="large"
            :plain="!noQyWechat"
            @click="onContactTap"
          >
            联系商务
          </ky-button>
          <ky-button
            v-if="!noQyWechat"
            class="fb__btn fb__btn--main fb__btn--grow"
            type="primary"
            size="large"
            @click="onAddQyWechatTap"
          >
            添加企微
          </ky-button>
        </view>
      </view>
    </view>
    <ContactBusiness
      v-model:show="showBusinessPopup"
      :phone="userInfo?.phone || ''"
      :showType="showType"
      :offset-bottom="0"
    ></ContactBusiness>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { navigateWithParams, useRoleFlags } from '@/layout/pages/home/hooks'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import ContactBusiness from '@/public/components/business/contact-business/index.vue'
import { useUserInfo } from '@/public/hooks'
import './index.scss'
import { useHomeStore } from '@/layout/pages/home/store'
import { useNewUserActivity } from '@/store/useNewUserActivity'

const homeStore = useHomeStore()

const userActivity = useNewUserActivity()

const { activityParams, isNew } = useRoleFlags()

const props = withDefaults(
  defineProps<{
    isLogin?: boolean
    isOlderCustomer?: boolean
    hasLeadCapture?: boolean
    hasLeadCaptureActivity?: boolean
    hasCompanyWx?: boolean
    loginLoading?: boolean
    fixed?: boolean
    expressType: string
    backPage: string
    // color?: string
  }>(),
  {
    isLogin: false,
    isOlderCustomer: false,
    hasLeadCapture: false,
    hasLeadCaptureActivity: false,
    hasCompanyWx: false,
    loginLoading: false,
    fixed: false,
    // color: '#FFFFFF',
  },
)

const needGetNewCustomerActivity = ref(false)
const isGettingNewCustomerActivity = ref(false)

const displayMode = computed<'none' | 'login' | 'plan' | 'actions'>(() => {
  if (!props.isLogin) return 'login'
  if (props.isOlderCustomer) return 'none'
  if (props.hasLeadCapture) return 'actions'
  return 'plan'
})

const showLoginCard = computed(() => displayMode.value === 'login')
const showPlanCard = computed(() => displayMode.value === 'plan')
const showActionBar = computed(() => displayMode.value === 'actions')
const noQyWechat = computed(() => !props.hasCompanyWx)
const showBusinessPopup = ref(false)
const showType = ref('phone')
const { userInfo } = useUserInfo()

const emit = defineEmits<{
  (_event: 'login'): void
  (_event: 'plan'): void
  (_event: 'contact'): void
  (_event: 'add-qy-wechat'): void
}>()

const onLoginTap = () => {
  needGetNewCustomerActivity.value = true
  emit('login')
  Taro.navigateTo({
    url: `/modules/user/pages/login/index?needNewUserGuide=true&backPage=${props.backPage}&express_type=${props.expressType}`,
  })
}
const onPlanTap = () => {
  emit('plan')
  navigateWithParams(ApplicationCodeMap['首页-申请专属商务'], {
    express_type: props.expressType,
    ...activityParams.value,
  })
}
const onContactTap = () => {
  emit('contact')
  showType.value = 'phone'
  showBusinessPopup.value = true
}
const onAddQyWechatTap = () => {
  emit('add-qy-wechat')
  showType.value = 'qrcode'
  showBusinessPopup.value = true
}

useDidShow(() => {
  if (!needGetNewCustomerActivity.value) return
  if (isGettingNewCustomerActivity.value) return
  if (!props.isLogin) return
  if (!isNew.value) return

  isGettingNewCustomerActivity.value = true

  Promise.allSettled([userActivity.getNewCustomerInfo(false), homeStore.getBusinessQrCode()])
    .then((results) => {
      const hasError = results.some((item) => item.status === 'rejected')

      needGetNewCustomerActivity.value = false

      if (hasError) {
        console.error('新客活动接口部分失败', results)
      }
    })
    .finally(() => {
      isGettingNewCustomerActivity.value = false
    })
})
</script>
