<template>
  <view class="checkbox-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Checkbox 复选框</view>
      <view class="header-subtitle">各种复选框用法示例</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📦</view>
          <view class="card-title">单独使用</view>
        </view>
        <view class="card-body">
          <view class="checkbox-item">
            <view class="checkbox-label">默认复选框</view>
            <view class="checkbox-row">
              <ky-checkbox name="1" v-model="valSingle">选项一</ky-checkbox>
              <ky-checkbox name="2" v-model="valSingle2">选项二</ky-checkbox>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📋</view>
          <view class="card-title">复选框组</view>
        </view>
        <view class="card-body">
          <view class="checkbox-item">
            <view class="checkbox-label">垂直排列（默认）</view>
            <ky-checkbox-group v-model="val" @change="onChange">
              <ky-checkbox name="1">选项一</ky-checkbox>
              <ky-checkbox name="2">选项二</ky-checkbox>
              <ky-checkbox name="3">选项三</ky-checkbox>
            </ky-checkbox-group>
          </view>
          <view class="checkbox-item">
            <view class="checkbox-label">水平排列</view>
            <ky-checkbox-group v-model="valHorizontal" direction="horizontal" @change="onChange">
              <ky-checkbox name="1">选项一</ky-checkbox>
              <ky-checkbox name="2">选项二</ky-checkbox>
              <ky-checkbox name="3">选项三</ky-checkbox>
            </ky-checkbox-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🚫</view>
          <view class="card-title">禁用状态</view>
        </view>
        <view class="card-body">
          <view class="checkbox-item">
            <view class="checkbox-label">组禁用</view>
            <ky-checkbox-group v-model="valDisabled" @change="onChange" disabled>
              <ky-checkbox name="1">选项一</ky-checkbox>
              <ky-checkbox name="2">选项二</ky-checkbox>
            </ky-checkbox-group>
          </view>
          <view class="checkbox-item">
            <view class="checkbox-label">单个禁用</view>
            <ky-checkbox-group v-model="valSingleDisabled" @change="onChange">
              <ky-checkbox name="1">选项一</ky-checkbox>
              <ky-checkbox name="2" disabled>选项二（禁用）</ky-checkbox>
              <ky-checkbox name="3">选项三</ky-checkbox>
            </ky-checkbox-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">样式类型</view>
        </view>
        <view class="card-body">
          <view class="checkbox-item">
            <view class="checkbox-label">round 类型（默认）</view>
            <ky-checkbox-group v-model="valRound" direction="horizontal" type="round">
              <ky-checkbox name="1">选项一</ky-checkbox>
              <ky-checkbox name="2">选项二</ky-checkbox>
            </ky-checkbox-group>
          </view>
          <view class="checkbox-item">
            <view class="checkbox-label">check 类型</view>
            <ky-checkbox-group v-model="valCheck" direction="horizontal" type="check">
              <ky-checkbox name="1">选项一</ky-checkbox>
              <ky-checkbox name="2">选项二</ky-checkbox>
            </ky-checkbox-group>
          </view>
          <view class="checkbox-item">
            <view class="checkbox-label">button 类型</view>
            <ky-checkbox-group v-model="valButton" direction="horizontal" type="button" checkedHighlight>
              <ky-checkbox name="1">选项一</ky-checkbox>
              <ky-checkbox name="2">选项二</ky-checkbox>
              <ky-checkbox name="3">选项三</ky-checkbox>
            </ky-checkbox-group>
          </view>
          <view class="checkbox-item">
            <view class="checkbox-label">buttonCheck 类型</view>
            <ky-checkbox-group v-model="valButtonCheck" direction="horizontal" type="buttonCheck">
              <ky-checkbox name="1">选项一</ky-checkbox>
              <ky-checkbox name="2">选项二</ky-checkbox>
              <ky-checkbox name="3">选项三</ky-checkbox>
            </ky-checkbox-group>
          </view>
          <view class="checkbox-item">
            <view class="checkbox-label">buttonSelect 类型</view>
            <ky-checkbox-group v-model="valButtonSelect" direction="horizontal" type="buttonSelect">
              <ky-checkbox name="1">选项一</ky-checkbox>
              <ky-checkbox name="2">选项二</ky-checkbox>
              <ky-checkbox name="3">选项三</ky-checkbox>
            </ky-checkbox-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📐</view>
          <view class="card-title">尺寸大小</view>
        </view>
        <view class="card-body">
          <view class="checkbox-item">
            <view class="checkbox-label">large / normal / small</view>
            <ky-checkbox-group v-model="valSize" direction="horizontal">
              <ky-checkbox name="1" size="large">large</ky-checkbox>
              <ky-checkbox name="2" size="normal">normal</ky-checkbox>
              <ky-checkbox name="3" size="small">small</ky-checkbox>
            </ky-checkbox-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⚠️</view>
          <view class="card-title">错误状态</view>
        </view>
        <view class="card-body">
          <view class="checkbox-item">
            <view class="checkbox-label">错误样式</view>
            <ky-checkbox-group v-model="valError" @change="onChange" is-error>
              <ky-checkbox name="1">选项一</ky-checkbox>
              <ky-checkbox name="2">选项二</ky-checkbox>
            </ky-checkbox-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📍</view>
          <view class="card-title">文本位置</view>
        </view>
        <view class="card-body">
          <view class="checkbox-item">
            <view class="checkbox-label">左侧文本</view>
            <ky-checkbox-group v-model="valLabelLeft" direction="horizontal">
              <ky-checkbox name="1" label-position="left">选项一</ky-checkbox>
              <ky-checkbox name="2" label-position="left">选项二</ky-checkbox>
            </ky-checkbox-group>
          </view>
          <view class="checkbox-item">
            <view class="checkbox-label">右侧文本（默认）</view>
            <ky-checkbox-group v-model="valLabelRight" direction="horizontal">
              <ky-checkbox name="1">选项一</ky-checkbox>
              <ky-checkbox name="2">选项二</ky-checkbox>
            </ky-checkbox-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎯</view>
          <view class="card-title">单选模式</view>
        </view>
        <view class="card-body">
          <view class="checkbox-item">
            <view class="checkbox-label">singleMode 单选模式</view>
            <ky-checkbox-group v-model="valSingleMode" @change="onChange" :singleMode="true">
              <ky-checkbox name="1">选项一</ky-checkbox>
              <ky-checkbox name="2">选项二</ky-checkbox>
              <ky-checkbox name="3">选项三</ky-checkbox>
            </ky-checkbox-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🖼️</view>
          <view class="card-title">自定义图标</view>
        </view>
        <view class="card-body">
          <view class="checkbox-item">
            <view class="checkbox-label">自定义图片图标</view>
            <ky-checkbox-group v-model="valCustomIcon" direction="horizontal" type="button">
              <ky-checkbox icon-size="24px" name="1">
                <template #icon="componentItem">
                  <image
                    :src="
                      componentItem.checked
                        ? 'https://ic-img.ky-express.com/netc/20230317_2136386928_!!1679035220381_64_64.png'
                        : 'https://ic-img.ky-express.com/netc/20230317_26163869242_!!1679035216961_64_64.png'
                    "
                    style="width: 28px; height: 28px"
                  />
                </template>
                选项一
              </ky-checkbox>
              <ky-checkbox icon-size="24px" name="2">
                <template #icon="componentItem">
                  <image
                    :src="
                      componentItem.checked
                        ? 'https://ic-img.ky-express.com/netc/20230317_2136386928_!!1679035220381_64_64.png'
                        : 'https://ic-img.ky-express.com/netc/20230317_26163869242_!!1679035216961_64_64.png'
                    "
                    style="width: 28px; height: 28px"
                  />
                </template>
                选项二
              </ky-checkbox>
            </ky-checkbox-group>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎮</view>
          <view class="card-title">方法调用</view>
        </view>
        <view class="card-body">
          <view class="checkbox-item">
            <view class="checkbox-label">全选、取消全选、反选</view>
            <ky-checkbox-group v-model="valMethod" direction="horizontal" ref="checkboxGroupRef">
              <ky-checkbox name="1">选项一</ky-checkbox>
              <ky-checkbox name="2">选项二</ky-checkbox>
              <ky-checkbox name="3">选项三</ky-checkbox>
            </ky-checkbox-group>
            <view class="action-buttons">
              <ky-button type="primary" size="mini" @click="selectAll">全选</ky-button>
              <ky-button type="default" size="mini" @click="cancelAll">取消全选</ky-button>
              <ky-button type="danger" size="mini" @click="reverseAll">反选</ky-button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '../index.scss'

const val = ref(['1'])
const valSingle = ref(true)
const valSingle2 = ref(false)
const valHorizontal = ref(['1'])
const valDisabled = ref(['1'])
const valSingleDisabled = ref(['1'])
const valRound = ref(['1'])
const valCheck = ref(['1'])
const valButton = ref(['1'])
const valButtonCheck = ref(['1'])
const valButtonSelect = ref(['1'])
const valSize = ref(['1'])
const valError = ref(['1'])
const valLabelLeft = ref(['1'])
const valLabelRight = ref(['1'])
const valSingleMode = ref(['1'])
const valCustomIcon = ref(['1'])
const valMethod = ref(['1'])

const checkboxGroupRef = ref(null)

const onChange = (value: any) => {
  console.log('checkbox change', value)
}

const selectAll = () => {
  checkboxGroupRef.value?.toggleAll(true)
}

const cancelAll = () => {
  checkboxGroupRef.value?.toggleAll(false)
}

const reverseAll = () => {
  checkboxGroupRef.value?.toggleReverse()
}
</script>

<style lang="scss">
.checkbox-demo .checkbox-item {
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.checkbox-demo .checkbox-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

.checkbox-demo .checkbox-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.checkbox-demo .action-buttons {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
}
</style>
