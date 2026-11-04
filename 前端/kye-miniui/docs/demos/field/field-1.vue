<template>
  <view class="field-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Field 字段组件</view>
      <view class="header-subtitle">表单输入、展示及校验的基础字段组件</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📝</view>
          <view class="card-title">基础输入</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">普通输入</view>
            <ky-field label="姓名" v-model="basicValue" placeholder="请输入姓名" />
          </view>
          <view class="input-item">
            <view class="input-label">必填字段</view>
            <ky-field label="手机号" :required="true" v-model="requiredValue" placeholder="请输入手机号" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📍</view>
          <view class="card-title">Label 布局</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">顶部标签（默认）</view>
            <ky-field label="邮箱" v-model="labelTop" placeholder="请输入邮箱" />
          </view>
          <view class="input-item">
            <view class="input-label">左侧标签</view>
            <ky-field label="地址" labelPosition="left" :labelWidth="80" v-model="labelLeft" placeholder="请输入地址" />
          </view>
          <view class="input-item">
            <view class="input-label">居中对齐</view>
            <ky-field
              label="居中"
              labelPosition="left"
              labelAlign="center"
              :labelWidth="80"
              v-model="labelCenter"
              placeholder="请输入内容"
            />
          </view>
          <view class="input-item">
            <view class="input-label">右侧对齐</view>
            <ky-field
              label="金额"
              labelPosition="left"
              labelAlign="right"
              :labelWidth="80"
              v-model="labelRight"
              placeholder="请输入金额"
            />
          </view>
        </view>

        <view class="card">
          <view class="card-header">
            <view class="card-icon">✕</view>
            <view class="card-title">状态控制</view>
          </view>
          <view class="card-body">
            <view class="input-item">
              <view class="input-label">禁用状态</view>
              <ky-field label="禁用" disabled v-model="disabledValue" placeholder="禁用状态" />
            </view>
            <view class="input-item">
              <view class="input-label">只读状态</view>
              <ky-field label="只读" readonly v-model="readonlyValue" placeholder="只读状态" />
            </view>
            <view class="input-item">
              <view class="input-label">错误状态</view>
              <ky-field label="错误" :isError="true" v-model="errorValue" placeholder="错误状态" />
            </view>
          </view>
        </view>

        <view class="card">
          <view class="card-header">
            <view class="card-icon">🔧</view>
            <view class="card-title">自定义输入组件</view>
          </view>
          <view class="card-body">
            <view class="input-item">
              <view class="input-label">单选框</view>
              <ky-field labelPosition="left" :required="true" label="单选" :labelWidth="60">
                <template #input>
                  <ky-radio-group v-model="radioValue" direction="horizontal">
                    <ky-radio name="1">选项1</ky-radio>
                    <ky-radio name="2">选项2</ky-radio>
                  </ky-radio-group>
                </template>
              </ky-field>
            </view>
            <view class="input-item">
              <view class="input-label">多选框</view>
              <ky-field labelPosition="left" :required="true" label="多选" :labelWidth="60">
                <template #input>
                  <ky-checkbox-group v-model="checkboxValue" direction="horizontal">
                    <ky-checkbox name="1" type="button">选项1</ky-checkbox>
                    <ky-checkbox name="2" type="button">选项2</ky-checkbox>
                    <ky-checkbox name="3" type="button">选项3</ky-checkbox>
                  </ky-checkbox-group>
                </template>
              </ky-field>
            </view>
            <view class="input-item">
              <view class="input-label">文本域</view>
              <ky-field label="备注" v-model="textareaValue">
                <template #input="{ isError, errorMessage }">
                  <ky-textarea :isError="isError" :placeholder="errorMessage || '请输入备注'" />
                </template>
              </ky-field>
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
              <ky-field label="手机号" v-model="phoneValue" :formatter="formatPhone" placeholder="请输入手机号" />
            </view>
          </view>
        </view>

        <view class="card">
          <view class="card-header">
            <view class="card-icon">🗑️</view>
            <view class="card-title">可清空</view>
          </view>
          <view class="card-body">
            <view class="input-item">
              <view class="input-label">自动清空</view>
              <ky-field label="姓名" clearable v-model="clearableValue" placeholder="请输入姓名" />
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

const basicValue = ref('')
const requiredValue = ref('')
const labelTop = ref('')
const labelLeft = ref('')
const labelCenter = ref('')
const labelRight = ref('')
const disabledValue = ref('')
const readonlyValue = ref('只读内容')
const errorValue = ref('')
const radioValue = ref('')
const checkboxValue = ref([])
const textareaValue = ref('')
const phoneValue = ref('')
const clearableValue = ref('')

const formatPhone = (value: string) => {
  const cleaned = value.replace(/[^\d]/g, '')
  if (cleaned.length >= 4 && cleaned.length < 8) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  } else if (cleaned.length >= 8) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`
  }
  return cleaned
}
</script>

<style lang="scss">
.field-demo .input-item {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.field-demo .input-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
}
</style>
