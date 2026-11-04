<template>
  <view class="popup-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Popup 弹窗</view>
      <view class="header-subtitle">各种弹窗用法示例</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📝</view>
          <view class="card-title">基本用法</view>
        </view>
        <view class="card-body">
          <view class="popup-item">
            <view class="popup-label">基础弹窗</view>
            <ky-button type="primary" size="mini" @click="basicVisible = true">显示弹窗</ky-button>
            <ky-popup v-model:show="basicVisible">
              <view class="popup-content">
                <view class="popup-title">弹窗标题</view>
                <view class="popup-text">这是一个基础弹窗示例</view>
                <ky-button type="primary" size="mini" @click="basicVisible = false">关闭</ky-button>
              </view>
            </ky-popup>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📍</view>
          <view class="card-title">弹出位置</view>
        </view>
        <view class="card-body">
          <view class="position-row">
            <ky-button type="primary" size="mini" @click="showPopup('top')">顶部</ky-button>
            <ky-button type="primary" size="mini" @click="showPopup('bottom')">底部</ky-button>
            <ky-button type="primary" size="mini" @click="showPopup('left')">左侧</ky-button>
            <ky-button type="primary" size="mini" @click="showPopup('right')">右侧</ky-button>
            <ky-button type="primary" size="mini" @click="showPopup('center')">居中</ky-button>
          </view>
          <ky-popup v-model:show="positionVisible" :position="currentPosition">
            <view class="popup-content" :class="`popup-${currentPosition}`">
              <view class="popup-title">{{ positionLabels[currentPosition] }}弹窗</view>
              <view class="popup-text">从{{ positionLabels[currentPosition] }}弹出</view>
              <ky-button type="primary" size="mini" @click="positionVisible = false">关闭</ky-button>
            </view>
          </ky-popup>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✕</view>
          <view class="card-title">点击关闭</view>
        </view>
        <view class="card-body">
          <view class="popup-item">
            <view class="popup-label">点击遮罩关闭（默认）</view>
            <ky-button type="primary" size="mini" @click="closeClickVisible = true">显示弹窗</ky-button>
            <ky-popup v-model:show="closeClickVisible">
              <view class="popup-content">
                <view class="popup-title">点击遮罩关闭</view>
                <view class="popup-text">点击外部遮罩即可关闭弹窗</view>
              </view>
            </ky-popup>
          </view>
          <view class="popup-item">
            <view class="popup-label">禁止点击遮罩关闭</view>
            <ky-button type="primary" size="mini" @click="noCloseVisible = true">显示弹窗</ky-button>
            <ky-popup v-model:show="noCloseVisible" :close-on-click-overlay="false">
              <view class="popup-content">
                <view class="popup-title">禁止点击遮罩关闭</view>
                <view class="popup-text">必须点击按钮才能关闭</view>
                <ky-button type="danger" size="mini" @click="noCloseVisible = false">关闭</ky-button>
              </view>
            </ky-popup>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">圆角样式</view>
        </view>
        <view class="card-body">
          <view class="popup-item">
            <view class="popup-label">带圆角（默认）</view>
            <ky-button type="primary" size="mini" @click="roundVisible = true">显示弹窗</ky-button>
            <ky-popup v-model:show="roundVisible" position="bottom">
              <view class="popup-content">
                <view class="popup-title">带圆角弹窗</view>
                <view class="popup-text">border-radius: 16px</view>
              </view>
            </ky-popup>
          </view>
          <view class="popup-item">
            <view class="popup-label">不带圆角</view>
            <ky-button type="primary" size="mini" @click="noRoundVisible = true">显示弹窗</ky-button>
            <ky-popup v-model:show="noRoundVisible" position="bottom" :round="false">
              <view class="popup-content">
                <view class="popup-title">不带圆角弹窗</view>
                <view class="popup-text">border-radius: 0</view>
              </view>
            </ky-popup>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🛡️</view>
          <view class="card-title">安全区适配</view>
        </view>
        <view class="card-body">
          <view class="popup-item">
            <view class="popup-label">底部安全区</view>
            <ky-button type="primary" size="mini" @click="safeBottomVisible = true">显示弹窗</ky-button>
            <ky-popup v-model:show="safeBottomVisible" position="bottom" safe-area-inset-bottom>
              <view class="popup-content">
                <view class="popup-title">底部安全区适配</view>
                <view class="popup-text">自动适配底部刘海屏</view>
              </view>
            </ky-popup>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✨</view>
          <view class="card-title">自定义样式</view>
        </view>
        <view class="card-body">
          <view class="popup-item">
            <view class="popup-label">自定义宽高</view>
            <ky-button type="primary" size="mini" @click="sizeVisible = true">显示弹窗</ky-button>
            <ky-popup v-model:show="sizeVisible" :content-style="{ width: '300px', height: '200px' }">
              <view class="popup-content">
                <view class="popup-title">固定尺寸弹窗</view>
                <view class="popup-text">width: 300px, height: 200px</view>
              </view>
            </ky-popup>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📡</view>
          <view class="card-title">事件监听</view>
        </view>
        <view class="card-body">
          <view class="popup-item">
            <view class="popup-label">监听弹窗事件</view>
            <ky-button type="primary" size="mini" @click="eventVisible = true">显示弹窗</ky-button>
            <ky-popup
              v-model:show="eventVisible"
              @open="handleOpen"
              @close="handleClose"
              @click-overlay="handleClickOverlay"
            >
              <view class="popup-content">
                <view class="popup-title">事件监听</view>
                <view class="popup-text">打开控制台查看事件日志</view>
              </view>
            </ky-popup>
            <view class="event-logs" v-if="logs.length">
              <view v-for="(log, index) in logs" :key="index" class="event-log"> 📝 {{ log }} </view>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📋</view>
          <view class="card-title">表单场景</view>
        </view>
        <view class="card-body">
          <view class="popup-item">
            <view class="popup-label">底部表单弹窗</view>
            <ky-button type="primary" size="mini" @click="formVisible = true">打开表单</ky-button>
            <ky-popup v-model:show="formVisible" position="bottom">
              <view class="form-content">
                <view class="form-title">表单标题</view>
                <ky-input v-model="formData.name" placeholder="请输入姓名"></ky-input>
                <ky-input v-model="formData.phone" type="number" placeholder="请输入手机号"></ky-input>
                <view class="form-actions">
                  <ky-button size="mini" @click="formVisible = false">取消</ky-button>
                  <ky-button type="primary" size="mini" @click="submitForm">提交</ky-button>
                </view>
              </view>
            </ky-popup>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '../index.scss'

