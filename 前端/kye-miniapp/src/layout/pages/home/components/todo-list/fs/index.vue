<template>
  <view class="fs-todo">
    <view class="fs-todo-title">最新运单信息</view>
    <WaybillContent @show-barcode="$emit('show-barcode', $event)" />
  </view>
</template>

<script lang="ts" setup>
import WaybillContent from '../waybill/index.vue'
import './index.scss'
</script>
