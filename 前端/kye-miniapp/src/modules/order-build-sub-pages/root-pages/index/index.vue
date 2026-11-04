<template>
  <view> kye-miniapp-subpackage </view>
</template>

<script>
import { test } from '../../utils/index'
export default {
  onLoad() {
    console.log('params', test())
  },
  setup(parmas) {
    return {}
  },
}
</script>
