<template>
  <div class="over-area-delivery-agreement" data-validate="branchSelf.agreement">
    <div class="flex">
      <div class="flex item-center over-area-delivery-agreement-content">
        <SvgIcon
          name="radio-disabled-checked"
          class="icon over-area-delivery-agreement_icon is-checked"
          v-if="disabled"
        />
        <SvgIcon
          name="check-icon"
          class="over-area-delivery-agreement_icon"
          v-else-if="selfPickAgreement"
          @click.stop="toggle(true)"
        />
        <SvgIcon
          :name="showCheckErrorTip ? 'no-checked-red' : 'no-check-icon'"
          class="over-area-delivery-agreement_icon"
          v-else
          @click.stop="toggle(true)"
        />
      </div>
      <div class="over-area-delivery-agreement-checkbox-text">
        <!-- 我已阅读并同意 -->
        <span @click.stop="toggle(true)">我已阅读并同意</span>
        <span class="over-area-delivery-agreement__item" @click.stop="toggle(false)">{{ title }}</span>
      </div>
    </div>
    <BottomPopup
      :show="selfPickAgreementShow"
      :title="title"
      @onClose="onClose"
      :showFooter="true"
      class="over-area-delivery-agreement__popup"
      :scrollTop="scrollTop"
      @handlerScroll="handlerScroll"
    >
      <div class="delivery-agreement__popup--body">
        <div class="gray_color">
          与您通过本平台缔约的主体是跨越速运集团有限公司或其子公司、分公司、关联公司（以下简称：跨越速运），跨越速运为您提供货物自提服务。
        </div>
        <div style="margin: 32px 0">
          <span class="gray_color">
            跨越速运承运单号为<span class="red_color">{{ waybillNumber }}</span>
            的托寄物，因您选择、修改该批托寄物的派送方式为自提，无需跨越速运派送。请您在确认自提前认真阅读《自提风险告知书》
          </span>
          ，如您点击“我已阅读并理解，同意自提”，视为您已阅读、完全理解并同意本告知书的内容。
        </div>
        <div class="detail">
          <div>
            <span class="index">1</span>
            <div class="gray_color marg_left">
              若您在下单时选择自提，提货地址为离收件地址最近的跨越速运派送点部；若您在下单后修改为自提的，提货地址为离当前货物所在地址距离最近的跨越速运服务点部/分拨/中转场。具体提货地址以短信通知为准，如您对提货地址有疑问的，请联系您的专属市场或拨打95324。
            </div>
          </div>
          <div>
            <span class="index">2</span>
            <div class="gray_color marg_left">
              为了便于您自提，跨越速运在该货物到达提货地址后，向您指定的自提手机号发送提货信息，提货信息包括提货地址、提货联系人、提货验证码，短信转发或截图转发验证码均有效。
            </div>
          </div>
          <div>
            <span class="index">3</span>
            <div class="marg_left">
              提货验证码作为提货的唯一凭证，请您妥善保存、谨慎转发。对自提货物，跨越速运仅识别提货验证码，任何持有验证码的人均有权提货，跨越速运不对提货人的身份进行校验，持有验证码即视为已被授权提货。（即认码不认人）
            </div>
          </div>
          <div>
            <span class="index">4</span>
            <div class="marg_left gray_color">
              您须告知提货人，在签收前应认真查验货物情况，验收时发现货物毁损、短少的，须跟现场人员确认并在运单上注明。货物经自提人签收后，跨越速运不再承担任何货损、丢失的赔偿责任。
            </div>
          </div>
          <div>
            <span class="index">5</span>
            <div class="marg_left gray_color">如该货物需要签回单的，持有提货验证码的提货人在回单上的签名有效。</div>
          </div>
          <div>
            <span class="index">6</span>
            <div class="gray_color marg_left">
              您选择自提后，跨越速运对以下情形不承担时效延误的责任：
              <div>1)您或您指定的自提人未提货或未及时提货的；</div>
              <div>2)您自行修改或被其他有权修改的人员重新修改为跨越速运派送的。</div>
            </div>
          </div>
          <div>
            <span class="index">7</span>
            <div class="gray_color marg_left">
              若该货物运费未付（付款方式为月结方式的除外）的，您应沟通付款人支付运费并在提货时出示付款凭证；若该货物有代收货款服务的，则您需先行支付货款，或告知提货人在提货前支付货款并在提货时出示付款凭证，否则跨越速运有权拒绝交接货物。
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="over-area-delivery-agreement__popup--footer">
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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ref, computed, watch, onMounted } from 'vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import LazyRender from '@order-public-sub-public/components/ui/lazy-render/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
// import { Checkbox, Button } from 'vant'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

