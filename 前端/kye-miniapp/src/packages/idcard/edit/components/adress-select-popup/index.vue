<template>
  <ky-popup safe-area-inset-bottom position="bottom" :show="show" is-border-radius @click-overlay="saveAddress">
    <View class="IdcardBaseInfo-address-wrap">
      <!-- header -->
      <View class="IdcardBaseInfo-address-wrap-header">
        <View class="IdcardBaseInfo-address-wrap-header-title">
          <View class="IdcardBaseInfo-address-wrap-header-title-main">公司地址</View>
          <View class="IdcardBaseInfo-address-wrap-header-title-sub">可更换考勤打卡地/总部地址为公司地址</View>
        </View>
        <Image
          class="IdcardBaseInfo-address-wrap-header-img"
          src="https://ic-img.ky-express.com/netc/20250904_42953_!!1756987807075_64_64.png"
          @tap="saveAddress"
        />
      </View>

      <!-- body -->
      <scroll-View scroll-y :scroll-into-view="toView" class="IdcardBaseInfo-address-wrap-body" :style="bodyMaxHeight">
        <!-- 空数据提示 -->
        <View v-if="showNoAddressTip" class="no-customer-address">
          <Image
            class="no-customer-address-img"
            src="https://ic-img.ky-express.com/netc/20250910_93314_!!1757490237569_560_560.png"
          />
          <View class="no-customer-address-text">未设置考勤打卡地址，请联系您的上级设置或使用自定义办公地址</View>
        </View>

        <!-- 地址列表 -->
        <View
          v-for="item in props.companyAddressList"
          :key="item.addressCode"
          :class="['IdcardBaseInfo-address-wrap-body-item', item.addressCode === 'customer' && 'last-item']"
          @click="handleAddressItemClick(item)"
        >
          <Image class="IdcardBaseInfo-address-wrap-body-item-img" :src="getAddressIcon(item)" />

          <View class="IdcardBaseInfo-address-wrap-body-item-text">
            {{ getAddressText(item) }}
          </View>
        </View>

        <!-- 自定义输入 -->
        <View
          class="IdcardBaseInfo-address-wrap-body-input IdcardBaseInfo-address-wrap-body-input-textarea"
          :class="[{ 'IdcardBaseInfo-address-wrap-body-input-textarea-focus': addressFocus }, calHeightClassName]"
          id="input"
        >
          <ky-textarea
            :cursor-spacing="400"
            v-model="customerAddress"
            placeholder="请输入自定义办公地址"
            placeholder-style="font-size: 14px; color: #ADB0B8; font-weight: normal;"
            autosize
            enableNative
            auto-height
            :maxlength="100"
            showWordLimit
            clearable
            @focus="handleFocus"
            @blur="handleBlur"
            @input="handleCustomerAddressInput"
          />
        </View>
        <View id="bottom"></View>
      </scroll-View>

      <!-- 底部按钮 -->
      <View class="IdcardBaseInfo-address-wrap-body-button">
        <button class="IdcardBaseInfo-address-wrap-body-submit" @click="handleSubmit">确定</button>
      </View>
    </View>
  </ky-popup>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, withDefaults, defineExpose, computed } from 'vue'
import Taro from '@tarojs/taro'
import { trackEvent } from '../../edit-report'
import type { Props, AddressItem, AddressData } from './types'

const props = withDefaults(defineProps<Props>(), {
  companyAddressList: () => [],
  initialAddressCode: 'customer',
  initialCustomerAddress: '',
  detail: () => ({ baseInfo: {} }),
})

// 内部状态
const show = ref(false)
const currentAddressCode = ref(props.initialAddressCode)
const customerAddress = ref(props.initialCustomerAddress)
const addressFocus = ref(false)
const keyboardHeight = ref(0)
const toView = ref('')

// 计算属性
const calHeightClassName = computed(() => {
  const length = customerAddress.value.length
  if (length < 45) return ''
  if (length < 70) return 'three-line-height'
  if (length < 90) return 'four-line-height'
  return 'five-line-height'
})

const bodyMaxHeight = computed(() => {
  return { maxHeight: `calc(100vh - 200px - ${keyboardHeight.value}px)` }
})

const showNoAddressTip = computed(() => props.companyAddressList.length < 3)

const getAddressIcon = (item: AddressItem) => {
  return item.addressCode === currentAddressCode.value
    ? 'https://ic-img.ky-express.com/netc/20250904_45796_!!1756989298435_28_28.svg+xml'
    : 'https://ic-img.ky-express.com/netc/20250904_37046_!!1756989317518_28_28.svg+xml'
}

const getAddressText = (item: AddressItem) => {
  return item.addressCode === 'customer' ? '自定义办公地址' : item.address
}

// 监听props变化
watch(
  () => props.initialAddressCode,
  (newVal) => {
    currentAddressCode.value = newVal
  },
)

watch(
  () => props.initialCustomerAddress,
  (newVal) => {
    customerAddress.value = newVal
  },
)

// 方法
const handleAddressItemClick = (item: AddressItem) => {
  currentAddressCode.value = item.addressCode
}

const handleCustomerAddressInput = (value: string) => {
  customerAddress.value = value.replace(/\s/g, '').slice(0, 100)
}

const handleFocus = () => {
  addressFocus.value = true
  trackEvent('clk_sharing_information_edit_input', '公司地址', {
    employee_id: props.detail.baseInfo.hrUserId,
    sales_id: props.detail.baseInfo.hrUserId,
  })
}

const handleBlur = () => {
  keyboardHeight.value = 0
  addressFocus.value = false
  toView.value = 'input'
}

const emits = defineEmits<{
  (e: 'updateAdressInfo', addressData: AddressData): void
}>()

const saveAddress = () => {
  let addressData: AddressData = {
    addressCode: currentAddressCode.value,
    address: '',
  }

  if (currentAddressCode.value === 'customer') {
    addressData.address = customerAddress.value
  } else {
    const selectedAddress = props.companyAddressList.find((item) => item.addressCode === currentAddressCode.value)
    addressData.address = selectedAddress ? selectedAddress.address : ''
  }

  emits('updateAdressInfo', addressData)

  Taro.showToast({
    icon: 'none',
    title: '保存成功',
    duration: 1000,
  })

  close()
}

const handleSubmit = () => {
  Taro.setStorageSync('customerAddress', customerAddress.value)
  saveAddress()

  trackEvent('clk_sharing_information_edit_address_save', '提交', {
    employee_id: props.detail.baseInfo.hrUserId,
    sales_id: props.detail.baseInfo.hrUserId,
  })
}

// 暴露方法
const open = () => {
  show.value = true
  trackEvent('exp_sharing_information_edit_address', 'EXP', {
    employee_id: props.detail.baseInfo.hrUserId,
    sales_id: props.detail.baseInfo.hrUserId,
  })
}

const close = () => {
  show.value = false
}

const getSelectedAddress = (): AddressData => {
  if (currentAddressCode.value === 'customer') {
    return {
      addressCode: currentAddressCode.value,
      address: customerAddress.value,
    }
  } else {
    const selectedAddress = props.companyAddressList.find((item) => item.addressCode === currentAddressCode.value)
    return {
      addressCode: currentAddressCode.value,
      address: selectedAddress ? selectedAddress.address : '',
    }
  }
}

defineExpose({
  open,
  close,
  getSelectedAddress,
})
</script>

<style lang="scss">
@import './index.scss';
</style>
