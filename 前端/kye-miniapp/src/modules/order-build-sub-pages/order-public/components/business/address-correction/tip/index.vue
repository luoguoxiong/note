<template>
  <view :class="styles.tip" @click.stop>
    <view :class="styles.content">
      <text :class="styles.text">{{ tipText }}</text>
    </view>
    <view :class="styles.action">
      <view
        :class="[styles.btn, { [styles.btnDisabled]: loading }]"
        @click.stop="onModify"
      >去修改</view>
    </view>
    <view :class="styles.close" @click.stop="$emit('close')"></view>
  </view>
</template>

<script setup lang="ts">
import styles from './index.module.scss'

interface PropsType {
  /** 提醒文案（由父级从地址提醒接口读取后传入） */
  tipText?: string
  /** 完善地址请求中，禁用"去修改"防止重复点击 */
  loading?: boolean
}

const props = withDefaults(defineProps<PropsType>(), {
  tipText: '',
  loading: false,
})

const emit = defineEmits(['modify', 'close'])

const onModify = () => {
  if (props.loading) return
  emit('modify')
}
</script>

<style lang="scss"></style>
