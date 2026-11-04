<template>
  <view class="empty-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Empty 空状态</view>
      <view class="header-subtitle">用于展示各种空状态场景</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📄</view>
          <view class="card-title">基本使用</view>
        </view>
        <view class="card-body">
          <view class="empty-item">
            <ky-empty description="暂无数据" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">预设类型</view>
        </view>
        <view class="card-body">
          <view class="empty-grid">
            <view class="empty-item">
              <ky-empty type="error" description="出错了，请稍后重试" />
            </view>
            <view class="empty-item">
              <ky-empty type="network" description="网络连接失败" />
            </view>
            <view class="empty-item">
              <ky-empty type="search" description="暂无搜索结果" />
            </view>
            <view class="empty-item">
              <ky-empty type="list" description="暂无数据" />
            </view>
            <view class="empty-item">
              <ky-empty type="address" description="暂无地址信息" />
            </view>
            <view class="empty-item">
              <ky-empty type="coupon" description="暂无优惠券" />
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📐</view>
          <view class="card-title">自定义尺寸</view>
        </view>
        <view class="card-body">
          <view class="empty-grid">
            <view class="empty-item">
              <ky-empty type="search" description="默认尺寸" />
            </view>
            <view class="empty-item">
              <ky-empty type="search" image-size="60" description="image-size='60'" />
            </view>
            <view class="empty-item">
              <ky-empty type="search" image-size="100" description="image-size='100'" />
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🖼️</view>
          <view class="card-title">自定义图片</view>
        </view>
        <view class="card-body">
          <view class="empty-item">
            <ky-empty
              type="https://ic-img.ky-express.com/netc/20241101_37921882348_!!1730428324141_112_112.png"
              image-size="50"
              description="运单签收时间已超过6个月暂不支持查询"
            ></ky-empty>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✨</view>
          <view class="card-title">插槽使用</view>
        </view>
        <view class="card-body">
          <view class="empty-grid">
            <view class="empty-item">
              <ky-empty description="自定义图片">
                <template #image>
                  <view class="custom-image">📷</view>
                </template>
              </ky-empty>
            </view>
            <view class="empty-item">
              <ky-empty type="search">
                <template #description>
                  <text class="custom-desc">没有找到相关结果</text>
                </template>
              </ky-empty>
            </view>
            <view class="empty-item">
              <ky-empty type="search" description="暂无数据">
                <view class="action-area">
                  <ky-button type="primary" plain @click="handleClick">刷新重试</ky-button>
                </view>
              </ky-empty>
            </view>
            <view class="empty-item">
              <ky-empty>
                <template #image>
                  <view class="custom-image large">🎯</view>
                </template>
                <template #description>
                  <text>自定义空状态</text>
                </template>
                <view class="action-area">
                  <ky-button type="primary">立即添加</ky-button>
                </view>
              </ky-empty>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import '../index.scss'

const handleClick = () => {
  console.log('empty click')
}
</script>

<style lang="scss">
.empty-demo .empty-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.empty-demo .empty-item {
  width: calc(50% - 10rpx);
  box-sizing: border-box;

  &:nth-child(1n) {
    width: 100%;
  }
}

.empty-demo .empty-grid .empty-item {
  width: calc(50% - 10rpx);
}

.empty-demo .empty-grid .empty-item:nth-child(3n) {
  width: 100%;
}

.empty-demo .action-area {
  margin-top: 20rpx;
  text-align: center;
}

.empty-demo .custom-image {
  font-size: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;

  &.large {
    font-size: 100rpx;
  }
}

.empty-demo .custom-desc {
  color: #8365f6;
}
</style>
