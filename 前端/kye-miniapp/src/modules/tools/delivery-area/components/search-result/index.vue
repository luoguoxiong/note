<template>
  <view class="search-result-wrapper">
    <view class="search-result">
      <image
        class="background"
        :src="
          isSend === 10 || isSend === 30
            ? 'https://ic-img.ky-express.com/netc/20260108_35868_!!1767880020793_1308_240.png'
            : 'https://ic-img.ky-express.com/netc/20260108_4490_!!1767880301445_1308_240.png'
        "
      ></image>
      <view class="search-result-content">
        <view class="delivery-status">
          <view class="title">
            <image
              :src="
                isSend === 10 || isSend === 30
                  ? 'https://ic-img.ky-express.com/netc/20260108_99441_!!1767880781291_60_60.png'
                  : 'https://ic-img.ky-express.com/netc/20260108_71184_!!1767880819688_60_60.png'
              "
            ></image>
            <view class="text">{{ deliveryTitle }}</view>
          </view>
          <ky-button v-if="showResultActionButton" class="btn" type="primary" @click="linkTo">
            {{ isSend === 10 || isSend === 30 ? '去寄件' : '联系商务' }}
          </ky-button>
        </view>
        <view class="content-wrapper" v-show="isSend === 30">{{ '可配送区域为：' + sendList }}</view>
        <view class="tips" v-show="isSend !== 20">实际配送以下单为准</view>
      </view>
    </view>

    <view
      v-if="showLeadCard"
      :class="['lead-card-stage', (showLeadPopup || leadPopupClosing) && 'lead-card-stage--popup']"
    >
      <view v-if="!showLeadPopup && !leadPopupClosing" class="lead-card lead-card--intro lead-card--active">
        <view class="lead-card__title">{{ leadCardTitle }}</view>
        <view class="lead-card__action">
          <image
            v-show="hasLeadCaptureActivity"
            class="lead-card__tag"
            src="https://ic-img.ky-express.com/netc/20260416_38328_!!1776345994232_353_81.png"
            mode="widthFix"
          ></image>
          <ky-button
            class="lead-card__btn"
            type="primary"
            size="normal"
            block
            :text="DELIVERY_AREA_BUTTON_NAME.servicePlan"
            :color="LEAD_SERVICE_BUTTON_BG"
            @click.stop="openLeadForm"
          ></ky-button>
        </view>
      </view>

      <view v-else :class="['lead-form-popup', leadPopupClosing && 'lead-form-popup--closing']" @click.stop>
        <view class="lead-form-card">
          <view class="lead-form-card__banner">
            <image
              class="lead-form-card__banner-image"
              :src="leadFormBannerUrl"
              mode="widthFix"
              @load="scrollLeadFormIntoView"
            ></image>
          </view>

          <view
            class="lead-form-card__field"
            :class="{
              'lead-form-card__field--focus': focusField === 'companyName',
              'lead-form-card__field--filled': Boolean(companyName.trim()),
              'lead-form-card__field--error': hasFieldError('companyName'),
            }"
          >
            <view class="lead-form-card__label">公司名称<text>必填</text></view>
            <view class="lead-form-card__input-wrap">
              <ky-input
                v-model="companyName"
                class="lead-form-card__input"
                border="all"
                placeholder="请输入您的公司全称"
                :is-error="hasFieldError('companyName')"
                :enableNative="false"
                :always-system="!isAmapMiniApp"
                :cursor-spacing="130"
                clearable
                @focus="reportCompanyNameClick"
                @blur="blurField('companyName')"
                @input="clearError('companyName')"
              ></ky-input>
              <view
                v-if="canShowFieldError('companyName')"
                class="lead-form-card__error-pop lead-form-card__error-pop--top"
              >
                {{ getFieldErrorText('companyName') }}
              </view>
            </view>
          </view>

          <view
            class="lead-form-card__field"
            :class="{
              'lead-form-card__field--focus': showAddressSelect,
              'lead-form-card__field--filled': Boolean(selectedArea),
              'lead-form-card__field--error': hasFieldError('area'),
            }"
          >
            <view class="lead-form-card__label">省市区<text>必填</text></view>
            <view class="lead-form-card__input-wrap">
              <view class="lead-form-card__select" @click="openAddressSelect">
                <text :class="{ placeholder: !selectedArea }">{{ selectedArea || '请选择省/市/区' }}</text>
                <image src="https://ic-img.ky-express.com/netc/20260108_32722_!!1767845576820_51_51.png"></image>
              </view>
              <view v-if="canShowFieldError('area')" class="lead-form-card__error-pop lead-form-card__error-pop--top">
                {{ getFieldErrorText('area') }}
              </view>
            </view>
          </view>

          <view
            class="lead-form-card__field"
            :class="{
              'lead-form-card__field--focus': focusField === 'detailAddress',
              'lead-form-card__field--filled': Boolean(detailAddress.trim()),
              'lead-form-card__field--error': hasFieldError('detailAddress'),
            }"
          >
            <view class="lead-form-card__label">详细地址<text>必填</text></view>
            <view class="lead-form-card__input-wrap">
              <ky-input
                v-model="detailAddress"
                class="lead-form-card__input"
                border="all"
                placeholder="请输入所在街道以及详细地址"
                :is-error="hasFieldError('detailAddress')"
                :enableNative="false"
                :always-system="!isAmapMiniApp"
                :cursor-spacing="130"
                clearable
                @focus="reportDetailAddressClick"
                @blur="blurField('detailAddress')"
                @input="clearError('detailAddress')"
              ></ky-input>
              <view
                v-if="canShowFieldError('detailAddress')"
                class="lead-form-card__error-pop lead-form-card__error-pop--top"
              >
                {{ getFieldErrorText('detailAddress') }}
              </view>
            </view>
          </view>

          <view id="delivery-area-lead-form-submit" class="lead-form-card__submit-anchor">
            <ky-button
              class="lead-form-card__submit"
              type="primary"
              size="large"
              block
              :text="leadFormSubmitButtonName"
              :color="LEAD_SERVICE_BUTTON_BG"
              :loading="submitting"
              :loading-text="leadFormSubmitButtonName"
              loading-size="28px"
              @click="submit"
            ></ky-button>
          </view>
        </view>
      </view>
    </view>

    <AddressSelect
      v-model:show="showAddressSelect"
      :max-level="3"
      :selected-address="selectedArea"
      @click.stop
      @change="onAddressChange"
    ></AddressSelect>

    <!-- 联系商务 -->
    <ContactBusiness
      v-model:show="showBussiness"
      :phone="userInfo?.phone || ''"
      :hideNeedClose="false"
    ></ContactBusiness>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import Taro, { useDidHide } from '@tarojs/taro'
