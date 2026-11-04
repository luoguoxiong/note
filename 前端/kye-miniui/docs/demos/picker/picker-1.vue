<template>
  <view class="picker-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Picker 选择器</view>
      <view class="header-subtitle">多种选择器用法示例</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📋</view>
          <view class="card-title">基础选择</view>
        </view>
        <view class="card-body">
          <view class="picker-item">
            <view class="picker-label">单列选择</view>
            <view class="picker-value">{{ singleValue.join(' / ') || '请选择' }}</view>
            <ky-button type="primary" size="mini" @click="showSingle = true">选择</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔗</view>
          <view class="card-title">多级联动</view>
        </view>
        <view class="card-body">
          <view class="picker-item">
            <view class="picker-label">省市区三级联动</view>
            <view class="picker-value">{{ cascadeValue.join(' / ') || '请选择' }}</view>
            <ky-button type="primary" size="mini" @click="showCascade = true">选择</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎛️</view>
          <view class="card-title">自定义配置</view>
        </view>
        <view class="card-body">
          <view class="picker-item">
            <view class="picker-label">自定义标题和按钮</view>
            <view class="picker-value">{{ customValue.join(' / ') || '请选择' }}</view>
            <ky-button type="primary" size="mini" @click="showCustom = true">选择</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔘</view>
          <view class="card-title">自定义插槽</view>
        </view>
        <view class="card-body">
          <view class="picker-item">
            <view class="picker-label">自定义底部内容</view>
            <view class="picker-value">{{ slotValue.join(' / ') || '请选择' }}</view>
            <ky-button type="primary" size="mini" @click="showSlot = true">选择</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⏳</view>
          <view class="card-title">加载状态</view>
        </view>
        <view class="card-body">
          <view class="picker-item">
            <view class="picker-label">loading状态展示</view>
            <view class="picker-value">点击查看效果</view>
            <ky-button type="primary" size="mini" @click="showLoading = true">选择</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔓</view>
          <view class="card-title">设置默认值</view>
        </view>
        <view class="card-body">
          <view class="picker-item">
            <view class="picker-label">预设默认选中值</view>
            <view class="picker-value">{{ defaultValue.join(' / ') || '请选择' }}</view>
            <ky-button type="primary" size="mini" @click="showDefault = true">选择</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🖥️</view>
          <view class="card-title">内联模式</view>
        </view>
        <view class="card-body">
          <view class="picker-item">
            <view class="picker-label">poppable=false 直接展示</view>
            <view class="inline-picker">
              <ky-picker
                v-model="inlineValue"
                :poppable="false"
                title="内联选择器"
                :columns="singleColumns"
                @confirm="onInlineConfirm"
              >
                <template #columns-bottom>
                  <view class="inline-footer">
                    <ky-button type="primary" size="mini" @click="onInlineConfirm({ selectedValue: [inlineValue] })"
                      >确认</ky-button
                    >
                  </view>
                </template>
              </ky-picker>
            </view>
          </view>
        </view>
      </view>
    </view>

    <ky-picker
      v-model="singleValue"
      v-model:show="showSingle"
      title="城市选择"
      :columns="singleColumns"
      @confirm="onSingleConfirm"
    ></ky-picker>

    <ky-picker
      v-model="cascadeValue"
      v-model:show="showCascade"
      title="省市区选择"
      :columns="cascadeColumns"
      @confirm="onCascadeConfirm"
    ></ky-picker>

    <ky-picker
      v-model="customValue"
      v-model:show="showCustom"
      title="自定义配置"
      confirm-button-text="确定"
      cancel-button-text="取消"
      :columns="singleColumns"
      @confirm="onCustomConfirm"
    ></ky-picker>

    <ky-picker
      v-model="slotValue"
      v-model:show="showSlot"
      title="自定义插槽"
      :columns="singleColumns"
      @confirm="onSlotConfirm"
    >
      <template #columns-bottom>
        <view class="custom-footer">
          <text class="footer-tip">这是自定义底部内容</text>
        </view>
      </template>
    </ky-picker>

    <ky-picker
      v-model="loadingValue"
      v-model:show="showLoading"
      title="加载中..."
      :loading="true"
      :columns="[]"
    ></ky-picker>

    <ky-picker
      v-model="defaultValue"
      v-model:show="showDefault"
      title="默认值演示"
      :columns="singleColumns"
      @confirm="onDefaultConfirm"
    ></ky-picker>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '../index.scss'

const showSingle = ref(false)
const singleValue = ref([])
const singleColumns = ref([
  { text: '南京', value: '南京' },
  { text: '无锡', value: '无锡' },
  { text: '北京', value: '北京' },
  { text: '上海', value: '上海' },
  { text: '广州', value: '广州' },
  { text: '深圳', value: '深圳' },
])

const showCascade = ref(false)
const cascadeValue = ref([])
const cascadeColumns = ref([
  {
    text: '江苏',
    value: '江苏',
    children: [
      {
        text: '南京',
        value: '南京',
        children: [
          { text: '栖霞区', value: '栖霞区' },
          { text: '鼓楼区', value: '鼓楼区' },
        ],
      },
      {
        text: '苏州',
        value: '苏州',
        children: [
          { text: '姑苏区', value: '姑苏区' },
          { text: '吴江区', value: '吴江区' },
        ],
      },
    ],
  },
  {
    text: '北京',
    value: '北京',
    children: [
      {
        text: '大兴',
        value: '大兴',
        children: [
          { text: '经海路', value: '经海路' },
          { text: '科创路', value: '科创路' },
        ],
      },
      {
        text: '海淀',
        value: '海淀',
        children: [
          { text: '中关村', value: '中关村' },
          { text: '苏州桥', value: '苏州桥' },
        ],
      },
    ],
  },
])

const showCustom = ref(false)
const customValue = ref([])

const showSlot = ref(false)
const slotValue = ref([])

const showLoading = ref(false)
const loadingValue = ref([])

const showDefault = ref(false)
const defaultValue = ref(['北京'])

const inlineValue = ref([])

const onSingleConfirm = ({ selectedValue }) => {
  singleValue.value = selectedValue
}

const onCascadeConfirm = ({ selectedValue }) => {
  cascadeValue.value = selectedValue
}

const onCustomConfirm = ({ selectedValue }) => {
  customValue.value = selectedValue
}

const onSlotConfirm = ({ selectedValue }) => {
  slotValue.value = selectedValue
}

const onDefaultConfirm = ({ selectedValue }) => {
  defaultValue.value = selectedValue
}

const onInlineConfirm = ({ selectedValue }) => {
  inlineValue.value = selectedValue
}
</script>

<style lang="scss">
.picker-demo .picker-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.picker-demo .picker-label {
  font-size: 24rpx;
  color: #666;
  padding-left: 8rpx;
}

.picker-demo .picker-value {
  font-size: 26rpx;
  color: #333;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  min-height: 60rpx;
  display: flex;
  align-items: center;
}

.picker-demo .custom-footer {
  padding: 20rpx;
  text-align: center;
  background: #f5f5f5;
}

.picker-demo .footer-tip {
  font-size: 24rpx;
  color: #999;
}

.picker-demo .inline-picker {
  background: #fff;
  border-radius: 8rpx;
  overflow: hidden;
  border: 1rpx solid #eee;
}

.picker-demo .inline-footer {
  padding: 16rpx;
  text-align: right;
  border-top: 1rpx solid #eee;
}
</style>
