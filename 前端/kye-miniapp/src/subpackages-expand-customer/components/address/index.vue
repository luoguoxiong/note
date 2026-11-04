<!--
  Address 组件
  企业地址选择
-->
<template>
  <view class="address">
    <view class="form-item">
      <view class="form-item__label">
        <text>企业地址</text>
      </view>
      <view class="form-item__content" @tap="onOpenAddrDialog">
        <input type="text" class="form-item__input" disabled placeholder="请选择企业所在区域" :value="addressText" />
        <image class="icon-arrow" :src="`${IMG_BASE_URL}/expand-customer/icon-arrow.png`"></image>
      </view>
    </view>

    <Dialog :show="addrDialog" title="请选择省市区" :on-close="onCloseAddrDialog">
      <AddrSelect :on-select="onSelect" :selected-address="selectedAddress" />
    </Dialog>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Dialog from '../dialog/index.vue'
import AddrSelect from '../addr-select/index.vue'

defineOptions({ name: 'Address' })

// Props
interface Props {
  onConfirmCb?: (data: any) => void
}

const props = defineProps<Props>()

// 常量
const IMG_BASE_URL = 'https://ic-h5.kye-erp.com/intro/miniprogram'

// 状态
const addrDialog = ref(false)
const addressText = ref('')
const selectedAddress = ref<any>(null)

// 打开省市区
const onOpenAddrDialog = () => {
  addrDialog.value = true
}

// 关闭省市区
const onCloseAddrDialog = () => {
  addrDialog.value = false
}

// 省市区选择完成
const onSelect = (data: any) => {
  selectedAddress.value = data
  addressText.value = `${data.province.districtName} ${data.city.districtName} ${data.area.districtName} ${data.street.districtName}`
  props.onConfirmCb && props.onConfirmCb(data)
  onCloseAddrDialog()
}
</script>

<style lang="scss">
@import './index.scss';
</style>
