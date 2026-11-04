<template>
  <view class="auth">
    <view v-for="item in authList" :key="item.key" class="auth__item" @click="handleAuth(item)">
      <view class="auth__header">
        <view class="auth__title">{{ item.auth }}</view>

        <view class="auth__action">
          <view class="auth__action-text">
            {{ item.isOpen ? '已开启' : '去设置' }}
          </view>
          <image
            class="auth__action-icon"
            src="https://ic-img.ky-express.com/netc/20260413_9446_!!1776060377686_24_24.svg+xml"
          />
        </view>
      </view>

      <view class="auth__desc">
        {{ item.desc }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { AppPlugin } from '@/public/appPlugins'
import Taro, { useDidShow } from '@tarojs/taro'
import { ref } from 'vue'
import './index.scss'

/**
 * 权限状态
 */
type AppPermissionStatus = '1' | '0' | '-1'

/**
 * 权限类型
 */
type AppPermissionType = 'location' | 'contacts' | 'storage' | 'camera' | 'photo' | 'bluetooth' | 'microphone'

/**
 * 权限项结构
 */
interface AuthItem {
  auth: string
  key: AppPermissionType
  desc: string
  isOpen: boolean
}

/**
 * 权限列表（核心：内置 key，避免映射）
 */
const authList = ref<AuthItem[]>([
  {
    auth: '定位',
    key: 'location',
    desc: '当你填写地址使用当前定位、使用服务网点查询等服务时，我们会向你申请位置权限',
    isOpen: false,
  },
  {
    auth: '通讯录',
    key: 'contacts',
    desc: '当你填写地址使用通讯录信息时，我们会向你申请通讯录权限',
    isOpen: false,
  },
  {
    auth: '存储',
    key: 'storage',
    desc: '当你使用图片识别功能填写地址，上传托寄物图片，保存电子存根和电子回单、使用反馈与投诉等服务，我们会向你申请存储权限',
    isOpen: false,
  },
  {
    auth: '相机',
    key: 'camera',
    desc: '当你使用图片识别功能填写地址，使用人脸识别，上传托寄物图片，使用扫码寄件、查单等功能时，我们会向你申请相机权限',
    isOpen: false,
  },
  {
    auth: '照片',
    key: 'photo',
    desc: '当你使用图片识别功能填写地址，上传托寄物图片，保存电子存根和电子回单、使用反馈与投诉等服务，我们会向你申请照片权限',
    isOpen: false,
  },
  {
    auth: '蓝牙',
    key: 'bluetooth',
    desc: '当你使用运单打印功能时，我们会向你申请蓝牙权限',
    isOpen: false,
  },
  {
    auth: '麦克风',
    key: 'microphone',
    desc: '当你使用语音识别填写地址、小哥对话功能时，我们会向你申请麦克风权限',
    isOpen: false,
  },
])

/**
 * 点击权限项
 */
const handleAuth = (item: AuthItem) => {
  // 已开启就不处理
  if (item.isOpen) {
    Taro.showModal({
      title: '温馨提示',
      content: `当前${item.auth}权限已开启，关闭后将无法提供${item.auth}相关的服务`,
      cancelText: '取消',
      cancelColor: '#686B75',
      confirmText: '前往关闭',
      confirmColor: '#8365F6',
      success(res) {
        if (res.confirm) {
          Taro.openAppAuthorizeSetting({})
        }
      },
    })
  } else {
    Taro.openAppAuthorizeSetting({})
  }
}

/**
 * 更新权限状态
 */
const updatePermissionStatus = async () => {
  try {
    const res = await AppPlugin.permission.getAppPermission()
    authList.value = authList.value.map((item) => ({
      ...item,
      isOpen: `${res[item.key]}` === '1',
    }))
  } catch (err) {
    console.error('获取权限失败', err)
  }
}

/**
 * 页面展示时刷新权限
 */
useDidShow(() => {
  updatePermissionStatus()
})
</script>
