<template>
  <view class="tab-header">
    <view class="tab-item" :class="{ active: modelValue === LOGINTYPE.SMSLOGIN }">
      <view class="tab-name" @click="$emit('update:modelValue', LOGINTYPE.SMSLOGIN)">
        短信登录
        <view class="tab-name-undererline"></view>
        <view class="triangle-up" v-show="modelValue === LOGINTYPE.SMSLOGIN"></view>
      </view>
    </view>
    <view class="tab-item" :class="{ active: modelValue === LOGINTYPE.PWDLOGIN }">
      <view class="tab-name" @click="$emit('update:modelValue', LOGINTYPE.PWDLOGIN)">
        密码登录
        <view class="tab-name-undererline"></view>
        <view class="triangle-up" v-show="modelValue === LOGINTYPE.PWDLOGIN"></view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import './index.scss'
import { defineProps, defineEmits } from 'vue'
import { LOGINTYPE } from './index'

defineProps<{
  modelValue: string
}>()

defineEmits(['update:modelValue'])
</script>
