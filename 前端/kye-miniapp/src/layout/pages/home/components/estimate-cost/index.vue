<template>
  <slot v-if="current" name="value" :value="current">
    <text>{{ current }}</text>
  </slot>
  <view class="estimate-cost__loading" v-else-if="loading">
    <!-- 撑一手行高，避免内容抖动 -->
    loading
    <ky-loading />
  </view>
  <text v-else @tap.stop="handleDecode" style="color: #8365f6">{{ text || '点击查看' }}</text>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from 'vue'
import Taro from '@tarojs/taro'
import { getEstimateCost } from '../../apis'

import './index.scss'

defineOptions({ name: 'estimate-cost' })

const emit = defineEmits(['click'])

const props = defineProps({
  text: String,
  value: [String, Number],
  batchNo: String,

  customRequest: {
    type: Function as PropType<() => Promise<unknown>>,
    required: false,
  },
})
const loading = ref(false)
const estimateCost = ref()

const current = computed(() => {
  return estimateCost.value || props.value
})

const defaultRequest = async () => {
  const { data } = await getEstimateCost({ batchNo: props.batchNo! })
  return data.estimateCost
}

const handleDecode = async () => {
  emit('click')
  if (loading.value || current.value) return

  loading.value = true
  try {
    estimateCost.value = props.customRequest ? await props.customRequest() : await defaultRequest()
  } catch (e) {
    const message = e?.data?.msg || e?.msg || e || '加载失败，请重试'
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>
