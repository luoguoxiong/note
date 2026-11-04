<template>
  <div class="netc-agreement" data-validate="agreement" id="agreement">
    <div class="netc-agreement__checkbox">
      <div class="netc-agreement__checkbox-icon" @click.stop="togglePopup(true)">
        <span class="icon-content">
          <SvgIcon name="check-icon" class="netc-agreement__icon" v-if="checked" />
          <SvgIcon :name="showCheckErrorTip ? 'no-checked-red' : 'no-check-icon'" class="netc-agreement__icon" v-else />
        </span>
      </div>
      <div class="netc-agreement-__checkbox-text">
        <span @click.stop="togglePopup(true)">我已阅读并同意</span>
        <span class="netc-agreement__item" @click.stop="togglePopup(false)">{{ currentTitle }}</span>
      </div>
    </div>
    <BottomPopup
      :showFooter="true"
      v-model:show="show"
      :title="currentTitle"
      class="netc-agreement__popup"
      @onClose="closed"
      @closed="closedHandle"
      :scrollTop="scrollTop"
      @handlerScroll="handlerScroll"
    >
      <rich-text :nodes="content" id="waybill-terms"></rich-text>
      <template #footer>
        <div class="netc-agreement__popup--footer-btn">
          <KyButton
            type="primary"
            @click="onConfirm"
            class="confirm-button"
            :disabled="confirmDisabled"
            :text="btnText"
          >
          </KyButton>
        </div>
      </template>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, onMounted, getCurrentInstance, watch } from 'vue'
import dayjs from 'dayjs'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import * as Agreements from './utils'

