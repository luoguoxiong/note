<template>
  <view class="company-input">
    <view :class="['input-wrapper', errorMsg && 'error']">
      <ky-field
        :model-value="value"
        :prop="prop"
        :rules="rules"
        type="digit"
        :placeholder="errorMsg || '请输入客户编码'"
        :clearable="true"
        @update:model-value="(val) => $emit('update:value', val)"
        @blur="$emit('blur')"
        @focus="$emit('focus')"
        @clear="$emit('clear')"
      />
      <view
        :class="['delete-btn', showDelete && 'delete-icon']"
        @tap.stop="$emit('delete')"
      >
      </view>
      <view v-if="errorMsg" class="error-tooltip">
        <text class="error-text">{{ errorMsg }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import './CompanyInput.scss'
/**
 * 客户编码输入组件
 *
 * 用于申请绑定其他公司表单中的客户编码输入框
 * 支持错误提示、删除按钮、清空功能、ky-form 校验集成
 */
defineProps<{
  value: string
  errorMsg?: string
  showDelete?: boolean
  /** 字段路径（用于 ky-form 校验） */
  prop?: string
  /** 校验规则 */
  rules?: any[]
}>()

defineEmits<{
  (e: 'update:value', value: string): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'delete'): void
  (e: 'clear'): void
}>()
</script>
