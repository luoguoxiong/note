<template>
  <view class="text-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Text 文本</view>
      <view class="header-subtitle">各种文本用法示例</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📝</view>
          <view class="card-title">基础文本</view>
        </view>
        <view class="card-body">
          <view class="text-item">
            <view class="text-label">默认文本</view>
            <view class="text-content">
              <ky-text>这是默认样式的文本内容</ky-text>
            </view>
          </view>
          <view class="text-item">
            <view class="text-label">可选中文本</view>
            <view class="text-content">
              <ky-text selectable>这段文本可以被选中复制</ky-text>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔤</view>
          <view class="card-title">标题类型</view>
        </view>
        <view class="card-body">
          <view class="text-item">
            <view class="text-label">尺寸1 - 最大标题</view>
            <view class="text-content">
              <ky-text type="title" size="1">标题尺寸1</ky-text>
            </view>
          </view>
          <view class="text-item">
            <view class="text-label">尺寸2 - 大标题</view>
            <view class="text-content">
              <ky-text type="title" size="2">标题尺寸2</ky-text>
            </view>
          </view>
          <view class="text-item">
            <view class="text-label">尺寸3 - 中标题</view>
            <view class="text-content">
              <ky-text type="title" size="3">标题尺寸3</ky-text>
            </view>
          </view>
          <view class="text-item">
            <view class="text-label">尺寸4 - 小标题</view>
            <view class="text-content">
              <ky-text type="title" size="4">标题尺寸4</ky-text>
            </view>
          </view>
          <view class="text-item">
            <view class="text-label">尺寸5 - 最小标题</view>
            <view class="text-content">
              <ky-text type="title" size="5">标题尺寸5</ky-text>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📄</view>
          <view class="card-title">正文类型</view>
        </view>
        <view class="card-body">
          <view class="text-item">
            <view class="text-label">尺寸1 - 大正文</view>
            <view class="text-content">
              <ky-text type="main" size="1">正文尺寸1</ky-text>
            </view>
          </view>
          <view class="text-item">
            <view class="text-label">尺寸2 - 中正文</view>
            <view class="text-content">
              <ky-text type="main" size="2">正文尺寸2</ky-text>
            </view>
          </view>
          <view class="text-item">
            <view class="text-label">尺寸3 - 默认正文</view>
            <view class="text-content">
              <ky-text type="main" size="3">正文尺寸3</ky-text>
            </view>
          </view>
          <view class="text-item">
            <view class="text-label">尺寸4 - 小正文</view>
            <view class="text-content">
              <ky-text type="main" size="4">正文尺寸4</ky-text>
            </view>
          </view>
          <view class="text-item">
            <view class="text-label">尺寸5 - 最小正文</view>
            <view class="text-content">
              <ky-text type="main" size="5">正文尺寸5</ky-text>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✂️</view>
          <view class="card-title">溢出处理</view>
        </view>
        <view class="card-body">
          <view class="text-item">
            <view class="text-label">修剪（clip）</view>
            <view class="text-content">
              <ky-text overflow="clip" :max-lines="1">
                修剪文本：修剪文本修剪文本修剪文本修剪文本修剪文本修剪文本修剪文本修剪文本
              </ky-text>
            </view>
          </view>
          <view class="text-item">
            <view class="text-label">淡出（fade）</view>
            <view class="text-content">
              <ky-text overflow="fade" :max-lines="1">
                淡出文本：淡出淡出淡出淡出淡出淡出淡出淡出淡出淡出淡出淡出淡出淡出淡出
              </ky-text>
            </view>
          </view>
          <view class="text-item">
            <view class="text-label">省略号（ellipsis）- 单行</view>
            <view class="text-content">
              <ky-text overflow="ellipsis" :max-lines="1">
                省略号文本：显示省略号显示省略号显示省略号显示省略号显示省略号显示省略号
              </ky-text>
            </view>
          </view>
          <view class="text-item">
            <view class="text-label">省略号（ellipsis）- 多行</view>
            <view class="text-content">
              <ky-text overflow="ellipsis" :max-lines="2">
                多行省略号：显示省略号显示省略号显示省略号显示省略号显示省略号显示省略号显示省略号显示省略号显示省略号显示省略号显示省略号显示省略号显示省略号显示省略号
              </ky-text>
            </view>
          </view>
          <view class="text-item">
            <view class="text-label">不截断（visible）</view>
            <view class="text-content">
              <ky-text overflow="visible" :max-lines="1">
                不截断文本：文本不截断文本不截断文本不截断文本不截断文本不截断
              </ky-text>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">组合使用</view>
        </view>
        <view class="card-body">
          <view class="text-item">
            <view class="text-label">标题 + 溢出处理</view>
            <view class="text-content">
              <ky-text type="title" size="2" overflow="ellipsis" :max-lines="1">
                这是一个较长的标题文本，当超过一行时会显示省略号
              </ky-text>
            </view>
          </view>
          <view class="text-item">
            <view class="text-label">正文 + 可选中</view>
            <view class="text-content">
              <ky-text type="main" size="3" selectable> 这段正文文本可以被用户选中和复制 </ky-text>
            </view>
          </view>
          <view class="text-item">
            <view class="text-label">小正文 + 多行省略</view>
            <view class="text-content">
              <ky-text type="main" size="4" overflow="ellipsis" :max-lines="3">
                这是一段使用小正文样式的文本，设置了多行省略效果。当文本内容超过三行时，超出部分会被省略号代替，保持页面布局整洁。
              </ky-text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import '../index.scss'
</script>

<style lang="scss">
.text-demo .text-item {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.text-demo .text-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
}

.text-demo .text-content {
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}
</style>