import { agreementCheckHasRead, agreementSave, getHelpContent } from '@order-public-sub-public/apis/waybill/agreement'
import { DynamicNumericalValuesMap, ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import { show } from './useData'
import useEffect from '@order-public-sub-public/validate'
import { setStorge } from '../../utils'
import { couponShowFlag } from '../../hooks/useExpose'
import { isOrderBackRoute } from '@order-public-sub-public/utils/route'
import { contractPopupClosedReport } from '@order-public-sub-public/components/business/estimated-cost/report/report'
import Taro from '@tarojs/taro'
import { modifyHtmlTagString } from '@order-public-sub-public/utils/string'
const piniaStore = useStore()

const props = defineProps({
  // 是否需要滚动到底部阅读
  isScrollRead: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    validator: (v: string) => !v.trim() || Object.keys(Agreements).includes(v),
  },
  helpId: {
    type: Number,
    default: 0,
  },
  defaultChecked: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['agreeContentShow', 'argeeCallback', 'change'])

// const show = ref(false)
const loading = ref(true)
const initSuccess = ref(false)
const content = ref('')
const currentTitle = ref('《电子运单契约条款》')
const checked = ref(false) // 已阅读时
const isReadState = ref(false) // 改变报关的阅读状态 -- 报关入仓使用
const isScrollToBottom = ref(props.isScrollRead)
const showContent = ref(true)
const scrollTop = ref(0)
const timer = ref<number | undefined>(undefined)
const mobileSource = ref('0')
const showCheckErrorTip = ref(false)

const { effectBubble } = useEffect()

const isBackRoute = isOrderBackRoute()
const systemInfo = Taro.getSystemInfoSync()
const windowHeight = systemInfo.windowHeight

// const checkedState = ref(false) // 改变报关的阅读状态 -- 报关入仓使用
// const isClickWaybillTermsA = ref(false) //是否点击电子运单契约条款中的a链接

onMounted(() => {
  if (props.defaultChecked) {
    checked.value = props.defaultChecked
  }
  getMobileSource()
})

const onChange = (value: any) => {
  emit('change', value)
  couponShowFlag.value = value

  piniaStore.schema.updateModuleDimensionByType({
    type: ModuleType['预估费用'],
    data: {
      agreementCheck: value,
    },
  })
  setStorge('agreementCheck', value)
  if (!value) {
    isScrollToBottom.value = false
    agreementSave({
      flag: 0,
      type: 0,
    })
  }
}

const btnText = computed(() => {
  // 如果勾选了或者后台配置了不用华东阅读，则底部按钮显示我知道了
  if (checked.value) return '我知道了'
  if (props.isScrollRead) return '同意此协议，下次不再提醒'
  return isScrollToBottom.value ? '同意此协议，下次不再提醒' : `请滑动阅读此协议`
})

// 确认按钮是否置灰
const confirmDisabled = computed(() => {
  if (props.isScrollRead) return false
  return !isScrollToBottom.value && !checked.value
})

const closed = () => {
  isScrollToBottom.value = false
  show.value = false

  //初始化滚动条
  showContent.value = false
  scrollTop.value = 0
  setTimeout(() => {
    showContent.value = true
  }, 0)
}

const closedHandle = () => {
  contractPopupClosedReport()
}

const handlerScroll = (e: any) => {
  if (checked.value) return
  if (e.target.scrollHeight - e.target.scrollTop - DynamicNumericalValuesMap.popupT <= windowHeight * 0.7) {
    isScrollToBottom.value = true
    if (scrollTop.value === 0) {
      scrollTop.value = e.target.scrollTop
    }
  }
}

// 点击同意
const onConfirm = () => {
  // 点击同意此协议 表示已阅读
  if ((!checked.value && isScrollToBottom.value) || props.isScrollRead) {
    show.value = false
    // 上报已阅读
    toRecordRead()
    checked.value = true
    onChange(true)
    // 报关协议已经阅读的情况下 调用修改阅读状态的接口 -- 报关入仓使用
    isReadState.value && emit('argeeCallback')
    closeTippy()
    return
  }
  show.value = false
}

watch(
  () => props.defaultChecked,
  (val) => {
    if (orderPageType.value === OrderPageType.返程单 || orderPageType.value === OrderPageType.批量寄单票) {
      return
    }
    checked.value = val
  },
)
const orderPageType = computed(() => piniaStore.root.getOrderPageType)
// 小程序气泡定位不了 和产品协商先去除
// watch(
//   () => checked.value,
//   (val) => {
//     showCheckErrorTip.value = !val

//     if (!val && !isBackRoute && orderPageType.value !== OrderPageType.批量寄单票) {
//       effectBubble([
//         {
//           key: 'agreement',
//           passed: false,
//           content: '请先阅读勾选协议',
//           bubbleConfig: { appendTo: document.body, offset: [0, 10] },
//         },
//       ])
//     }
//   },
// )

watch(
  () => show.value,
  (val) => {
    initDate()
    if (!val) {
      //初始化滚动条
      showContent.value = false
      scrollTop.value = 0
      nextTick(() => {
        showContent.value = true
      })
    }
  },
)

// 移动端请求来源
const getMobileSource = () => {
  const app = getCurrentInstance()
  const native = app?.appContext.config.globalProperties.$native
  native &&
    native.getSource().then((res: any) => {
      mobileSource.value = res.source === 'miniprogram' ? '1' : '0'
    })
}

// 协议读取记录
const toRecordRead = async () => {
  try {
    const notRemindTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    const params = {
      page: '0',
      source: mobileSource.value,
      notRemindTime,
      type: 0,
    }
    await agreementCheckHasRead(params)
  } catch (error) {
    console.log(error)
  }
}

const initDate = async () => {
  if (content.value) return

  loading.value = true
  initSuccess.value = false
  try {
    const res = await getHelpContent({ type: 0 })
    loading.value = false
    content.value = modifyHtmlTagString(
      res.data?.content,
      'p',
      'line-height: 28px;margin-top: 14px; margin-bottom: 14px;',
    )
    initSuccess.value = true
  } catch (error) {
    clearTimeout(timer.value)
    timer.value = setTimeout(() => {
      show.value = false
    }, 1000)
  }
}

// 管理协议详情是否展开
const togglePopup = async (v: boolean) => {
  if (checked.value && Boolean(v)) {
    checked.value = false
    onChange(false)
    // 重置是否需要调用修改阅读状态的接口 -- 报关入仓使用
    Boolean(v) && (isReadState.value = false)
    return
  }
  show.value = true
}

// onMounted(() => {
//   initDate()
// })
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