const basicVisible = ref(false)
const positionVisible = ref(false)
const currentPosition = ref('center')
const closeClickVisible = ref(false)
const noCloseVisible = ref(false)
const roundVisible = ref(false)
const noRoundVisible = ref(false)
const safeBottomVisible = ref(false)
const sizeVisible = ref(false)
const eventVisible = ref(false)
const formVisible = ref(false)
const logs = ref<string[]>([])

const positionLabels: Record<string, string> = {
  top: '顶部',
  bottom: '底部',
  left: '左侧',
  right: '右侧',
  center: '居中',
}

const formData = ref({
  name: '',
  phone: '',
})

const showPopup = (pos: string) => {
  currentPosition.value = pos
  positionVisible.value = true
}

const handleOpen = () => {
  logs.value.push('弹窗打开')
  trimLogs()
}

const handleClose = () => {
  logs.value.push('弹窗关闭')
  trimLogs()
}

const handleClickOverlay = () => {
  logs.value.push('点击遮罩')
  trimLogs()
}

const trimLogs = () => {
  if (logs.value.length > 5) {
    logs.value = logs.value.slice(-5)
  }
}

const submitForm = () => {
  console.log('提交表单:', formData.value)
  formVisible.value = false
}
</script>

<style lang="scss">
.popup-demo .popup-item {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.popup-demo .popup-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
}

.popup-demo .position-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.popup-demo .popup-content {
  padding: 32rpx;
  background: #fff;
  min-width: 280px;

  &.popup-top,
  &.popup-bottom {
    min-width: 100%;
  }

  &.popup-left,
  &.popup-right {
    min-height: 200px;
  }
}

.popup-demo .popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.popup-demo .popup-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 24rpx;
}

.popup-demo .form-content {
  padding: 32rpx;
  background: #fff;
}

.popup-demo .form-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
  text-align: center;
}

.popup-demo .form-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.popup-demo .event-logs {
  margin-top: 16rpx;
}

.popup-demo .event-log {
  font-size: 22rpx;
  color: #67c23a;
  padding: 8rpx 12rpx;
  background: #f0f9eb;
  border-radius: 8rpx;
  margin-bottom: 8rpx;
}
</style>
