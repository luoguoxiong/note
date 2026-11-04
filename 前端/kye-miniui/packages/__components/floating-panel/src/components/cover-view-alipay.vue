<template>
  <component :is="isAlipay ? 'cover-view' : 'view'" v-bind="$attrs">
    <slot>
    </slot>
  </component>
</template>
<script setup lang="ts">
// 环境变量
import { computed, reactive } from 'vue'
import Taro from '@tarojs/taro'

const state = reactive({
  ENV: Taro.getEnv(),
  ENV_TYPE: Taro.ENV_TYPE,
})

const isAlipay = computed(()=>{
  return state.ENV === state.ENV_TYPE.ALIPAY
})
</script>

