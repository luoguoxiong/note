<template>
  <div class="sms-input" @click="focus">
    <div class="input-list" :class="{ 'is-focused': focused }">
      <div
        v-for="i in inputLength"
        :key="i"
        class="input-item"
        :class="{
          'is-active':
            focused &&
            ((modelValue.length !== inputLength && i === modelValue.length) ||
              (modelValue.length === inputLength && i === modelValue.length - 1)),
          'error-class': errorState,
        }"
      >
        <template>{{ getChar(i) }}</template>
      </div>
    </div>
    <input
      ref="inputRef"
      class="hidden-input"
      type="tel"
      :value="modelValue"
      :maxlength="inputLength"
      @input="handleInput"
      @keydown="handleKeydown"
      @focus="focused = true"
      @blur="focused = false"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 分格短信验证码输入
 * 来源: netc-pc-web/src/views/layout/switch-login-mobile/components/ky-sms-code/sms-input.vue + custom-input.vue
 * 迁移说明: custom-input 仅使用 format='number' 分支, 此处内联数字过滤(原生 input 替代 el-input), 视觉与交互保持一致
 */
import { computed, ref } from 'vue'

defineOptions({ name: 'SmsInput' })

const props = defineProps<{
  modelValue: string
  maxlength?: number
  errorState?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'resetErrorState'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const focused = ref(false)

/** 分格数 */
const inputLength = computed(() => props.maxlength ?? 6)

/** 获取当前格字符 */
const getChar = (i: number) => `${props.modelValue || ''}`[i] || ''

/** 键盘按下，保证光标始终在末尾 */
const handleKeydown = (e: KeyboardEvent) => {
  const el = e.target as HTMLInputElement
  el.selectionStart = `${el.value || ''}`.length + 1
  el.selectionEnd = `${el.value || ''}`.length + 1
  emit('resetErrorState')
}

/** 数字过滤 */
const handleInput = (e: Event) => {
  const el = e.target as HTMLInputElement
  const value = el.value.replace(/[^\d]/g, '').slice(0, inputLength.value)
  el.value = value
  emit('update:modelValue', value)
}

/** 获得焦点 */
const focus = () => {
  inputRef.value?.focus()
}

defineExpose({
  focus,
})
</script>

<style lang="scss" scoped>
.sms-input {
  position: relative;
  overflow: hidden;

  .input-list {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .input-item {
    width: 48px;
    height: 48px;
    background: #ffffff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 20px;
    font-weight: 600;
    color: #333333;
    line-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-right: 8px;
    padding: 10px;
    box-sizing: border-box;

    &.is-active {
      border-color: #8365f6;
      border-radius: 2px;

      &::after {
        content: '';
        display: block;
        width: 1px;
        height: 22px;
        background: #8365f6;
        animation: 1s cursor-flicker infinite;
      }
    }

    &.error-class {
      border: 1px solid #ff706d;
    }
  }

  .hidden-input {
    opacity: 0;
    width: 1px;
    height: 1px;
    padding: 0;
    border: 0;
    position: absolute;
    z-index: -10;
    left: -100px;
    bottom: -100px;
  }
}

@keyframes cursor-flicker {
  from {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
