<template>
  <view class="popover-demo demo-container" id="popover-body">
    <view class="demo-header">
      <view class="header-title">Popover 气泡弹出框</view>
      <view class="header-subtitle">用于展示提示信息或操作菜单</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📍</view>
          <view class="card-title">基础用法</view>
        </view>
        <view class="card-body">
          <view class="popover-item">
            <view class="popover-label">点击显示气泡</view>
            <view class="popover-demo">
              <ky-popover listenClickId="popover-body" v-model:show="showBasic" location="bottom">
                <template #reference>
                  <ky-button type="primary" @click="showBasic = !showBasic">点击触发</ky-button>
                </template>
                <template #content>
                  <view class="popover-content">这是气泡内容区域</view>
                </template>
              </ky-popover>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎯</view>
          <view class="card-title">位置选择</view>
        </view>
        <view class="card-body">
          <view class="location-grid">
            <view class="location-item" v-for="loc in locations" :key="loc">
              <ky-popover listenClickId="popover-body" theme="dark" v-model:show="showLocations[loc]" :location="loc">
                <template #reference>
                  <ky-button size="mini" type="default" plain @click="toggleLocation(loc)">
                    {{ loc }}
                  </ky-button>
                </template>
                <template #content>
                  <view class="popover-content">{{ loc }} 位置</view>
                </template>
              </ky-popover>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">主题样式</view>
        </view>
        <view class="card-body">
          <view class="theme-row">
            <view class="theme-item" v-for="theme in themes" :key="theme">
              <ky-popover
                listenClickId="popover-body"
                v-model:show="showThemes[theme]"
                :theme="theme"
                location="bottom"
              >
                <template #reference>
                  <ky-button
                    :type="theme === 'warning' ? 'warning' : theme === 'error' ? 'danger' : 'default'"
                    size="small"
                    @click="toggleTheme(theme)"
                  >
                    {{ theme }}
                  </ky-button>
                </template>
                <template #content>
                  <view class="popover-content">{{ theme }} 主题</view>
                </template>
              </ky-popover>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎭</view>
          <view class="card-title">动画效果</view>
        </view>
        <view class="card-body">
          <view class="animation-row">
            <view class="animation-item">
              <view class="animation-label">淡入动画</view>
              <ky-popover listenClickId="popover-body" v-model:show="showFade" animation="fade" location="bottom">
                <template #reference>
                  <view class="trigger-btn" @click="showFade = !showFade">fade</view>
                </template>
                <template #content>
                  <view class="popover-content">淡入效果</view>
                </template>
              </ky-popover>
            </view>
            <view class="animation-item">
              <view class="animation-label">弹跳动画</view>
              <ky-popover listenClickId="popover-body" v-model:show="showBounce" animation="bounce" location="bottom">
                <template #reference>
                  <view class="trigger-btn" @click="showBounce = !showBounce">bounce</view>
                </template>
                <template #content>
                  <view class="popover-content">弹跳效果</view>
                </template>
              </ky-popover>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📐</view>
          <view class="card-title">偏移设置</view>
        </view>
        <view class="card-body">
          <view class="offset-row">
            <view class="offset-item">
              <view class="offset-label">默认偏移</view>
              <ky-popover listenClickId="popover-body" v-model:show="showOffset1" :offset="[0, 10]" location="bottom">
                <template #reference>
                  <view class="trigger-btn" @click="showOffset1 = !showOffset1">默认</view>
                </template>
                <template #content>
                  <view class="popover-content">默认偏移 [0, 10]</view>
                </template>
              </ky-popover>
            </view>
            <view class="offset-item">
              <view class="offset-label">增大偏移</view>
              <ky-popover listenClickId="popover-body" v-model:show="showOffset2" :offset="[20, 30]" location="bottom">
                <template #reference>
                  <view class="trigger-btn" @click="showOffset2 = !showOffset2">偏移</view>
                </template>
                <template #content>
                  <view class="popover-content">增大偏移 [20, 30]</view>
                </template>
              </ky-popover>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📌</view>
          <view class="card-title">箭头控制</view>
        </view>
        <view class="card-body">
          <view class="arrow-row">
            <view class="arrow-item">
              <view class="arrow-label">显示箭头</view>
              <ky-popover
                listenClickId="popover-body"
                v-model:show="showArrow1"
                theme="dark"
                :showArrow="true"
                location="bottom"
              >
                <template #reference>
                  <view class="trigger-btn" @click="showArrow1 = !showArrow1">显示</view>
                </template>
                <template #content>
                  <view class="popover-content">带箭头气泡</view>
                </template>
              </ky-popover>
            </view>
            <view class="arrow-item">
              <view class="arrow-label">隐藏箭头</view>
              <ky-popover
                listenClickId="popover-body"
                v-model:show="showArrow2"
                :showArrow="false"
                theme="dark"
                location="bottom"
              >
                <template #reference>
                  <view class="trigger-btn" @click="showArrow2 = !showArrow2">隐藏</view>
                </template>
                <template #content>
                  <view class="popover-content">无箭头气泡</view>
                </template>
              </ky-popover>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📝</view>
          <view class="card-title">自定义内容</view>
        </view>
        <view class="card-body">
          <view class="custom-item">
            <view class="custom-label">复杂内容示例</view>
            <ky-popover listenClickId="popover-body" v-model:show="showCustom" location="right">
              <template #reference>
                <view class="trigger-btn" @click="showCustom = !showCustom">点击查看</view>
              </template>
              <template #content>
                <view class="custom-content">
                  <view class="custom-title">操作提示</view>
                  <view class="custom-desc">因运单信息变更，请重新核对声明价值</view>
                  <view class="custom-actions">
                    <view class="custom-btn confirm">确认</view>
                    <view class="custom-btn cancel">取消</view>
                  </view>
                </view>
              </template>
            </ky-popover>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import '../index.scss'

