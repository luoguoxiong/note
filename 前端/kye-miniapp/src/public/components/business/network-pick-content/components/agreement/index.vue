<template>
  <view class="agreement">
    <ky-popover location="top-start" :offset="[6, 0]" theme="dark" :show="agreementPopoverShow">
      <template #reference>
        <ky-checkbox v-model="checked" data-popover-key="network-pick-agreement">
          我已阅读并同意<view class="agreement__item" @click.stop="openAgreement">{{ title }}</view>
          <template #icon="props">
            <image
              class="agreement_icon"
              v-if="!agreementValid"
              src="https://ic-img.ky-express.com/netc/20250527_5546747426_!!1748357385557_64_64.png"
            />
            <template v-else>
              <view v-if="disabled" class="goodsControlDisabled"></view>
              <image
                class="agreement_icon is-checked"
                src="../../../netc-time-popup/assets/icon-select.png"
                v-else-if="props.checked"
              />
              <image class="agreement_icon" src="../../../netc-time-popup/assets/icon-not-select.png" v-else />
            </template>
          </template>
        </ky-checkbox>
      </template>
      <template #content>
        <view class="error-tips-padding">请先阅读并勾选协议</view>
      </template>
    </ky-popover>
    <ky-popup :show="show" class="agreement__popup" position="bottom">
      <view class="popup-box">
        <view class="popup-box-title">
          <text>{{ title }}</text>
          <image
            class="popup-close"
            @tap="handleClose"
            src="https://ic-img.ky-express.com/netc/20250118_42870395139_!!1737186469837_64_64.png"
          ></image>
        </view>
      </view>
      <scroll-view
        scroll-y="true"
        class="agreement__popup--body"
        @scrollToLower="handlerScrollToLower"
        @scroll="handlerScroll"
        ref="scrollref"
      >
        <view class="agreement-content">
          <rich-text :nodes="content"></rich-text>
          <!-- <view>
            与您通过本平台缔约的主体是跨越速运集团有限公司或其子公司、分公司、关联公司（以下简称：跨越速运），跨越速运为您提供货物自提服务。
          </view>
          <view style="margin: 32px 0">
            跨越速运承运单号为<text class="red_color">{{ waybillNumber }}</text>
            的货物，因您选择、修改该批货物的派送方式为自提，无需跨越速运派送。请您在确认自提前认真阅读《自提风险告知书》，如您点击“我已阅读并理解，同意自提”，视为您已阅读、完全理解并同意本告知书的内容。
          </view>
          <view class="detail">
            <view>
              <text class="index">1</text>
              <view class="gray_color marg_left">
                若您在下单时选择自提，提货地址为离收件地址最近的跨越速运派送点部；若您在下单后修改为自提的，提货地址为离当前货物所在地址距离最近的跨越速运服务点部/分拨/中转场。具体提货地址以短信通知为准，如您对提货地址有疑问的，请联系您的专属市场或拨打95324。
              </view>
            </view>
            <view>
              <text class="index">2</text>
              <view class="gray_color marg_left">
                为了便于您自提，跨越速运在该货物到达提货地址后，向您指定的自提手机号发送提货信息，提货信息包括提货地址、提货联系人、提货二维码，短信转发或截图转发二维码均有效。
              </view>
            </view>
            <view>
              <text class="index">3</text>
              <view class="marg_left">
                提货二维码作为提货的唯一凭证，请您妥善保存、谨慎转发。对自提货物，跨越速运仅识别提货二维码，任何持有二维码的人均有权提货，跨越速运不对提货人的身份进行校验，持有二维码即视为已被授权提货。（即认码不认人)
              </view>
            </view>
            <view>
              <text class="index">4</text>
              <view class="marg_left">
                您须告知提货人，在签收前应认真查验货物情况，验收时发现货物毁损、短少的，须跟现场人员确认并在运单上注明。货物经自提人签收后，跨越速运不再承担任何货损、丢失的赔偿责任。
                <view>如该货物需要签回单的，持有提货二维码的提货人在回单上的签名有效。</view>
              </view>
            </view>
            <view>
              <text class="index">5</text>
              <view class="gray_color marg_left">
                您选择自提后，跨越速运对以下情形不承担时效延误的责任：
                <view>1)您或您指定的自提人未提货或未及时提货的；</view>
                <view>2)您自行修改或被其他有权修改的人员重新修改为跨越速运派送的。</view>
              </view>
            </view>
            <view>
              <text class="index">6</text>
              <view class="marg_left">
                若该货物运费支付方式为到付或有代收货款服务的，则您需先行支付运费或货款，或告知提货人在提货前支付运费或货款，并在提货时出示付款凭证，否则跨越速运有权拒绝交接货物。
              </view>
            </view>
          </view> -->
        </view>
      </scroll-view>
      <view class="agreement__popup--footer">
        <ky-button @click="onConfirm" class="confirm-button" :disabled="!isRead && !checked">{{ btnText }}</ky-button>
      </view>
    </ky-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { isH5Env } from '@public/utils'

