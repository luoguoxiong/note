<template>
  <view class="input-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Input 输入框</view>
      <view class="header-subtitle">各种输入框用法示例</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📝</view>
          <view class="card-title">基础输入</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">默认输入框</view>
            <ky-input v-model="defaultValue" placeholder="请输入内容" />
          </view>
          <view class="input-item">
            <view class="input-label">禁用状态</view>
            <ky-input v-model="disabledValue" placeholder="禁用状态" disabled />
          </view>
          <view class="input-item">
            <view class="input-label">只读状态</view>
            <ky-input v-model="disabledValue" placeholder="禁用状态" readonly />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔤</view>
          <view class="card-title">输入类型</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">文本输入</view>
            <ky-input v-model="textValue" type="text" placeholder="请输入文本" />
          </view>
          <view class="input-item">
            <view class="input-label">数字输入</view>
            <ky-input v-model="numberValue" type="number" placeholder="请输入数字" maxlength="11" />
          </view>
          <view class="input-item">
            <view class="input-label">密码输入</view>
            <ky-input v-model="passwordValue" type="password" password placeholder="请输入密码" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">边框样式</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">全边框（默认）</view>
            <ky-input v-model="borderAll" placeholder="全边框样式" border="all" />
          </view>
          <view class="input-item">
            <view class="input-label">底部边框</view>
            <ky-input v-model="borderBottom" placeholder="底部边框样式" border="bottom" />
          </view>
          <view class="input-item">
            <view class="input-label">无边框</view>
            <ky-input v-model="borderNone" placeholder="无边框样式" border="none" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📐</view>
          <view class="card-title">对齐方式</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">左对齐（默认）</view>
            <ky-input v-model="alignLeft" placeholder="左对齐文本" />
          </view>
          <view class="input-item">
            <view class="input-label">右对齐</view>
            <ky-input v-model="alignRight" placeholder="右对齐文本" text-align="right" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✕</view>
          <view class="card-title">清除按钮</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">聚焦显示清除</view>
            <ky-input v-model="clearFocus" placeholder="聚焦时显示清除按钮" clearable />
          </view>
          <view class="input-item">
            <view class="input-label">始终显示清除</view>
            <ky-input v-model="clearAlways" placeholder="始终显示清除按钮" clearable clear-trigger="always" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📊</view>
          <view class="card-title">字数限制</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">最多输入10个字符</view>
            <ky-input v-model="wordLimit" placeholder="请输入内容" maxlength="10" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✨</view>
          <view class="card-title">格式化输入</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">手机号格式化</view>
            <ky-input v-model="phoneValue" :formatter="formatPhone" placeholder="请输入手机号" maxlength="13" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⚠️</view>
          <view class="card-title">错误状态</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">错误样式</view>
            <ky-input v-model="errorValue" placeholder="错误状态" is-error />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⏱️</view>
          <view class="card-title">输入防抖</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">600ms 节流更新</view>
            <ky-input
              v-model="phoneValue"
              :formatter="formatPhone"
              :inputDebounce="600"
              @blur="(e) => console.log(e.detail.value)"
              placeholder="请输入手机号"
              maxlength="13"
            />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎯</view>
          <view class="card-title">插槽使用</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">左侧插槽</view>
            <ky-input v-model="slotValue" placeholder="请输入用户名">
              <template #left>👤</template>
            </ky-input>
          </view>
          <view class="input-item">
            <view class="input-label">右侧插槽</view>
            <ky-input v-model="slotRight" placeholder="请输入金额">
              <template #right><text class="slot-tip">元</text></template>
            </ky-input>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎮</view>
          <view class="card-title">方法调用</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">点击按钮控制</view>
            <ky-input ref="inputRef" v-model="methodValue" placeholder="请输入内容" />
            <view class="action-buttons">
              <ky-button type="primary" size="mini" @click="handleFocus">聚焦</ky-button>
              <ky-button type="default" size="mini" @click="handleBlur">失焦</ky-button>
              <ky-button type="danger" size="mini" @click="handleClear">清空</ky-button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '../index.scss'

const inputRef = ref<any>(null)
const defaultValue = ref('')
const disabledValue = ref('')
const textValue = ref('')
const numberValue = ref('')
const passwordValue = ref('')
const borderAll = ref('')
const borderBottom = ref('')
const borderNone = ref('')
const alignLeft = ref('')
const alignRight = ref('')
const clearFocus = ref('')
const clearAlways = ref('')
const wordLimit = ref('')
const phoneValue = ref('')
const errorValue = ref('')
const slotValue = ref('')
const slotRight = ref('')
const methodValue = ref('')

const formatPhone = (value: string) => {
  const cleaned = value.replace(/[^\d]/g, '')
  if (cleaned.length >= 4 && cleaned.length < 8) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  } else if (cleaned.length >= 8) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`
  }
  return cleaned
}

const handleFocus = () => {
  inputRef.value?.focus()
}

const handleBlur = () => {
  inputRef.value?.blur()
}

const handleClear = () => {
  inputRef.value?.clear()
}
</script>

<style lang="scss">
.input-demo .input-item {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.input-demo .input-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
}

.input-demo .action-buttons {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
}

.input-demo .slot-tip {
  font-size: 24rpx;
  color: #999;
  padding: 0 8rpx;
}
</style>
