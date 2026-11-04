<template>
  <ky-overlay
    :show="show"
    :closeOnClickOverlay="true"
    @click="onCancel"
    :zIndex="9999"
  >
    <view class="share-guide">
      <view class="share-guide__card">
        <image src="https://ic-img.ky-express.com/netc/20250617_36645_!!1750154136175_988_700.png" mode="widthFix" />
      </view>
    </view>
  </ky-overlay>
</template>

<script lang="ts" setup>
import './index.scss'

defineProps<{
  show: boolean
}>()

const emit = defineEmits(['update:show'])

const onCancel = () => {
  emit('update:show', false)
}
</script>