const showBasic = ref(false)

const locations = [
  'top',
  'bottom',
  'left',
  'right',
  'top-start',
  'top-end',
  'bottom-start',
  'bottom-end',
  'left-start',
  'left-end',
  'right-start',
  'right-end',
]

const showLocations = reactive(Object.fromEntries(locations.map((loc) => [loc, false])))

const toggleLocation = (loc: string) => {
  showLocations[loc] = !showLocations[loc]
}

const themes = ['light', 'dark', 'warning', 'error']
const showThemes = reactive(Object.fromEntries(themes.map((theme) => [theme, false])))

const toggleTheme = (theme: string) => {
  showThemes[theme] = !showThemes[theme]
}

const showFade = ref(false)
const showBounce = ref(false)

const showOffset1 = ref(false)
const showOffset2 = ref(false)

const showArrow1 = ref(false)
const showArrow2 = ref(false)

const showCustom = ref(false)
</script>

<style lang="scss">
.popover-demo .popover-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.popover-demo .popover-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.popover-demo .popover-content-wrap {
  display: flex;
  justify-content: center;
}

.popover-demo .trigger-btn {
  padding: 20rpx 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  text-align: center;
}

.popover-demo .location-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
  justify-content: flex-start;
}

.popover-demo .location-item {
  display: inline;
  flex-shrink: 0;
}

.popover-demo .theme-row {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
}

.popover-demo .theme-item {
  flex-shrink: 0;
}

.popover-demo .theme-btn {
  width: 100%;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  text-align: center;
  color: #fff;

  &.theme-light {
    background: #fff;
    color: #333;
    border: 1rpx solid #e0e0e0;
  }

  &.theme-dark {
    background: #333;
  }

  &.theme-warning {
    background: #ff9800;
  }

  &.theme-error {
    background: #f44336;
  }
}

.popover-demo .animation-row {
  display: flex;
  gap: 30rpx;
}

.popover-demo .animation-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.popover-demo .animation-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.popover-demo .offset-row {
  display: flex;
  gap: 30rpx;
}

.popover-demo .offset-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.popover-demo .offset-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.popover-demo .arrow-row {
  display: flex;
  gap: 30rpx;
}

.popover-demo .arrow-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.popover-demo .arrow-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.popover-demo .custom-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.popover-demo .custom-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.popover-demo .custom-content {
  padding: 24rpx;
  min-width: 280rpx;
}

.popover-demo .custom-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.popover-demo .custom-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 20rpx;
  line-height: 1.5;
}

.popover-demo .custom-actions {
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
}

.popover-demo .custom-btn {
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  font-size: 24rpx;

  &.confirm {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }

  &.cancel {
    background: #f5f5f5;
    color: #666;
  }
}
</style>
