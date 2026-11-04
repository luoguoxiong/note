<template>
  <div>
    <div
      class="address-unfold-detail-address required-field"
      :class="{ 'address-unfold-detail-address-disabled': disabled }"
      :data-validate="addressConfig.detailAddressDataValidate"
    >
      <SvgIcon class="required" name="required" />
      <ky-field
        :data-validate="addressConfig.detailAddressDataValidate"
        rows="3"
        autosize
        readonly
        :disabled="disabled"
        type="textarea"
        :placeholder="isReceive ? '详细地址（2个字以上，例如**街**号**)' : '详细地址(例如**街**号**)'"
        :value="detailAddress"
        v-keyboard
        :required-tag="false"
        @click="onClickDetailAddress"
      />
      <div v-if="!disabled && addressDetailLocation && !isH5FSEnv" class="right" @click.stop="onClickMapPosition">
        <div class="right__icon"></div>
        <div>定位</div>
      </div>
    </div>
    <div class="address-unfold-detail__error">
      <slot name="errorTips" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 组件
import KyField from '@order-public-sub-public/components/base/ky-field/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

import vKeyboard from '@order-public-sub-public/directives/keyboard'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { computed } from 'vue'
// 类型
import { OrderPageType, pageUseAddress } from '@order-public-sub-public/constants'
import { DisableItem } from '@order-public-sub-public/apis/init/types'
import { useStore } from '@order-public-sub-public/store'
import { isH5FSEnv } from '@/public/utils'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
const { validateObj, removeValidateKey } = globalUseValidate()
const piniaStore = useStore()

const props = defineProps({
  detailAddress: {
    type: String,
    default: '',
  },
  addressDetailLocation: {
    type: Boolean,
    default: false,
  },
  addressConfig: {
    type: Object,
    default: () => ({
      style: '',
      visible: false,
      editable: false,
      required: false,
      defaultValue: '',
      dataValidate: '',
      detailAddressDataValidate: '',
    }),
  },
  usePage: {
    // 是页面来源
    type: String,
    default: '',
  },
})

const emit = defineEmits(['onClickDetailAddress', 'onClickMapPosition'])

// 获取地址禁用信息
const disabledAddressItem = computed((): DisableItem => {
  let disableItem
  // 需要判断来源 如果来源于 【平铺，跳转】【非地址簿】的需要去store里面去取对应的disableItem
  if (([pageUseAddress.SENDERPAGE, pageUseAddress.SENDERUNFOLD] as string[]).includes(props.usePage)) {
    // 来源于寄件人
    disableItem = piniaStore.globalData.returnEditDisableInfo('senderExtraInfo', 'address') || {}
  } else if (([pageUseAddress.RECEIVEPAGE, pageUseAddress.RECEIVEUNFOLD] as string[]).includes(props.usePage)) {
    // 来源于收件人
    disableItem = piniaStore.globalData.returnEditDisableInfo('receiveExtraInfo', 'address') || {}
  } else {
    // 来源于地址簿
    disableItem = { key: '', tips: '' }
  }

  return disableItem
})
const isReceive = computed(() => {
  return [pageUseAddress.RECEIVEUNFOLD, pageUseAddress.RECEIVEPAGE, pageUseAddress.ADDRESSBOOKRECEIVE].includes(
    props.usePage,
  )
})
const disabled = computed(() => {
  return !!disabledAddressItem.value.key
})

const onClickDetailAddress = () => {
  if (!allowEditTip()) {
    return
  }
  emit('onClickDetailAddress')
  removeValidateKey(props.addressConfig.dataValidate)
}

const onClickMapPosition = () => {
  if (!allowEditTip()) {
    return
  }
  emit('onClickMapPosition')
}

const allowEditTip = () => {
  if (disabledAddressItem.value.key) {
    const orderPageType = piniaStore.root.getOrderPageType
    if (orderPageType === OrderPageType.返程单 && !disabledAddressItem.value.tips) {
      return false
    }

    showToast(disabledAddressItem.value.tips || '不可修改')
    return false
  }
  return true
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
