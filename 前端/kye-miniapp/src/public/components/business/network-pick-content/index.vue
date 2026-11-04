<template>
  <view>
    <view class="network-pick__body network-pick-new__body">
      <slot name="header"></slot>
      <view class="pick-dots">
        {{ pickupBranchInfo?.name }}
      </view>
      <view v-if="pickupBranchInfo" class="network-pick-address">
        <view class="network-pick-address_detail" @tap="copyText(pickupBranchInfo.address)">
          <view class="network-pick-content">
            <text class="network-pick-label">自提地址：</text>
            <text>{{ pickupBranchInfo.address }}</text>
            <image
              class="network-pick-copy"
              src="https://ic-img.ky-express.com/netc/20230223_74360601277_!!1677141203261_72_72.png"
              alt=""
            />
          </view>
        </view>
        <GoHere
          v-if="!isH5"
          :lng="lnglat.lng"
          :lat="lnglat.lat"
          :distance="pickupBranchInfo.distance"
          :address="pickupBranchInfo.address"
          :branchName="pickupBranchInfo.name"
          :disabled="disabled"
        ></GoHere>
      </view>
      <view class="pick-phone">
        <view class="title">
          <text>自提人手机号</text>
          <!-- <text class="title-required">必填</text> -->
          <image
            mode="aspectFit"
            class="title-required"
            src="https://ic-img.ky-express.com/netc/20250820_31131_!!1755677499178_80_48.png"
            alt=""
          />
        </view>
        <ky-popover location="top-start" :offset="[0, 4]" theme="dark" :show="phonePopoverShow">
          <template #reference>
            <ky-input
              data-popover-key="network-pick-phone"
              v-model="myPhone"
              @input="changePhone"
              @focus="onFocus"
              @blur="onBlur"
              :right-icon="rightIconVisible ? 'clear' : ''"
              @click-right-icon="clearPhone"
              required
              :is-error="!phoneValid"
              type="number"
              :maxlength="11"
              placeholder="请输入"
              :cursor-spacing="190"
              :always-embed="false"
            >
            </ky-input>
          </template>
          <template #content>
            <view class="error-tips-padding">{{
              !Pattern.phone.test(myPhone) && myPhone ? '请输入正确的自提手机号' : '请输入自提手机号'
            }}</view>
          </template>
        </ky-popover>
      </view>
      <view class="tip">
        货物到达提货地址后，跨越速运会向<text class="tip-text">您指定的自提手机号发送提货信息</text>
      </view>
      <Agreement
        :myAgreement="myAgreement"
        :content="content"
        title="《自提风险告知书》"
        popover-message="请先阅读并勾选协议"
        :waybillNumber="waybillNumber"
        :agreementValid="agreementValid"
        @change="changeAgreement"
        @checkedChange="changeChecked"
        :disabled="disabled"
        :agreementPopoverShow="agreementPopoverShow"
      >
      </Agreement>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import Agreement from './components/agreement/index.vue'
import GoHere from './components/go-here/index.vue'
import './index.scss'
// import { checkAgreementCommon } from '@/apis/agreement' // 协议相关接口
import { copyText } from '@public/utils/copy'
import * as Pattern from '../../../utils/pattern'

const isH5 = computed(() => process.env.TARO_ENV === 'h5')

const props = withDefaults(
  defineProps<{
    pickupBranchInfo: object
    waybillNumber: string
    phone: string
    isAgreement: boolean
    phoneValid: boolean
    disabled: boolean
    agreementValid: boolean
    phonePopoverShow: boolean
    agreementPopoverShow: boolean
    content: string
  }>(),
  {
    isAgreement: false,
    phoneValid: true,
    disabled: false,
    agreementValid: true,
    phonePopoverShow: false,
    agreementPopoverShow: false,
    content: '',
  },
)

const emit = defineEmits([
  'update:phone',
  'update:isAgreement',
  'update:phoneValid',
  'update:agreementValid',
  'update:agreementPopoverShow',
  'update:phonePopoverShow',
  'changeChecked',
  
  ,
])

const myPhone = ref('')
const myAgreement = ref(false)
const focusd = ref(false)

const lnglat = computed(() => {
  return props.pickupBranchInfo?.lnglat ?? { lng: 0, lat: 0 }
})

const rightIconVisible = computed(() => {
  return myPhone.value && focusd.value
})

watch(
  () => props.phone,
  (val) => {
    myPhone.value = val
  },
  { immediate: true },
)

watch(
  () => props.isAgreement,
  (val) => {
    myAgreement.value = val
  },
  { immediate: true },
)

const changePhone = (input) => {
  emit('update:phone', input)
  //input不为空可以先移除错误样式
  if (!props.phoneValid && input) {
    emit('update:phoneValid', !input ? false : true)
    emit('update:phonePopoverShow', false)
  }
}
const changeChecked = (val) => {
  emit('changeChecked', val)
}
const clearPhone = () => {
  myPhone.value = ''
  emit('update:phone', '')
}
const changeAgreement = async (checked) => {
  emit('update:isAgreement', checked)
  emit('update:agreementValid', true)
  if (checked) {
    emit('update:agreementPopoverShow', false)
  }
}
const onFocus = () => {
  focusd.value = true
  emit('update:phonePopoverShow', false)
  emit('update:agreementPopoverShow', false)
}
const onBlur = () => {
  setTimeout(() => {
    focusd.value = false
  }, 0)
}
</script>
