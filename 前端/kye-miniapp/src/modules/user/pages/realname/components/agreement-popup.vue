<template>
  <ky-popup
    round
    catchMove
    position="bottom"
    class="agreement-tip-popup"
    :show="show"
    safeAreaInsetBottom
    @click-overlay="onClose"
  >
    <view class="agreement-tip-popup__title">
      <text>温馨提示</text>
      <image
        src="https://ic-img.ky-express.com/netc/20250726_41452_!!1753521106143_64_64.png"
        @tap.stop="onClose"
      />
    </view>
    <view class="agreement-tip-popup__content">
      <view class="agreement-tip-popup__desc">应国家监管要求，寄件人须实名认证，请完善寄件人的实名信息，实名后将减少取货实名时间。我们需要收集您的姓名、证件信息，用于身份认证，我们将严格按照个人信息保护相关法律法规保护您的个人隐私安全，请确认您已知晓并同意提供以上信息</view>
    </view>
    <view class="agreement-tip-popup__footer">
      <ky-button class="agreement-tip-popup__btn" type="primary" @click="onConfirm">
        确认
      </ky-button>
    </view>
  </ky-popup>
</template>

<script setup lang="ts">
interface PropsType {
  show: boolean
}

defineProps<PropsType>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const onClose = () => {
  emit('close')
}

const onConfirm = () => {
  emit('confirm')
}
</script>

<style lang="scss">
.agreement-tip-popup {
  .ky-popup__content {
    border-radius: 24px 24px 0 0;
  }

  &__content {
    padding: 16px 32px 32px;
    text-align: center;
  }

  &__title {
    padding: 26px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e6e8ed;

    text {
      font-size: 34px;
      font-weight: 600;
      line-height: 48px;
      color: #24262b;
    }

    image {
      width: 32px;
      height: 32px;
    }
  }

  &__desc {
    font-size: 28px;
    color: #24262B;
    line-height: 40px;
    text-align: left;
  }

  &__footer {
    padding: 16px 32px;
    border-top: 1px solid #ebedf5;
    box-shadow: 0px -2px 8px 0px rgba(0, 0, 0, 0.05);
  }

  &__btn {
    width: 100%;
    height: 88px;
    border-radius: 16px;
    font-weight: 600;
  }
}
</style>
