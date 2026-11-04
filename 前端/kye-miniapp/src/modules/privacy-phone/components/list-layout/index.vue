<template>
  <view class="list-layout">
    <view class="list-layout__alert" v-if="alertText">
      <image
        class="alert-icon"
        mode="aspectFit"
        src="https://ic-img.ky-express.com/netc/20251104_40875_!!1762263730041_48_48.png"
      />
      <text class="alert-text">
        {{ alertText }}
      </text>
    </view>

    <ky-empty v-if="isEmpty" />

    <slot v-else />

    <view class="list-layout__footer">
      <ky-button
        :loading="buttonLoading"
        @click="$emit('button-click')"
        style="width: 100%"
        size="large"
        type="primary"
      >
        {{ buttonText }}
      </ky-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import './index.scss'

defineOptions({ name: 'ListPageLayout' })
defineProps({
  alertText: { type: String },
  isEmpty: { type: Boolean },
  buttonText: { type: String, default: '添加' },
  buttonLoading: { type: Boolean, default: false },
})

defineEmits(['button-click'])
</script>
