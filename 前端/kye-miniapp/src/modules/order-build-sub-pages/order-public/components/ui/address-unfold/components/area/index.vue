<template>
  <div
    class="address-unfold-area"
    @click="onClickArea"
    :class="{ disabled: disabledAddressItem.key, 'required-field': true }"
  >
    <ky-cell
      placeholder=""
      :isLink="!disabledAddressItem.key"
      :data-validate="addressConfig.dataValidate"
      :id="addressConfig.dataValidate?.split('.')?.join('_')"
      :disabled="!addressConfig.editable"
    >
      <template #icon>
        <SvgIcon v-if="true" class="required" name="required" />
      </template>
      <template #title>
        <div
          v-if="areaLength <= 0"
          class="placeholder-text"
          :class="{ 'validate-error': !!popoverConfig?.content }"
        >
          城市/区域
        </div>
        <div v-else class="content">
          <div class="content__value">
            <span :class="{ err: !province }">{{ province || '未选省份' }}</span>
          </div>
          <div class="content__line">/</div>
          <div class="content__value">
            <span :class="{ err: !city }">{{ city || '未选城市' }}</span>
          </div>
          <div class="content__line">/</div>
          <div class="content__value">
            <span :class="{ err: !county }">{{ county || '未选区县' }}</span>
          </div>
        </div>
      </template>
    </ky-cell>
  </div>
</template>

<script setup lang="ts">
// 组件
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
// 类型
import { OrderPageType, pageUseAddress } from '@order-public-sub-public/constants'
import { DisableItem } from '@order-public-sub-public/apis/init/types'
import { updateCommonDisabledScroll } from '@order-public-sub-public/hooks/address/useCommon'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
const piniaStore = useStore()
const { validateObj, removeValidateKey } = globalUseValidate()

const props = defineProps({
  area: {
    type: Array,
    default: () => {
      return []
    },
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
    }),
  },
  usePage: {
    // 是页面来源
    type: String,
    default: '',
  },
})

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

const areaLength = computed(() => props.area.filter((i) => i).length)

const popoverConfig = computed(() => {
  return validateObj[props.addressConfig.dataValidate] || {}
})

const province = computed(() => props.area?.[0])
const city = computed(() => props.area?.[1])
const county = computed(() => props.area?.[2])

const emit = defineEmits(['onClickArea'])

const onClickArea = () => {
  if (disabledAddressItem.value.key) {
    const orderPageType = piniaStore.root.getOrderPageType
    if (orderPageType === OrderPageType.返程单 && !disabledAddressItem.value.tips) {
      return
    }

    showToast(disabledAddressItem.value.tips || '不可修改')
    return
  }
  updateCommonDisabledScroll(true)
  emit('onClickArea')
  removeValidateKey(props.addressConfig.dataValidate)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
