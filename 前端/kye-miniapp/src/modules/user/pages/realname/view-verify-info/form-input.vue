<template>
  <div class="form-input__container">
    <div class="form-label">{{ formLabel }}</div>
    <div class="input-container">
      <span class="value">{{ calcValue }}</span>
      <i v-if="hasEye" :class="['eye-icon', isOpenEye && 'is-open']" @click="handleToggle"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value?: string | number
    maskValue?: string | number
    hasEye?: boolean
    formLabel?: string
  }>(),
  {
    hasEye: true,
  },
)

const isOpenEye = ref(false)

const calcValue = computed(() => (isOpenEye.value ? props.value : props.maskValue))

const handleToggle = () => {
  isOpenEye.value = !isOpenEye.value
}
</script>

<style lang="scss">
.form-input {
  &__container {
    margin-bottom: 24px;
    .form-label {
      display: flex;
      align-items: center;
      font-size: 28px;
      font-weight: normal;
      line-height: 40px;
      color: #24262b;
      margin-bottom: 4px;

      &:after {
        content: '';
        width: 40px;
        height: 24px;
        margin-left: 4px;
        background: url('https://ic-img.ky-express.com/netc/20251125_85651_!!1764053762476_22_14.svg+xml') no-repeat
          center;
        background-size: 100% 100%;
      }
    }
    .input-container {
      height: 64px;
      border-radius: 12px;
      opacity: 1;
      padding: 12px 16px;
      background: #f2f3f7;
      box-sizing: border-box;
      border: 2px solid #e6e8ed;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .value {
        font-size: 28px;
        font-weight: 600;
        line-height: 40px;
        letter-spacing: 0px;
        color: #8c8f99;
        flex: 1;
      }
      .eye-icon {
        width: 34px;
        height: 34px;
        background: url('https://ic-img.ky-express.com/netc/20251224_98528_!!1766576886332_14_14.svg+xml') no-repeat;
        background-size: 34px 34px;
        &.is-open {
          background: url('https://ic-img.ky-express.com/netc/20251224_51215_!!1766576852874_14_14.svg+xml') no-repeat;
          background-size: 34px 34px;
        }
      }
    }
  }
}
</style>
