<template>
  <view class="qr-empty-state">
    <image class="qr-empty-state__icon" :src="icon" mode="aspectFit" />
    <view class="qr-empty-state__texts">
      <view v-if="title" class="qr-empty-state__title">{{ title }}</view>
      <view class="qr-empty-state__desc">{{ desc }}</view>
    </view>
    <view v-if="buttonText" class="qr-empty-state__btn">
      <ky-button type="primary" size="small" @tap="emit('action')">{{ buttonText }}</ky-button>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  /** 缺省图（280x280） */
  icon: string
  /** 标题（可选，如「内部员工限制提示」） */
  title?: string
  /** 描述文案 */
  desc: string
  /** 按钮文案（不传则无按钮） */
  buttonText?: string
}>()

const emit = defineEmits(['action'])
</script>

<style lang="scss">
.qr-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__icon {
    width: 280px;
    height: 280px;
  }

  &__texts {
    margin-top: 24px; // $gap-24
    width: 452px;
    text-align: center;
  }

  &__title {
    font-size: 28px; // $fs-28
    line-height: 40px; // $lh-40
    font-weight: 600; // $font-bold
    color: #24262b; // $text-color-level1
  }

  &__desc {
    margin-top: 4px; // $gap-4
    font-size: 28px; // $fs-28
    line-height: 40px; // $lh-40
    color: #686b75; // $text-color-level2
  }

  &__btn {
    margin-top: 24px; // $gap-24
  }
}
</style>
