<template>
  <view class="textarea-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Textarea 文本域</view>
      <view class="header-subtitle">多行文本输入组件</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📝</view>
          <view class="card-title">基础输入</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">默认文本域</view>
            <ky-textarea v-model="defaultValue" placeholder="请输入内容" />
          </view>
          <view class="input-item">
            <view class="input-label">禁用状态</view>
            <ky-textarea v-model="disabledValue" placeholder="禁用状态" disabled />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📏</view>
          <view class="card-title">字数限制</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">带字数统计</view>
            <ky-textarea v-model="wordLimit" placeholder="最多输入100个字符" :maxlength="100" :showWordLimit="true" />
          </view>
          <view class="input-item">
            <view class="input-label">不带字数统计</view>
            <ky-textarea v-model="noWordLimit" placeholder="最多输入50个字符" :maxlength="50" :showWordLimit="false" />
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
            <view class="input-label">显示清除按钮</view>
            <ky-textarea v-model="clearableValue" placeholder="输入后可点击清除" :clearable="true" />
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
            <ky-textarea v-model="errorValue" placeholder="错误状态" :isError="true" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎯</view>
          <view class="card-title">方法调用</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">点击按钮控制</view>
            <ky-textarea ref="textareaRef" v-model="methodValue" placeholder="请输入内容" />
            <view class="action-buttons">
              <ky-button type="primary" size="mini" @click="handleFocus">聚焦</ky-button>
              <ky-button type="default" size="mini" @click="handleBlur">失焦</ky-button>
              <ky-button type="danger" size="mini" @click="handleClear">清空</ky-button>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔧</view>
          <view class="card-title">底部插槽</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">自定义底部区域</view>
            <ky-textarea ref="slotRef" v-model="slotValue" placeholder="粘贴文本或上传图片" customPlaceholder>
              <template #bottom>
                <view class="slot-buttons">
                  <ky-button type="primary" size="mini" @click="handleSlotFocus">聚焦</ky-button>
                  <ky-button type="default" size="mini">粘贴并识别</ky-button>
                </view>
              </template>
            </ky-textarea>
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
            <ky-textarea
              v-model="debounceValue"
              placeholder="输入内容会延迟更新"
              :maxlength="150"
              :inputDebounce="600"
            />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔤</view>
          <view class="card-title">格式化输入</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">转大写</view>
            <ky-textarea
              v-model="upperValue"
              placeholder="输入会自动转为大写"
              :formatter="toUpperCase"
            />
          </view>
          <view class="input-item">
            <view class="input-label">仅允许中文</view>
            <ky-textarea
              v-model="chineseValue"
              placeholder="输入非中文字符会被过滤"
              :formatter="filterChinese"
            />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '../index.scss'

const textareaRef = ref<any>(null)
const slotRef = ref<any>(null)
const defaultValue = ref('')
const disabledValue = ref('')
const wordLimit = ref('')
const noWordLimit = ref('')
const clearableValue = ref('')
const errorValue = ref('')
const methodValue = ref('')
const slotValue = ref('')
const debounceValue = ref('')
const upperValue = ref('')
const chineseValue = ref('')

const toUpperCase = (val: string) => val.toUpperCase()
const filterChinese = (val: string) => val.replace(/[^\u4e00-\u9fa5]/g, '')

const handleFocus = () => {
  textareaRef.value?.focus()
}

const handleBlur = () => {
  textareaRef.value?.blur()
}

const handleClear = () => {
  textareaRef.value?.clear()
}

const handleSlotFocus = () => {
  slotRef.value?.focus()
}
</script>

<style lang="scss">
.ky-textarea {
  border: 2rpx solid #e6e8ed;
  background-color: #f7f8fa;
}
.textarea-demo .input-item {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.textarea-demo .input-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
}

.textarea-demo .action-buttons {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
}

.textarea-demo .slot-buttons {
  display: flex;
  gap: 16rpx;
  padding-top: 16rpx;
}

.textarea-demo .ky-textarea {
  width: 100%;
}
</style>
