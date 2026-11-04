<template>
  <view class="button-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Button 按钮</view>
      <view class="header-subtitle">各种按钮用法示例</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">按钮类型</view>
        </view>
        <view class="card-body">
          <view class="button-row">
            <ky-button type="primary">primary</ky-button>
            <ky-button type="default">default</ky-button>
            <ky-button type="warning">warning</ky-button>
          </view>
          <view class="button-row">
            <ky-button type="danger">danger</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📐</view>
          <view class="card-title">按钮尺寸</view>
        </view>
        <view class="card-body">
          <view class="button-row">
            <ky-button type="primary" size="large">large</ky-button>
          </view>
          <view class="button-row">
            <ky-button type="primary">normal</ky-button>
            <ky-button type="primary" size="small">small</ky-button>
            <ky-button type="primary" size="mini">mini</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✨</view>
          <view class="card-title">朴素按钮</view>
        </view>
        <view class="card-body">
          <view class="button-row">
            <ky-button type="primary" plain>朴素primary</ky-button>
            <ky-button type="default" plain>朴素default</ky-button>
            <ky-button type="warning" plain>朴素warning</ky-button>
          </view>
          <view class="button-row">
            <ky-button type="danger" plain>朴素danger</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔒</view>
          <view class="card-title">禁用状态</view>
        </view>
        <view class="card-body">
          <view class="button-row">
            <ky-button type="primary" disabled>disabled</ky-button>
            <ky-button type="primary" plain disabled>朴素disabled</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⏳</view>
          <view class="card-title">加载状态</view>
        </view>
        <view class="card-body">
          <view class="button-row">
            <ky-button type="primary" loading>loading</ky-button>
            <ky-button type="primary" loading loading-text="加载中">加载中</ky-button>
            <ky-button type="primary" loading plain>朴素loading</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📷</view>
          <view class="card-title">自定义图标</view>
        </view>
        <view class="card-body">
          <view class="button-row">
            <ky-button type="primary">
              <template #icon>
                <img src="https://ic-img.ky-express.com/netc/20230317_26163869242_!!1679035216961_64_64.png" />
              </template>
              <text>带图标按钮</text>
            </ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🌈</view>
          <view class="card-title">自定义颜色</view>
        </view>
        <view class="card-body">
          <view class="button-row">
            <ky-button color="#7232dd">纯色按钮</ky-button>
            <ky-button color="#7232dd" plain>朴素纯色</ky-button>
          </view>
          <view class="button-row">
            <ky-button color="linear-gradient(to right, #ff6034, #ee0a24)">渐变色</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📏</view>
          <view class="card-title">块级按钮</view>
        </view>
        <view class="card-body">
          <view class="button-row">
            <ky-button type="primary" block>块级按钮</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📱</view>
          <view class="card-title">原生属性</view>
        </view>
        <view class="card-body">
          <view class="button-row">
            <ky-button
              size="mini"
              open-type="getPhoneNumber"
              scope="phoneNumber"
              @getphonenumber="onGetPhoneNumber"
              @error="onError"
              >获取手机号</ky-button
            >
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import '../index.scss'

const onGetPhoneNumber = (e: any) => {
  console.log('onGetPhoneNumber', e)
}

const onError = (e: any) => {
  console.log('onError', e)
}
</script>

<style lang="scss">
.button-demo .card-body {
  padding: 32rpx;
}

.button-demo .button-row {
  display: flex;
  gap: 24rpx;
  margin-bottom: 28rpx;
  flex-wrap: wrap;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
