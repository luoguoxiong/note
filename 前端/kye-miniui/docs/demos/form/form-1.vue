<template>
  <view class="form-demo demo-container" id="from-content">
    <view class="demo-header">
      <view class="header-title">Form 表单</view>
      <view class="header-subtitle">表单验证、提交与重置</view>
    </view>

    <view class="demo-content">
      <ky-form ref="formRef" :model-value="formData">
        <view class="card">
          <view class="card-header">
            <view class="card-icon">📝</view>
            <view class="card-title">表单验证</view>
          </view>
          <view class="card-body">
            <view class="input-item">
              <view class="input-label">姓名</view>
              <ky-field
                prop="name"
                v-model="formData.name"
                placeholder="请输入姓名"
                listenClickId="from-content"
                :required="true"
                :rules="[{ required: true, message: '请输入姓名' }]"
              />
            </view>
            <view class="input-item">
              <view class="input-label">手机号</view>
              <ky-field
                prop="tel"
                v-model="formData.tel"
                placeholder="请输入手机号"
                listenClickId="from-content"
                :rules="[
                  { required: true, message: '请输入手机号' },
                  { regex: /^1[3-9]\d{9}$/, message: '请输入正确手机号' },
                ]"
              />
            </view>
            <view class="input-item">
              <view class="input-label">年龄</view>
              <ky-field
                prop="age"
                v-model="formData.age"
                placeholder="请输入年龄"
                listenClickId="from-content"
                :rules="[
                  { required: true, message: '请输入年龄' },
                  { regex: /^(?:[1-9]|[1-9]\d|1[0-9]{2}|200)$/, message: '年龄范围1-200' },
                ]"
              />
            </view>
            <view class="input-item">
              <view class="input-label">性别</view>
              <ky-field
                labelPosition="left"
                prop="sex"
                :rules="[{ required: true, message: '请选择性别' }]"
                v-model="formData.sex"
                listenClickId="from-content"
                :labelWidth="80"
              >
                <template #input="{ isError }">
                  <ky-radio-group :isError="isError" v-model="formData.sex" direction="horizontal">
                    <ky-radio name="1">男</ky-radio>
                    <ky-radio name="2">女</ky-radio>
                  </ky-radio-group>
                </template>
              </ky-field>
            </view>
            <view class="input-item">
              <view class="input-label">爱好</view>
              <ky-field
                labelPosition="left"
                prop="hobby"
                :rules="[{ validator: validateHobby }]"
                v-model="formData.hobby"
                listenClickId="from-content"
                :labelWidth="80"
              >
                <template #input="{ isError }">
                  <ky-checkbox-group :isError="isError" v-model="formData.hobby" direction="horizontal">
                    <ky-checkbox name="1" type="button">篮球</ky-checkbox>
                    <ky-checkbox name="2" type="button">足球</ky-checkbox>
                    <ky-checkbox name="3" type="button">游泳</ky-checkbox>
                  </ky-checkbox-group>
                </template>
              </ky-field>
            </view>
            <view class="input-item">
              <view class="input-label">备注</view>
              <ky-field
                prop="remark"
                v-model="formData.remark"
                :rules="[{ validator: asyncValidate }]"
                listenClickId="from-content"
              >
                <template #input="{ isError }">
                  <ky-textarea :isError="isError" :placeholder="请输入备注" v-model="formData.remark" />
                </template>
              </ky-field>
            </view>
            <view class="form-actions">
              <ky-button type="primary" @click="handleSubmit">提交</ky-button>
              <ky-button @click="handleReset">重置</ky-button>
            </view>
          </view>
        </view>
      </ky-form>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { ref } from 'vue'
import '../index.scss'

const formRef = ref(null)

const formData = ref({
  name: '',
  tel: '',
  age: '',
  sex: '',
  hobby: [],
  remark: '',
})

const validateHobby = (val: string[]) => {
  return new Promise((resolve, reject) => {
    if (val.length === 0) {
      reject('请至少选择一个爱好')
    } else {
      resolve('')
    }
  })
}

const asyncValidate = (val: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (val?.indexOf('test') > -1) {
        reject('包含敏感词')
      } else {
        resolve('')
      }
    }, 300)
  })
}

const handleSubmit = () => {
  formRef.value?.validate().then(({ valid, errors }) => {
    if (valid) {
      Taro.showToast({ title: '验证通过', icon: 'success' })
    } else {
      console.warn('验证失败:', errors)
    }
  })
}

const handleReset = () => {
  formData.value = {
    name: '',
    tel: '',
    age: '',
    sex: '',
    hobby: [],
    remark: '',
  }
  formRef.value?.reset()
}
</script>

<style lang="scss">
.ky-textarea {
  border: 2rpx solid #e6e8ed;
  background-color: #f7f8fa;
}
.form-demo .input-item {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-demo .input-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
}

.form-demo .form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
}
</style>