import kyeNavigate from '@/public/utils/native/navigate'
import './index.scss'
import AddressSelect from '../address-select/index.vue'
import ContactBusiness from '@/public/components/business/contact-business/index.vue'
import { openURL } from '@/modules/webview/utils'
import { useUserInfo } from '@/public/hooks'
import { isAmapMiniApp, urlContact, uuid } from '@/public/utils'
import { queryMarketingPersonnelV1 } from '../../apis'
import {
  DELIVERY_AREA_ACTIVITY_RESULT,
  DELIVERY_AREA_BUTTON_NAME,
  DELIVERY_AREA_LEAD_FORM_FIELD,
  reportDeliveryAreaLeadFormClick,
  reportDeliveryAreaLeadFormExposure,
  reportDeliveryAreaLeadFormFieldClick,
  reportDeliveryAreaResultClick,
} from '../../report'
import { getEnvConfig } from '@/public/constants'
const { isProd } = getEnvConfig()

type DeliveryAreaActivityResult = (typeof DELIVERY_AREA_ACTIVITY_RESULT)[keyof typeof DELIVERY_AREA_ACTIVITY_RESULT]
type LeadFormField = 'companyName' | 'area' | 'detailAddress'
const LEAD_FORM_FIELD_ORDER: LeadFormField[] = ['companyName', 'area', 'detailAddress']

const RESULT_URL = isProd
  ? 'https://ic-h5.kye-erp.com/customer-code.html#/apply-result?from=home&express_type=绑码组件&hasLeadCapture=10'
  : 'https://ic-h5-uat.kye-erp.com/customer-code.html#/apply-result?from=home&express_type=绑码组件&hasLeadCapture=10'
const DEFAULT_BACK_SCENE = 10
const DEFAULT_LEAD_ORIGIN = '100'
const DELIVERY_AREA_COUPON_SOURCE = '70'
const MOBILE_SOURCE = 10
const LEAD_SERVICE_BUTTON_BG = 'linear-gradient(270deg, #6a62ff 0%, #7c25ff 100%)'