import { selfPickAgreementShow, selfPickAgreement, hideAgreement, createCacheKey } from './hooks'
import useEffect from '@order-public-sub-public/validate'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import { localStorage } from '@order-public-sub-public/utils/storage'
import Taro from '@tarojs/taro'
import { DynamicNumericalValuesMap } from '@order-public-sub-public/constants'

const { effectBubble } = useEffect()

const emit = defineEmits(['agreeContentShow', 'argeeCallback', 'change', 'close'])

const props = defineProps({
  waybillNumber: String,
  title: String,
  placement: { type: String, default: 'top-start' },
  prop: { type: String, default: 'agreement' },
  popoverMessage: { type: String, default: '请先阅读并勾选协议' },
  onlyNum: { type: String, default: '123' },
  value: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const isScrollToBottom = ref(false)
const showContent = ref(true)
const showCheckErrorTip = ref(false)
const scrollTop = ref(0)
const disabled = computed(() => {
  return props.disabled
})
const customCode = computed(() => {
  return ''
})
const btnText = computed(() => {
  if (selfPickAgreement.value) return '我知道了'
  return isScrollToBottom.value ? '同意此协议，下次不再提醒' : `请滑动阅读此协议`
})
const systemInfo = Taro.getSystemInfoSync()
const windowHeight = systemInfo.windowHeight

// 确认按钮是否置灰
const confirmDisabled = computed(() => {
  if (props.isScrollRead) return false
  return !isScrollToBottom.value && !selfPickAgreement.value
})

const onClose = () => {
  isScrollToBottom.value = false
  hideAgreement()
  emit('close')
}

watch(
  () => selfPickAgreementShow.value,
  (val) => {
    if (!val) {
      //初始化滚动条
      showContent.value = false
      scrollTop.value = 0
      setTimeout(() => {
        showContent.value = true
      })
    }
  },
)

watch(
  () => selfPickAgreement.value,
  (v) => {
    console.log('value checked...', v)
    showCheckErrorTip.value = !v
    if (!v) {
      effectBubble([
        {
          key: 'branchSelf.agreement',
          passed: false,
          content: '请勾选自提风险告知书',
          bubbleConfig: { offset: [0, 15] },
        },
      ])
    }
  },
)

const onChange = (value: boolean) => {
  emit('change', value)

  localStorage?.setItem(createCacheKey(customCode.value, props.onlyNum), value ? '1' : '0')

  if (!value) {
    isScrollToBottom.value = false
  }
}

onMounted(() => {
  initDate()
})

// 初始数据
const initDate = async () => {
  selfPickAgreement.value = localStorage?.getItem(createCacheKey(customCode.value, props.onlyNum)) === '1'
  emit('change', selfPickAgreement.value)
}
const handlerScroll = (e: any) => {
  if (isScrollToBottom.value || selfPickAgreement.value) return
  // 转app端 高度减滚动的高度 计算会有误差 此处多减DynamicNumericalValuesMap.popupT
  if (e.target.scrollHeight - e.target.scrollTop - DynamicNumericalValuesMap.popupT <= windowHeight * 0.7) {
    isScrollToBottom.value = true
  }
}

// 管理协议详情是否展开
const toggle = (v: boolean) => {
  if (disabled.value) return
  if (selfPickAgreement.value && Boolean(v)) {
    selfPickAgreement.value = false
    onChange(false)
    // 重置是否需要调用修改阅读状态的接口 -- 报关入仓使用
    // Boolean(v) && (isReadState.value = false)
    return
  }
  emit('agreeContentShow')
  selfPickAgreementShow.value = true
}

const onConfirm = () => {
  if ((!selfPickAgreement.value && isScrollToBottom.value) || props.isScrollRead) {
    selfPickAgreementShow.value = false
    selfPickAgreement.value = true
    onChange(true)
    closeTippy()
    return
  }
  selfPickAgreementShow.value = false
  emit('close')
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
