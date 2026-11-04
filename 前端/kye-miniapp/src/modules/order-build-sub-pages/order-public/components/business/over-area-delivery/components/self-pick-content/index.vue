<template>
  <div class="network-pick__body">
    <slot name="header"></slot>
    <div v-if="pickupBranchInfo">
      <div class="address-point" v-if="!isBranchSelfPickup">
        <span>{{ pickupBranchInfo.selfLiftingDepot }}</span>
      </div>
      <div class="network-pick-address">
        <div class="network-pick-address_detail">
          <span class="network-pick-content">
            <span class="network-pick-label">自提地址：</span>{{ pickupBranchInfo.selfLiftingAddress }}
            <div @click.stop class="network-copy-address_text">
              <span
                v-copy="pickupBranchInfo.selfLiftingAddress"
                v-click-report="{
                  eventCode: 'clk_express_self_pickup_address_v1',
                  otherParams: () => {
                    return {
                      button_name: '网点地址',
                    }
                  },
                }"
              >
                <SvgIcon v-if="disabled" name="copy-icon-gray" />
                <SvgIcon v-else name="copy-icon" />
              </span>
            </div>
          </span>
        </div>

        <div class="flex">
          <div class="divider"></div>
          <GoHere
            :lng="Number(pickupBranchInfo?.branchLng) || 0"
            :lat="Number(pickupBranchInfo?.branchLat) || 0"
            :distance="pickupBranchInfo.superZoneDistance"
            :address="pickupBranchInfo.selfLiftingAddress"
            :branchName="pickupBranchInfo.selfLiftingDepot"
            :disabled="disabled"
            v-click-report="{
              eventCode: 'clk_express_self_pickup_dist_v1',
              otherParams: () => {
                return {
                  button_name: '网点距离',
                }
              },
            }"
          />
        </div>
      </div>
    </div>
    <div class="phone-label">自提人手机号</div>
    <div @click.stop class="pick-phone" data-validate="pickupBranch.phone" id="pickupBranch_phone">
      <KyInput
        data-validate="pickupBranch.phone"
        v-model.number="myPhone"
        @update:model-value="changePhone"
        :modelValue="phone"
        :no-padding="true"
        :clearable="true"
        :showBorder="true"
        :enableNative="false"
        :enableWxNative="true"
        :always-system="true"
        :always-system-gd="false"
        :disabled="disabled"
        @click-right-icon="clearPhone"
        @blur="onPhoneBlur"
        :cursor-spacing="110"
        :inputDebounce="800"
        type="number"
        :maxlength="11"
        placeholder="请填写自提人手机号"
        :class="['phone-input', !phoneValid ? 'field-item-error' : '', `branch-self-pickup-input`]"
        v-click-report="{
          eventCode: 'clk_express_self_pickup_phone_v1',
          otherParams: () => {
            return {
              button_name: '自提手机',
              pickup_IPhone: phone,
            }
          },
        }"
      />
    </div>
    <div class="network-pick__body-tip"><span>货物到达提货地址后，会向</span>您指定的自提手机号发送提货信息</div>
    <Agreement
      @click.stop
      v-model:value="myAgreement"
      title="《自提风险告知书》"
      popover-message="请先阅读并勾选协议"
      :waybillNumber="waybillNumber"
      :disabled="disabled"
      @change="changeAgreement"
      @agreeContentShow="onAgreementClick"
      @close="onClose"
    >
    </Agreement>
  </div>
</template>

<script setup lang="ts">
import { PropType, getCurrentInstance, ref, onMounted } from 'vue'
import { OverAreaDeliveryDimension } from '@order-public-sub-public/types'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import vCopy from '@order-public-sub-public/directives/copy'
import KyInput from '@order-public-sub-public/components/base/ky-input'
import Agreement from '../agreement/index.vue'
import GoHere from '../go-here/index.vue'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import { receivePhone } from '../../hooks'
import { useKeyboardPopupStyles } from '@order-public-sub-public/hooks/useKeyboardPopupStyles'
import { callCheckAgreementCommon } from '../agreement/hooks'
import { onAgreementClick, onCancelAgreement, onPhoneBlur } from './report'
import { debounce } from 'lodash-es'

const props = defineProps({
  isBranchSelfPickup: {
    //是否时网点自提入口进来的
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    required: true,
  },
  isAgreement: {
    type: Boolean,
    default: false,
  },
  waybillNumber: {
    type: String,
    default: '',
  },
  pickupBranchInfo: {
    type: Object as PropType<OverAreaDeliveryDimension>,
    default: () => ({}),
  },
  inputClass: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: () => {
      return false
    },
  },
})
const emit = defineEmits([
  'update:phone',
  'update:isAgreement',
  'update:phoneValid',
  'changePopupStyles',
  'changesafeAreaBottom',
])
const myPhone = ref('')
const myAgreement = ref(false)
const phoneValid = ref(true)

const mobileSource = ref()

const { popupStyles, safeAreaBottom, handleInputs } = useKeyboardPopupStyles()

const initData = () => {
  // 1.如果表单数据已经有手机号，使用表单手机号做默认值
  console.log('props', props, 'receivePhone', receivePhone.value, 'myPhone', myPhone.value)
  if (props.phone) {
    myPhone.value = props.phone

    // 2. 如果手机号为空，且收方信息有手机号，则使用收方手机号作为默认值
  } else if (receivePhone.value && !myPhone.value) {
    myPhone.value = receivePhone.value
    emit('update:phone', receivePhone.value)
  }
}
onMounted(() => {
  getMobileSource()
  initData()
  handleInputs(`.branch-self-pickup-input`, 'input')
})

const changePhone = debounce((value: number) => {
  closeTippy()
  const input = value + ''
  emit('update:phone', input)
  //input不为空可以先移除错误样式
  if (!input) {
    emit('update:phoneValid', !input ? false : true)
  }
}, 100)
const clearPhone = () => {
  closeTippy()
  myPhone.value = ''
  emit('update:phone', '')
  // emit('update:phoneValid', false)
}

const formatNumber = (val) => {
  const num = String(val || '').replace(/\D+/g, '') // 去掉非数字
  return num === '' ? '' : Number(num)
}

// 移动端请求来源
const getMobileSource = () => {
  const app = getCurrentInstance()
  const native = app?.appContext.config.globalProperties.$native
  native &&
    native.getSource().then((res: any) => {
      mobileSource.value = res.source === 'miniprogram' ? '1' : '0'
    })
}

const handleCopy = () => {}

const changeAgreement = async (checked: boolean) => {
  console.log('changeAgreement checked', checked)

  callCheckAgreementCommon(checked, mobileSource.value)

  emit('update:isAgreement', checked)
  if (!checked) {
    onCancelAgreement()
  }
}

const onClose = () => {
  onCancelAgreement()
}

defineExpose({
  popupStyles,
  safeAreaBottom,
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