const props = withDefaults(
  defineProps<{
    isSend: number
    sendList: string
    address?: string
    isNew?: boolean
    hasLeadCapture?: boolean
    leadEligibilityLoading?: boolean
    hideResultAction?: boolean
    hasLeadCaptureActivity?: boolean
    activityId?: string | number
  }>(),
  {
    address: '',
    isNew: false,
    hasLeadCapture: false,
    leadEligibilityLoading: false,
    hideResultAction: false,
    hasLeadCaptureActivity: false,
    activityId: '',
  },
)

const { userInfo } = useUserInfo()

const showBussiness = ref(false)
const showAddressSelect = ref(false)
const showLeadPopup = ref(false)
const leadPopupClosing = ref(false)
const companyName = ref('')
const selectedArea = ref('')
const detailAddress = ref('')
const errorTexts = ref<Partial<Record<LeadFormField, string>>>({})
const activeErrorField = ref<LeadFormField | ''>('')
const focusField = ref('')
const submitting = ref(false)
const canShowErrorPopover = ref(false)

const LEAD_POPUP_TRANSITION_DURATION = 220
const LEAD_FORM_SUBMIT_SELECTOR = '#delivery-area-lead-form-submit'
const LEAD_FORM_SUBMIT_VISIBLE_GAP = 24
let leadPopupCloseTimer: ReturnType<typeof setTimeout> | undefined
let leadPopupScrollTimers: ReturnType<typeof setTimeout>[] = []

const canShowLeadEntry = computed(
  () => props.isNew && !props.hasLeadCapture && (props.isSend === 10 || props.isSend === 30),
)

const showLeadCard = computed(() => canShowLeadEntry.value)

const showResultActionButton = computed(
  () => !props.leadEligibilityLoading && !props.hideResultAction && !(props.isNew && !props.hasLeadCapture),
)

const leadCardTitle = computed(() => {
  return props.hasLeadCaptureActivity
    ? '该地址已有配送网点，开通企业账号，0元解锁1对1定制服务方案，再送专属优惠券！'
    : '该地址已有配送网点，开通企业账号，0元解锁1对1定制服务方案！'
})

const leadFormBannerUrl = computed(() =>
  props.hasLeadCaptureActivity
    ? 'https://ic-img.ky-express.com/netc/20260610_93071_!!1781081442627_1372_292.png'
    : 'https://ic-img.ky-express.com/netc/20260602_32214_!!1780388727087_1372_292.png',
)

const leadFormSubmitButtonName = computed(() =>
  props.hasLeadCaptureActivity ? DELIVERY_AREA_BUTTON_NAME.receiveBenefit : DELIVERY_AREA_BUTTON_NAME.submit,
)

const deliveryTitle = computed(() => {
  if (props.isSend === 10) {
    return '该区域支持配送服务'
  } else if (props.isSend === 20) {
    return '该区域暂未支持自营配送服务'
  } else {
    return '部分区域支持配送服务'
  }
})

const normalizeArea = (address = '') => {
  return address.split('/').filter(Boolean).slice(0, 3).join('/')
}

const hasFieldError = (field: LeadFormField) => Boolean(errorTexts.value[field])

const getFieldErrorText = (field: LeadFormField) => errorTexts.value[field] || ''

const getFirstErrorField = (errors: Partial<Record<LeadFormField, string>>) => {
  return LEAD_FORM_FIELD_ORDER.find((field) => Boolean(errors[field])) || ''
}

const canShowFieldError = (field: LeadFormField) =>
  canShowErrorPopover.value && !showAddressSelect.value && activeErrorField.value === field && hasFieldError(field)

const hideErrorPopovers = () => {
  // canShowErrorPopover.value = false
}

const showErrorPopovers = () => {
  if (!Object.keys(errorTexts.value).length) return

  activeErrorField.value = getFirstErrorField(errorTexts.value)
  canShowErrorPopover.value = true
}

const clearError = (field: LeadFormField) => {
  if (!errorTexts.value[field]) return

  const restErrors = { ...errorTexts.value }
  delete restErrors[field]
  errorTexts.value = restErrors

  if (activeErrorField.value === field) {
    activeErrorField.value = getFirstErrorField(restErrors)
  }
}

const resetLeadForm = () => {
  companyName.value = ''
  selectedArea.value = normalizeArea(props.address)
  detailAddress.value = ''
  errorTexts.value = {}
  activeErrorField.value = ''
  hideErrorPopovers()
  focusField.value = ''
}

