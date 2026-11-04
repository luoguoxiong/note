<template>
  <view class="phone-input-wrap">
    <view v-if="isError && !isFocus" class="phone-input--tooltip">
      <span class="phone-input--tooltip-content">请输入正确的手机号</span>
      <span class="phone-input--tooltip-arrow"></span>
    </view>
    <Input
      :class="['phone-input', isFocus && 'phone-input--focus', isError && !isFocus && 'phone-input--error']"
      type="number"
      :focus="isFocus"
      :cursorSpacing="120"
      :maxlength="13"
      :value="showPhone"
      @input="handleInput"
      @focus="isFocus = true"
      @blur="handleBlur"
    ></Input>
    <view :class="['phone-input--clear', isFocus && 'phone-input--clear-focus']" @tap="handleClear">
      <Image
        v-if="showPhone && isFocus"
        class="phone-input--clear-icon"
        src="https://ic-img.ky-express.com/netc/20251011_31218_!!1760151081459_56_56.png"
      ></Image>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { PhoneInputProps } from './type'

const props = withDefaults(defineProps<PhoneInputProps>(), {
  phone: '',
  isError: false,
})

const emits = defineEmits(['onChange', 'onBlur', 'onClear'])

const isFocus = ref(true)
const showPhone = ref('')

const formatPhone = (phoneNum) => {
  const digits = phoneNum.replace(/\D/g, '') // 只保留数字
  let formatted = ''
  if (digits.length <= 3) {
    formatted = digits
  } else if (digits.length <= 7) {
    formatted = `${digits.slice(0, 3)} ${digits.slice(3)}`
  } else {
    formatted = `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`
  }
  console.log('formatted', formatted)
  return formatted
}

watch(
  () => props.phone,
  (newVal) => {
    const formatted = formatPhone(newVal)
    showPhone.value = formatted
    isFocus.value = true
  },
  { immediate: true },
)

const handleBlur = (e) => {
  isFocus.value = false
  emits('onBlur', e)
}

const handleInput = (e) => {
  const value = e.detail.value.replace(/\D/g, '').slice(0, 11)
  emits('onChange', value)
}

const handleClear = () => {
  emits('onClear')
}
</script>

<style lang="scss">
@import './index.scss';
</style>
