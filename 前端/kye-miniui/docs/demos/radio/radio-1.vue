<template>
  <view class="radio-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Radio 单选框</view>
      <view class="header-subtitle">用于在一组选项中选择单个选项</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📋</view>
          <view class="card-title">基本用法</view>
        </view>
        <view class="card-body">
          <view class="demo-row">
            <view class="demo-label">垂直排列（默认）</view>
            <ky-radio-group v-model="value">
              <ky-radio name="1">选项一</ky-radio>
              <ky-radio name="2">选项二</ky-radio>
              <ky-radio name="3">选项三</ky-radio>
            </ky-radio-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">↔️</view>
          <view class="card-title">排列方向</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">水平排列</view>
            <ky-radio-group v-model="value" direction="horizontal">
              <ky-radio name="1">选项一</ky-radio>
              <ky-radio name="2">选项二</ky-radio>
              <ky-radio name="3">选项三</ky-radio>
            </ky-radio-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">展示类型</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">圆形单选框（默认）</view>
            <ky-radio-group v-model="value" direction="horizontal">
              <ky-radio name="1" type="round">圆形</ky-radio>
              <ky-radio name="2" type="round">圆形</ky-radio>
            </ky-radio-group>
          </view>
          <view class="demo-item">
            <view class="demo-label">勾选框类型</view>
            <ky-radio-group v-model="value" direction="horizontal">
              <ky-radio name="1" type="check">勾选</ky-radio>
              <ky-radio name="2" type="check">勾选</ky-radio>
            </ky-radio-group>
          </view>
          <view class="demo-item">
            <view class="demo-label">按钮类型</view>
            <ky-radio-group v-model="value" direction="horizontal">
              <ky-radio name="1" type="button">按钮</ky-radio>
              <ky-radio name="2" type="button">按钮</ky-radio>
              <ky-radio name="3" type="button">按钮</ky-radio>
            </ky-radio-group>
          </view>
          <view class="demo-item">
            <view class="demo-label">按钮勾选类型</view>
            <ky-radio-group v-model="value" direction="horizontal">
              <ky-radio name="1" type="buttonCheck">按钮勾选</ky-radio>
              <ky-radio name="2" type="buttonCheck">按钮勾选</ky-radio>
            </ky-radio-group>
          </view>
          <view class="demo-item">
            <view class="demo-label">按钮选择类型</view>
            <ky-radio-group v-model="value" direction="horizontal">
              <ky-radio name="1" type="buttonSelect">按钮选择</ky-radio>
              <ky-radio name="2" type="buttonSelect">按钮选择</ky-radio>
            </ky-radio-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📐</view>
          <view class="card-title">尺寸大小</view>
        </view>
        <view class="card-body">
          <view class="size-demo">
            <view class="size-item">
              <view class="size-label">large</view>
              <ky-radio-group v-model="value" size="large">
                <ky-radio name="1">选项</ky-radio>
              </ky-radio-group>
            </view>
            <view class="size-item">
              <view class="size-label">medium</view>
              <ky-radio-group v-model="value" size="medium">
                <ky-radio name="1">选项</ky-radio>
              </ky-radio-group>
            </view>
            <view class="size-item">
              <view class="size-label">normal</view>
              <ky-radio-group v-model="value" size="normal">
                <ky-radio name="1">选项</ky-radio>
              </ky-radio-group>
            </view>
            <view class="size-item">
              <view class="size-label">small</view>
              <ky-radio-group v-model="value" size="small">
                <ky-radio name="1">选项</ky-radio>
              </ky-radio-group>
            </view>
            <view class="size-item">
              <view class="size-label">mini</view>
              <ky-radio-group v-model="value" size="mini">
                <ky-radio name="1">选项</ky-radio>
              </ky-radio-group>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔒</view>
          <view class="card-title">禁用状态</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">禁用整个组</view>
            <ky-radio-group v-model="value" direction="horizontal" disabled>
              <ky-radio name="1">选项一</ky-radio>
              <ky-radio name="2">选项二</ky-radio>
            </ky-radio-group>
          </view>
          <view class="demo-item">
            <view class="demo-label">禁用单个选项</view>
            <ky-radio-group v-model="value" direction="horizontal">
              <ky-radio name="1">选项一</ky-radio>
              <ky-radio name="2" disabled>选项二（禁用）</ky-radio>
            </ky-radio-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⚠️</view>
          <view class="card-title">错误状态</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">错误高亮</view>
            <ky-radio-group v-model="value" direction="horizontal">
              <ky-radio name="1">选项一</ky-radio>
              <ky-radio name="2" is-error>选项二（错误）</ky-radio>
            </ky-radio-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📍</view>
          <view class="card-title">标签位置</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">标签在左侧</view>
            <ky-radio-group v-model="value" direction="horizontal">
              <ky-radio name="1" label-position="left">选项一</ky-radio>
              <ky-radio name="2" label-position="left">选项二</ky-radio>
            </ky-radio-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✨</view>
          <view class="card-title">选中高亮</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">高亮样式</view>
            <ky-radio-group v-model="value" direction="horizontal" checked-highlight>
              <ky-radio name="1">选项一</ky-radio>
              <ky-radio name="2">选项二</ky-radio>
            </ky-radio-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🖼️</view>
          <view class="card-title">自定义图标</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">自定义图标插槽</view>
            <ky-radio-group v-model="value" direction="horizontal">
              <ky-radio name="1">
                <template #icon>
                  <image
                    style="width: 20px; height: 20px"
                    src="https://ic-img.ky-express.com/netc/20230317_2136386928_!!1679035220381_64_64.png"
                    alt=""
                  />
                </template>
                自定义图标一
              </ky-radio>
              <ky-radio name="2">
                <template #icon>
                  <image
                    style="width: 20px; height: 20px"
                    src="https://ic-img.ky-express.com/netc/20230317_26163869242_!!1679035216961_64_64.png"
                    alt=""
                  />
                </template>
                自定义图标二
              </ky-radio>
            </ky-radio-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📊</view>
          <view class="card-title">事件监听</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">选中值: {{ value }}</view>
            <ky-radio-group v-model="value" direction="horizontal" @change="handleChange">
              <ky-radio name="1">选项一</ky-radio>
              <ky-radio name="2">选项二</ky-radio>
              <ky-radio name="3">选项三</ky-radio>
            </ky-radio-group>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import '../index.scss'

const value = ref('1')

const handleChange = (val: any) => {
  console.log('Radio changed:', val)
}
</script>

<style lang="scss">
.radio-demo .demo-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.radio-demo .size-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.radio-demo .size-item {
  flex: 0 0 calc(50% - 12rpx);
}

.radio-demo .size-label {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 8rpx;
}
</style>