const clearLeadPopupCloseTimer = () => {
  if (leadPopupCloseTimer) {
    clearTimeout(leadPopupCloseTimer)
    leadPopupCloseTimer = undefined
  }
}

const clearLeadPopupScrollTimers = () => {
  leadPopupScrollTimers.forEach((timer) => clearTimeout(timer))
  leadPopupScrollTimers = []
}

const hideLeadPopupImmediately = () => {
  clearLeadPopupCloseTimer()
  clearLeadPopupScrollTimers()
  showLeadPopup.value = false
  leadPopupClosing.value = false
}

watch(
  () => props.address,
  () => {
    hideLeadPopupImmediately()
    resetLeadForm()
  },
  { immediate: true },
)

watch(
  () => props.isSend,
  () => {
    hideLeadPopupImmediately()
    resetLeadForm()
  },
)

const openLeadForm = () => {
  reportDeliveryAreaResultClick(DELIVERY_AREA_BUTTON_NAME.servicePlan)
  resetLeadForm()
  clearLeadPopupCloseTimer()
  clearLeadPopupScrollTimers()
  leadPopupClosing.value = false
  showLeadPopup.value = true
  reportDeliveryAreaLeadFormExposure()
  scrollLeadFormIntoView()
}

// 关闭留资表单并回到引导卡片。
// const closeLeadPopup = () => {
//   if (!showLeadPopup.value || leadPopupClosing.value) return
//
//   clearLeadPopupCloseTimer()
//   clearLeadPopupScrollTimers()
//   showLeadPopup.value = false
//   leadPopupClosing.value = true
//   leadPopupCloseTimer = setTimeout(() => {
//     leadPopupClosing.value = false
//     leadPopupCloseTimer = undefined
//   }, LEAD_POPUP_TRANSITION_DURATION)
// }

// 点击外部关闭留资表单并回到引导卡片。
// const handleWrapperClick = () => {
//   if (showLeadPopup.value) {
//     closeLeadPopup()
//   }
// }

const scrollLeadSubmitIntoView = (duration = 300) => {
  if (!showLeadPopup.value) return

  const query = Taro.createSelectorQuery()
  query.selectViewport().scrollOffset()
  query.selectViewport().boundingClientRect()
  query.select(LEAD_FORM_SUBMIT_SELECTOR).boundingClientRect()
  query.exec((res) => {
    if (!showLeadPopup.value) return

    const scrollOffset = res?.[0] as { scrollTop?: number } | undefined
    const viewportRect = res?.[1] as { height?: number } | undefined
    const submitRect = res?.[2] as { bottom?: number } | undefined
    const currentScrollTop = Number(scrollOffset?.scrollTop || 0)
    const viewportHeight = Number(viewportRect?.height || Taro.getSystemInfoSync().windowHeight || 0)
    const submitBottom = Number(submitRect?.bottom || 0)

    if (!viewportHeight || !submitBottom) return

    const visibleBottom = viewportHeight - LEAD_FORM_SUBMIT_VISIBLE_GAP
    if (submitBottom <= visibleBottom) return

    Taro.pageScrollTo({
      scrollTop: currentScrollTop + submitBottom - visibleBottom,
      duration,
    })
  })
}

const scheduleScrollLeadSubmitIntoView = (delay: number, duration = 300) => {
  const timer = setTimeout(() => {
    leadPopupScrollTimers = leadPopupScrollTimers.filter((item) => item !== timer)
    scrollLeadSubmitIntoView(duration)
  }, delay)
  leadPopupScrollTimers.push(timer)
}

const scrollLeadFormIntoView = () => {
  clearLeadPopupScrollTimers()
  nextTick(() => {
    scrollLeadSubmitIntoView(LEAD_POPUP_TRANSITION_DURATION)
    scheduleScrollLeadSubmitIntoView(80, LEAD_POPUP_TRANSITION_DURATION)
    scheduleScrollLeadSubmitIntoView(300)
  })
}

onUnmounted(() => {
  clearLeadPopupCloseTimer()
  clearLeadPopupScrollTimers()
})

defineExpose({
  closeLeadPopupFromOutside: () => {},
})

const validate = () => {
  const nextErrors: Partial<Record<LeadFormField, string>> = {}

  if (!companyName.value.trim()) {
    nextErrors.companyName = '请输入您的公司全称'
  }
  if (!selectedArea.value) {
    nextErrors.area = '请选择省市区'
  }
  if (!detailAddress.value.trim()) {
    nextErrors.detailAddress = '请输入所在街道以及详细地址'
  }

  errorTexts.value = nextErrors

  if (Object.keys(nextErrors).length) {
    showErrorPopovers()
    return false
  }

  hideErrorPopovers()
  return true
}