import './index.scss'

const props = withDefaults(
  defineProps<{
    waybillNumber: string
    title: string
    placement: string
    prop: string
    popoverMessage: string
    onlyNum: string
    myAgreement: boolean
    disabled: boolean
    agreementValid: boolean
    agreementPopoverShow: boolean
    content: string
  }>(),
  {
    placement: 'top-start',
    prop: 'agreement',
    popoverMessage: '请先阅读并勾选协议',
    onlyNum: '123',
    myAgreement: false,
    disabled: false,
    agreementValid: true,
    agreementPopoverShow: false,
    content: '',
  },
)

const emit = defineEmits(['change', 'checkedChange'])

const checked = ref(false)
const show = ref(false)
// 是否阅读
const isRead = ref(false)

const btnText = computed(() => {
  if (checked.value) return '我知道了'
  return isRead.value ? '同意此协议，下次不再提醒' : `请滑动阅读此协议`
})

const scrollref = ref()

watch(
  () => checked.value,
  (val) => {
    emit('change', val)
    emit('checkedChange', val)
  },
)

watch(
  () => props.myAgreement,
  (val) => {
    checked.value = val
    emit('change', val)
  },
  { immediate: true },
)

watch(
  () => show.value,
  () => {
    if (scrollref.value) {
      isRead.value = false
      scrollref.value.scrollTop = 0
    }
  },
)

// h5环境下，scrollToLower可能不触发，使用scroll事件检测滚动到底部
const handlerScroll = (e) => {
  if (!isH5Env) return
  scrollref.value = e?.target
  const { scrollTop, scrollHeight, scrollWidth } = e.detail || {}
  if (scrollHeight && scrollTop !== undefined) {
    // 通过DOM元素获取更准确的滚动信息（h5环境下scroll-view会被编译成原生元素）
    const scrollElement = scrollref.value?.$el || scrollref.value?.node || scrollref.value
    if (scrollElement && scrollElement.scrollHeight) {
      const elementScrollTop = scrollElement.scrollTop || scrollTop
      const elementScrollHeight = scrollElement.scrollHeight || scrollHeight
      const elementClientHeight = scrollElement.clientHeight || 0
      // 判断是否滚动到底部（允许10px误差）
      if (elementScrollHeight - elementScrollTop - elementClientHeight <= 10) {
        handlerScrollToLower(e)
        return
      }
    }
    // 当scrollHeight - scrollTop接近scrollWidth时，认为已滚动到底部
    if (scrollHeight - scrollTop <= 1.5 * (scrollWidth || 100)) {
      handlerScrollToLower(e)
    }
  }
}

const handlerScrollToLower = (e) => {
  scrollref.value = e?.target
  if (isRead.value || checked.value) return
  isRead.value = true
}
// 管理协议详情是否展开
const togglePopup = (v) => {
  if (Boolean(v) === show.value) return
  show.value = Boolean(v)
  if (!show.value) return
}
// 点击不同意
const onCancel = () => {
  checked.value = false
  togglePopup(false)
}
// 点击同意
const onConfirm = () => {
  checked.value = true
  togglePopup(false)
}
/* 清除事件 */
const clear = () => {
  onCancel()
}
const openAgreement = (event) => {
  event.stopPropagation()
  togglePopup(true)
}

const handleClose = () => {
  show.value = false
}
</script>
