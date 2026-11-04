<template>
  <view class="popover-menu-demo demo-container" id="popover-body">
    <view class="demo-header">
      <view class="header-title">PopoverMenu 气泡菜单</view>
      <view class="header-subtitle">用于展示操作菜单列表</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📋</view>
          <view class="card-title">基本用法</view>
        </view>
        <view class="card-body">
          <view class="demo-row">
            <view class="demo-label">默认方式</view>
            <ky-popover-menu listenClickId="popover-body" :menus="basicMenus" @chooseMenu="handleChooseMenu" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📍</view>
          <view class="card-title">弹出位置</view>
        </view>
        <view class="card-body">
          <view class="location-demo">
            <view class="location-item">
              <view class="location-label">底部</view>
              <ky-popover-menu
                listenClickId="popover-body"
                :menus="simpleMenus"
                location="bottom-start"
                @chooseMenu="handleChooseMenu"
              />
            </view>
            <view class="location-item">
              <view class="location-label">顶部</view>
              <ky-popover-menu
                listenClickId="popover-body"
                :menus="simpleMenus"
                location="top-start"
                @chooseMenu="handleChooseMenu"
              />
            </view>
            <view class="location-item">
              <view class="location-label">右侧</view>
              <ky-popover-menu
                listenClickId="popover-body"
                :menus="simpleMenus"
                location="right"
                @chooseMenu="handleChooseMenu"
              />
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">带图标菜单</view>
        </view>
        <view class="card-body">
          <view class="demo-row">
            <view class="demo-label">图标菜单</view>
            <ky-popover-menu listenClickId="popover-body" :menus="iconMenus" @chooseMenu="handleChooseMenu" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✨</view>
          <view class="card-title">自定义触发</view>
        </view>
        <view class="card-body">
          <view class="demo-row">
            <view class="demo-label">自定义按钮</view>
            <ky-popover-menu listenClickId="popover-body" :menus="basicMenus" @chooseMenu="handleChooseMenu">
              <template #reference>
                <view class="custom-trigger">
                  <text>更多选项</text>
                  <text class="arrow">▼</text>
                </view>
              </template>
            </ky-popover-menu>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔘</view>
          <view class="card-title">按钮模式</view>
        </view>
        <view class="card-body">
          <view class="demo-row">
            <view class="demo-label">使用按钮渲染</view>
            <ky-popover-menu
              listenClickId="popover-body"
              :menus="basicMenus"
              use-button
              @chooseMenu="handleChooseMenu"
            />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import '../index.scss'

const basicMenus = ref([
  { label: '取消运单', type: 1 },
  { label: '修改地址', type: 2 },
  { label: '联系客服', type: 3 },
])

const simpleMenus = ref([
  { label: '选项一', type: 1 },
  { label: '选项二', type: 2 },
])

const iconMenus = ref([
  {
    label: '取消运单',
    icon: 'https://ic-img.ky-express.com/netc/20250816_91771_!!1755336867851_96_96.png',
    type: 1,
  },
  { label: '修改地址', type: 2 },
  { label: '联系客服', type: 3 },
])

const handleChooseMenu = (type, menu) => {
  console.log('选择菜单:', type, menu)
}
</script>

<style lang="scss">
.popover-menu-demo .demo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.popover-menu-demo .demo-label {
  font-size: 26rpx;
  color: #666;
}

.popover-menu-demo .location-demo {
  display: flex;
  gap: 30rpx;
}

.popover-menu-demo .location-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.popover-menu-demo .location-label {
  font-size: 24rpx;
  color: #666;
}

.popover-menu-demo .custom-trigger {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 40rpx;
  font-size: 26rpx;

  .arrow {
    font-size: 20rpx;
    transform: scale(0.8);
  }
}
</style>
