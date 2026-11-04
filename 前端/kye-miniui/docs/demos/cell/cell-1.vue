<template>
  <view class="cell-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Cell 单元格</view>
      <view class="header-subtitle">各种单元格用法示例</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📝</view>
          <view class="card-title">基础用法</view>
        </view>
        <view class="card-body">
          <view class="cell-item">
            <view class="cell-label">基础单元格</view>
            <ky-cell title="标题" placeholder="描述" label="副标题描述" @click="onClick"></ky-cell>
          </view>
          <view class="cell-item">
            <view class="cell-label">带右侧内容</view>
            <ky-cell title="标题" value="右侧内容" label="副标题描述"></ky-cell>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📐</view>
          <view class="card-title">尺寸大小</view>
        </view>
        <view class="card-body">
          <view class="cell-item">
            <view class="cell-label">large 尺寸</view>
            <ky-cell title="标题" value="内容" label="副标题描述" size="large"></ky-cell>
          </view>
          <view class="cell-item">
            <view class="cell-label">normal 尺寸（默认）</view>
            <ky-cell title="标题" value="内容" label="副标题描述" size="normal"></ky-cell>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔗</view>
          <view class="card-title">箭头链接</view>
        </view>
        <view class="card-body">
          <view class="cell-item">
            <view class="cell-label">显示箭头</view>
            <ky-cell title="点击跳转" value="查看详情" is-link></ky-cell>
          </view>
          <view class="cell-item">
            <view class="cell-label">箭头 + 必填</view>
            <ky-cell title="必填项" value="请选择" is-link required></ky-cell>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✦</view>
          <view class="card-title">必填标记</view>
        </view>
        <view class="card-body">
          <view class="cell-item">
            <view class="cell-label">标记在右侧（默认）</view>
            <ky-cell title="标题" value="内容" required></ky-cell>
          </view>
          <view class="cell-item">
            <view class="cell-label">标记在左侧</view>
            <ky-cell title="标题" value="内容" required required-direction="left"></ky-cell>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⚠️</view>
          <view class="card-title">错误状态</view>
        </view>
        <view class="card-body">
          <view class="cell-item">
            <view class="cell-label">错误样式</view>
            <ky-cell title="标题" value="错误内容" is-error></ky-cell>
          </view>
          <view class="cell-item">
            <view class="cell-label">错误 + 箭头 + 必填</view>
            <ky-cell title="标题" label="副标题描述" is-link required is-error>
              <template #value>
                <view style="color: #adb0b8; font-weight: normal">请选择</view>
              </template>
            </ky-cell>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔒</view>
          <view class="card-title">禁用状态</view>
        </view>
        <view class="card-body">
          <view class="cell-item">
            <view class="cell-label">禁用单元格</view>
            <ky-cell title="标题" value="内容" disabled></ky-cell>
          </view>
          <view class="cell-item">
            <view class="cell-label">禁用 + 箭头</view>
            <ky-cell title="标题" value="内容" disabled is-link></ky-cell>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎯</view>
          <view class="card-title">内容对齐</view>
        </view>
        <view class="card-body">
          <view class="cell-item">
            <view class="cell-label">垂直居中（默认）</view>
            <ky-cell title="标题" value="右侧内容" label="副标题描述"></ky-cell>
          </view>
          <view class="cell-item">
            <view class="cell-label">左侧对齐</view>
            <ky-cell title="标题" value="左侧对齐" desc-text-align="left"></ky-cell>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📦</view>
          <view class="card-title">CellGroup 组合</view>
        </view>
        <view class="card-body">
          <view class="cell-item">
            <view class="cell-label">带标题和圆角</view>
            <ky-cell-group title="group 标题" inset>
              <ky-cell title="Title" label="副标题描述" size="large" is-link required>
                <template #value>
                  <view style="color: #adb0b8; font-weight: normal">请选择</view>
                </template>
              </ky-cell>
              <ky-cell
                title="Title"
                value="已输入内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容"
                label="副标题描述"
                size="large"
                is-link
                required
              ></ky-cell>
            </ky-cell-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✨</view>
          <view class="card-title">插槽使用</view>
        </view>
        <view class="card-body">
          <view class="cell-item">
            <view class="cell-label">默认插槽</view>
            <ky-cell>
              <view class="custom-content">自定义内容区域</view>
            </ky-cell>
          </view>
          <view class="cell-item">
            <view class="cell-label">自定义图标和标题</view>
            <ky-cell is-link required>
              <template #icon>
                <img
                  src="https://ic-img.ky-express.com/netc/20230317_26163869242_!!1679035216961_64_64.png"
                  style="width: 40rpx; height: 40rpx"
                />
              </template>
              <template #title>
                <view class="custom-title">
                  <view>自定义title</view>
                </view>
              </template>
              <template #right-icon>
                <img
                  src="https://ic-img.ky-express.com/netc/20230317_2136386928_!!1679035220381_64_64.png"
                  style="width: 40rpx; height: 40rpx"
                />
              </template>
            </ky-cell>
          </view>
          <view class="cell-item">
            <view class="cell-label">底部额外内容</view>
            <ky-cell title="标题" value="内容">
              <template #extra><view class="extra-text">您的xxxxx告警提示，xxxxx提示内容.... </view></template>
            </ky-cell>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">圆角样式</view>
        </view>
        <view class="card-body">
          <view class="cell-item">
            <view class="cell-label">开启圆角</view>
            <ky-cell title="标题" value="内容" inset></ky-cell>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import '../index.scss'

const onClick = (e: Event) => {
  console.log('onClick', e)
}
</script>

<style lang="scss">
.cell-demo .cell-item {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.cell-demo .cell-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
}

.cell-demo .custom-content {
  padding: 20rpx;
  color: #666;
  font-size: 28rpx;
}

.cell-demo .custom-title {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.cell-demo .extra-text {
  font-size: 24rpx;
  color: #f56c6c;
  padding-top: 12rpx;
}
</style>
