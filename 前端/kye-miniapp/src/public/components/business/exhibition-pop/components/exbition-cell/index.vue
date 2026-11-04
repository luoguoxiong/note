<template>
  <view>
    <ky-cell @click="handleClick" class="exbition">
      <template #title v-if="title || label">
        <text>{{ title || label }}</text>
      </template>
      <view class="value-box">
        <text class="value-content" v-if="value">{{ value }}</text>
        <text class="placeholder-content" v-if="!value">{{ placeholder }}</text>
        <image
          class="value-box-img"
          src="https://ic-img.ky-express.com/netc/20250614_68122_!!1749882915771_64_64.png"
        ></image>
      </view>
    </ky-cell>
  </view>
</template>
<script lang="ts" setup>
import Taro from '@tarojs/taro'
import './index.scss'

const props = withDefaults(
  defineProps<{
    title: string
    label: string
    value: string
    placeholder: string
  }>(),
  {
    title: '',
    label: '',
    value: '',
    placeholder: '请选择收件地址展馆号',
  }
)

const emit = defineEmits(['handleClick'])

const handleClick = () => {
  emit('handleClick')
}
</script>