const onAddressChange = (val: string[]) => {
  selectedArea.value = normalizeArea(val.join('/'))
  showAddressSelect.value = false
  clearError('area')
}

const reportCompanyNameClick = () => {
  focusField.value = 'companyName'
  reportDeliveryAreaLeadFormFieldClick(DELIVERY_AREA_LEAD_FORM_FIELD.companyName)
}

const reportDetailAddressClick = () => {
  focusField.value = 'detailAddress'
  reportDeliveryAreaLeadFormFieldClick(DELIVERY_AREA_LEAD_FORM_FIELD.detailAddress)
}

const blurField = (field: string) => {
  if (focusField.value === field) {
    focusField.value = ''
  }
}

const openAddressSelect = () => {
  hideErrorPopovers()
  reportDeliveryAreaLeadFormFieldClick(DELIVERY_AREA_LEAD_FORM_FIELD.area)
  showAddressSelect.value = true
}

useDidHide(() => {
  hideErrorPopovers()
})

const reportSubmitResult = (activityResult: DeliveryAreaActivityResult) => {
  reportDeliveryAreaLeadFormClick(leadFormSubmitButtonName.value, activityResult)
}

const submit = async () => {
  if (!validate()) {
    reportSubmitResult(DELIVERY_AREA_ACTIVITY_RESULT.fail)
    return
  }

  if (submitting.value) return
  submitting.value = true

  const leadResult = await queryMarketingPersonnelV1({
    phone: userInfo.value?.phone || '',
    address: `${selectedArea.value}${detailAddress.value.trim()}`,
    origin: DEFAULT_LEAD_ORIGIN,
    companyName: companyName.value.trim(),
    contactsName: userInfo.value?.userName || '',
    activityId: props.activityId || undefined,
    source: MOBILE_SOURCE,
    sendCouponSource: DELIVERY_AREA_COUPON_SOURCE,
  })
    .catch((error: { msg?: string; message?: string }) => {
      Taro.showToast({ title: error?.msg || error?.message || '\u63d0\u4ea4\u5931\u8d25', icon: 'none' })
      reportSubmitResult(DELIVERY_AREA_ACTIVITY_RESULT.fail)
      return null
    })
    .finally(() => {
      submitting.value = false
    })

  if (!leadResult) return

  const { code, msg, data } = leadResult
  const submitCode = Number(code ?? -1)
  if (![0, 48820, 999].includes(submitCode)) {
    Taro.showToast({ title: msg || '\u63d0\u4ea4\u5931\u8d25', icon: 'none' })
    reportSubmitResult(DELIVERY_AREA_ACTIVITY_RESULT.fail)
    return
  }

  const resultStatus = submitCode === 0 ? 1 : 2
  const couponStatus = data?.couponStatus ?? 30
  const couponNumber = data?.couponNumber ?? 0
  const targetUrl = urlContact(RESULT_URL, {
    status: resultStatus,
    contactsName: userInfo.value?.userName || '',
    companyName: companyName.value.trim(),
    couponStatus,
    couponNumber,
    phone: userInfo.value?.phone || '',
    from: 'home',
    workId: uuid(),
    backSence: DEFAULT_BACK_SCENE,
    express_type: '绑码组件',
    hasLeadCapture: 10,
  })

  console.log('[delivery-area] couponStatus', couponStatus)
  console.log('[delivery-area] couponNumber', couponNumber)
  console.log('[delivery-area] targetUrl', targetUrl)

  reportSubmitResult(DELIVERY_AREA_ACTIVITY_RESULT.success)

  openURL(targetUrl, {
    needLogin: true,
    unDecodeUrl: true,
  })
  // 当前业务不支持提交后关闭留资表单并回到引导卡片。
  // closeLeadPopup()
}

const linkTo = () => {
  if (props.isSend === 10 || props.isSend === 30) {
    reportDeliveryAreaResultClick(DELIVERY_AREA_BUTTON_NAME.sendOrder)
    // 去寄件
    kyeNavigate.navigateBefore('navigateTo', {
      url: '/modules/order-build/pages/order/index',
    })
  } else {
    reportDeliveryAreaResultClick(DELIVERY_AREA_BUTTON_NAME.contactBusiness)
    // 联系商务
    showBussiness.value = true
  }
}
</script>
