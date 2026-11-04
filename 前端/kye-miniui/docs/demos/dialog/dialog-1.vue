<template>
  <view class="dialog-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Dialog 对话框</view>
      <view class="header-subtitle">各种对话框用法示例</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">💬</view>
          <view class="card-title">基础用法</view>
        </view>
        <view class="card-body">
          <view class="button-item">
            <view class="button-label">组件式调用</view>
            <ky-button type="primary" @click="showBasicDialog = true">打开对话框</ky-button>
          </view>
          <view class="button-item">
            <view class="button-label">函数式调用</view>
            <ky-button type="default" @click="showFuncDialog">函数式弹窗</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔘</view>
          <view class="card-title">按钮配置</view>
        </view>
        <view class="card-body">
          <view class="button-item">
            <view class="button-label">仅确认按钮</view>
            <ky-button type="primary" @click="showConfirmOnly = true">确认弹窗</ky-button>
          </view>
          <view class="button-item">
            <view class="button-label">确认+取消按钮</view>
            <ky-button type="default" @click="showConfirmCancel = true">确认取消</ky-button>
          </view>
          <view class="button-item">
            <view class="button-label">自定义按钮文字</view>
            <ky-button type="danger" @click="showCustomBtn = true">自定义按钮</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">按钮样式</view>
        </view>
        <view class="card-body">
          <view class="button-item">
            <view class="button-label">自定义按钮颜色</view>
            <ky-button type="primary" @click="showCustomColor = true">颜色定制</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎭</view>
          <view class="card-title">自定义内容</view>
        </view>
        <view class="card-body">
          <view class="button-item">
            <view class="button-label">自定义标题和内容</view>
            <ky-button type="default" @click="showCustomContent = true">自定义弹窗</ky-button>
          </view>
          <view class="button-item">
            <view class="button-label">自定义插槽</view>
            <ky-button type="primary" @click="showCustomSlot = true">插槽弹窗</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⏳</view>
          <view class="card-title">加载状态</view>
        </view>
        <view class="card-body">
          <view class="button-item">
            <view class="button-label">确认按钮加载</view>
            <ky-button type="primary" @click="showLoading = true">加载弹窗</ky-button>
          </view>
          <view class="button-item">
            <view class="button-label">函数式 loading 控制</view>
            <ky-button type="default" @click="showFuncLoading">函数式加载</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎯</view>
          <view class="card-title">交互控制</view>
        </view>
        <view class="card-body">
          <view class="button-item">
            <view class="button-label">点击遮罩关闭</view>
            <ky-button type="default" @click="showCloseOverlay = true">遮罩关闭</ky-button>
          </view>
          <view class="button-item">
            <view class="button-label">关闭前回调</view>
            <ky-button type="primary" @click="showBeforeClose = true">关闭回调</ky-button>
          </view>
        </view>
      </view>
    </view>

    <ky-dialog
      v-model:show="showBasicDialog"
      title="提示"
      message="这是一个基础对话框示例"
      @confirm="showBasicDialog = false"
    />

    <ky-dialog
      v-model:show="showConfirmOnly"
      title="提示"
      message="只有确认按钮的对话框"
      :show-cancel-button="false"
      @confirm="showConfirmOnly = false"
    />

    <ky-dialog
      v-model:show="showConfirmCancel"
      title="确认删除"
      message="确定要删除这条记录吗？"
      show-cancel-button
      @confirm="showConfirmCancel = false"
      @cancel="showConfirmCancel = false"
    />

    <ky-dialog
      v-model:show="showCustomBtn"
      title="自定义按钮"
      message="使用自定义按钮文字"
      confirm-button-text="好的"
      cancel-button-text="不了"
      show-cancel-button
      @confirm="showCustomBtn = false"
      @cancel="showCustomBtn = false"
    />

    <ky-dialog
      v-model:show="showCustomColor"
      title="颜色定制"
      message="确认按钮使用自定义颜色"
      confirm-button-color="#ff6b6b"
      cancel-button-color="#6c757d"
      show-cancel-button
      @confirm="showCustomColor = false"
      @cancel="showCustomColor = false"
    />

    <ky-dialog
      v-model:show="showCustomContent"
      title="自定义内容"
      message="这是一段自定义的消息内容，可以包含更多详细信息。"
      @confirm="showCustomContent = false"
    />

    <ky-dialog v-model:show="showCustomSlot">
      <template #title>
        <text class="custom-title">🎁 自定义标题</text>
      </template>
      <template #default>
        <view class="custom-content">
          <view class="custom-icon">🎉</view>
          <view class="custom-text">这是通过插槽自定义的内容区域，可以放置任何组件</view>
        </view>
      </template>
      <template #footer>
        <view class="custom-footer">
          <ky-button type="default" size="small" @click="showCustomSlot = false">取消</ky-button>
          <ky-button type="primary" size="small" @click="showCustomSlot = false">确定</ky-button>
        </view>
      </template>
    </ky-dialog>

    <ky-dialog
      v-model:show="showLoading"
      title="提交中"
      message="正在处理您的请求，请稍候..."
      :confirm-loading="true"
      :show-cancel-button="false"
    />

    <ky-dialog
      v-model:show="showCloseOverlay"
      title="点击遮罩关闭"
      message="点击对话框外部区域即可关闭"
      :close-on-click-overlay="true"
      @confirm="showCloseOverlay = false"
    />

    <ky-dialog
      v-model:show="showBeforeClose"
      title="关闭前回调"
      message="点击确认后会有3秒延迟"
      show-cancel-button
      :before-close="handleBeforeClose"
      @confirm="showBeforeClose = false"
      @cancel="showBeforeClose = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showDialog } from '@ky-miniui-lib/ky-miniui-lib'
import '../index.scss'

const showBasicDialog = ref(false)
const showConfirmOnly = ref(false)
const showConfirmCancel = ref(false)
const showCustomBtn = ref(false)
const showCustomColor = ref(false)
const showCustomContent = ref(false)
const showCustomSlot = ref(false)
const showLoading = ref(false)
const showCloseOverlay = ref(false)
const showBeforeClose = ref(false)

const showFuncDialog = async () => {
  try {
    await showDialog({
      parentClassName: 'demo-container',
      title: '函数式调用',
      message: '通过函数方式打开对话框',
      showCancelButton: true,
      confirm: () => console.log('确认'),
      cancel: () => console.log('取消'),
    })
  } catch (error) {
    console.log('取消', error)
  }
}

const showFuncLoading = async () => {
  try {
    const dialog = showDialog({
      parentClassName: 'demo-container',
      title: '加载示例',
      message: '演示函数式 loading 控制',
      showCancelButton: true,
      useButton: true,
    })

    dialog.showConfirmLoading()
    dialog.showCancelLoading()

    setTimeout(() => {
      dialog.hideConfirmLoading()
      dialog.hideCancelLoading()
    }, 3000)

    await dialog
  } catch (error) {
    console.log('取消', error)
  }
}

const handleBeforeClose = (action: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 3000)
  })
}
</script>

<style lang="scss">
.dialog-demo .button-item {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.dialog-demo .button-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
}

.dialog-demo .custom-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.dialog-demo .custom-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
}

.dialog-demo .custom-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.dialog-demo .custom-text {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  line-height: 1.6;
}

.dialog-demo .custom-footer {
  display: flex;
  gap: 20rpx;
  justify-content: flex-end;
  padding: 16rpx 24rpx;
}
</style>
