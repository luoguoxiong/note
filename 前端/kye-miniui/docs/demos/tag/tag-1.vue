<template>
  <view class="tag-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Tag 标签</view>
      <view class="header-subtitle">用于标记和分类</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">🏷️</view>
          <view class="card-title">基础用法</view>
        </view>
        <view class="card-body">
          <view class="tag-group">
            <ky-tag>默认标签</ky-tag>
            <ky-tag bg-color="#8365F6" text-color="#fff">主题色标签</ky-tag>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📐</view>
          <view class="card-title">不同尺寸</view>
        </view>
        <view class="card-body">
          <view class="size-group">
            <ky-tag size="5" bg-color="#8365F6" text-color="#fff">size: 5</ky-tag>
            <ky-tag size="4" bg-color="#8365F6" text-color="#fff">size: 4</ky-tag>
            <ky-tag size="3" bg-color="#8365F6" text-color="#fff">size: 3</ky-tag>
            <ky-tag size="2" bg-color="#8365F6" text-color="#fff">size: 2</ky-tag>
            <ky-tag size="1" bg-color="#8365F6" text-color="#fff">size: 1</ky-tag>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">预设颜色</view>
        </view>
        <view class="card-body">
          <view class="color-group">
            <ky-tag size="3" bg-color="#8365F6" text-color="#fff">主色</ky-tag>
            <ky-tag size="3" bg-color="#FF9300" text-color="#fff">橙色</ky-tag>
            <ky-tag size="3" bg-color="#FF706D" text-color="#fff">红色</ky-tag>
            <ky-tag size="3" bg-color="#00C58C" text-color="#fff">绿色</ky-tag>
            <ky-tag size="3" bg-color="#57A8F9" text-color="#fff">蓝色</ky-tag>
            <ky-tag size="3" bg-color="#ADB0B8" text-color="#fff">灰色</ky-tag>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✨</view>
          <view class="card-title">朴素标签</view>
        </view>
        <view class="card-body">
          <view class="plain-group">
            <ky-tag size="5" plain text-color="#8365F6">size: 5</ky-tag>
            <ky-tag size="4" plain text-color="#8365F6">size: 4</ky-tag>
            <ky-tag size="3" plain text-color="#8365F6">size: 3</ky-tag>
            <ky-tag size="2" plain text-color="#8365F6">size: 2</ky-tag>
            <ky-tag size="1" plain text-color="#8365F6">size: 1</ky-tag>
          </view>
          <view class="plain-color-group">
            <ky-tag size="3" plain text-color="#FF706D">红色朴素</ky-tag>
            <ky-tag size="3" plain text-color="#00C58C">绿色朴素</ky-tag>
            <ky-tag size="3" plain text-color="#57A8F9">蓝色朴素</ky-tag>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎯</view>
          <view class="card-title">自定义样式</view>
        </view>
        <view class="card-body">
          <view class="custom-group">
            <ky-tag size="3" bg-color="#8365F6" border-color="#8365F6" text-color="#fff">自定义边框</ky-tag>
            <ky-tag size="3" bg-color="#FFF0F0" border-color="#FF706D" text-color="#FF706D">浅红背景</ky-tag>
            <ky-tag size="3" bg-color="#F0FFF4" border-color="#00C58C" text-color="#00C58C">浅绿背景</ky-tag>
            <ky-tag size="3" bg-color="#FFF9E6" border-color="#FF9300" text-color="#FF9300">浅橙背景</ky-tag>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">👁️</view>
          <view class="card-title">显示控制</view>
        </view>
        <view class="card-body">
          <view class="show-group">
            <ky-tag :show="true">显示</ky-tag>
            <ky-tag :show="false">隐藏</ky-tag>
          </view>
          <view class="show-control">
            <ky-button size="mini" type="primary" @click="toggleShow">切换显示</ky-button>
            <ky-tag :show="isShow" size="3" bg-color="#8365F6" text-color="#fff">动态显示</ky-tag>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔗</view>
          <view class="card-title">点击事件</view>
        </view>
        <view class="card-body">
          <view class="click-group">
            <ky-tag size="3" bg-color="#8365F6" text-color="#fff" @click="handleClick">可点击标签</ky-tag>
            <ky-tag size="3" plain text-color="#8365F6" @click="handleClick">朴素点击标签</ky-tag>
          </view>
          <view class="click-result">点击次数：{{ clickCount }}</view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">标签列表</view>
        </view>
        <view class="card-body">
          <view class="tag-list">
            <view class="list-label">状态标签：</view>
            <ky-tag size="3" bg-color="#00C58C" text-color="#fff">已完成</ky-tag>
            <ky-tag size="3" bg-color="#FF9300" text-color="#fff">进行中</ky-tag>
            <ky-tag size="3" bg-color="#FF706D" text-color="#fff">已取消</ky-tag>
          </view>
          <view class="tag-list">
            <view class="list-label">优先级：</view>
            <ky-tag size="3" plain text-color="#FF706D">紧急</ky-tag>
            <ky-tag size="3" plain text-color="#FF9300">高</ky-tag>
            <ky-tag size="3" plain text-color="#57A8F9">中</ky-tag>
            <ky-tag size="3" plain text-color="#ADB0B8">低</ky-tag>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '../index.scss'

const isShow = ref(true)
const clickCount = ref(0)

const toggleShow = () => {
  isShow.value = !isShow.value
}

const handleClick = () => {
  clickCount.value++
}
</script>

<style lang="scss">
.tag-demo .tag-group,
.tag-demo .size-group,
.tag-demo .color-group,
.tag-demo .plain-group,
.tag-demo .plain-color-group,
.tag-demo .custom-group,
.tag-demo .show-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-demo .show-control {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 20rpx;
}

.tag-demo .click-group {
  display: flex;
  gap: 16rpx;
}

.tag-demo .click-result {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #666;
  padding-left: 8rpx;
}

.tag-demo .tag-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.tag-demo .list-label {
  font-size: 26rpx;
  color: #666;
  margin-right: 8rpx;
}
</style>
