<template>
  <view class="search-drawer-item">
    <!-- <view class="search-drawer-item-cell">
      <view class="search-drawer-item-cell-title">角色</view>
      <view class="search-drawer-item-cell-content">
        <ky-checkbox-group
          v-model="val"
          direction="horizontal"
          type="buttonSelect"
          @change="onChange"
          ref="checkboxGroupRef"
        >
          <ky-checkbox name="1" @click="onClick">option 1</ky-checkbox>
          <ky-checkbox name="2" @click="onClick">option 2</ky-checkbox>
          <ky-checkbox name="3" @click="onClick" disabled>option 3</ky-checkbox>
        </ky-checkbox-group>
      </view>
    </view> -->
    <!-- <view class="search-drawer-item-cell">
      <view class="search-drawer-item-cell-title">付款公司</view>
      <view class="search-drawer-item-cell-content"><ky-input placeholder="请输入付款公司名称"></ky-input></view>
    </view> -->
    <view class="search-drawer-item-cell">
      <view class="search-drawer-item-cell-title">收件信息</view>
      <view class="search-drawer-item-cell-content">
        <ky-input placeholder="收件人信息"></ky-input>
        <ky-input placeholder="收件人手机号"></ky-input>
      </view>
    </view>
    <view class="search-drawer-item-cell">
      <view class="search-drawer-item-cell-title">签收日期</view>
      <view class="search-drawer-item-cell-content">
        <view class="search-drawer-item-cell-date">
          <view class="start-date">开始时间</view>
          <view class="search-drawer-item-cell-date-split">-</view>
          <view class="end-date">结束时间</view>
        </view>
      </view>
    </view>
    <view class="search-drawer-item-cell">
      <view class="search-drawer-item-cell-title">签收日期</view>
      <view class="search-drawer-item-cell-content">
        <view class="search-drawer-item-cell-input">
          <view class="search-drawer-item-cell-input-item"><ky-input placeholder="收件人信息"></ky-input></view>
          <view class="search-drawer-item-cell-input-item">1</view>
          <view class="search-drawer-item-cell-input-item full-width">1</view>
          <view class="search-drawer-item-cell-input-item">1</view>
          <view class="search-drawer-item-cell-input-item">1</view>
        </view>
      </view>
    </view>
    <template v-for="item in searchDrawerItems" :key="item.key">
      <!-- checkbox -->
      <view class="search-drawer-item-cell" v-if="item.type === 'checkbox'">
        <view class="search-drawer-item-cell-title">{{ item.title }}</view>
        <view class="search-drawer-item-cell-content">
          <ky-checkbox-group
            v-model="val"
            direction="horizontal"
            type="buttonSelect"
            @change="onChange"
            ref="checkboxGroupRef"
          >
            <ky-checkbox name="1" @click="onClick">option 1</ky-checkbox>
            <ky-checkbox name="2" @click="onClick">option 2</ky-checkbox>
            <ky-checkbox name="3" @click="onClick" disabled>option 3</ky-checkbox>
          </ky-checkbox-group>
        </view>
      </view>
      <!-- calendar -->
      <view class="search-drawer-item-cell" v-if="item.type === 'calendar'">
        <view class="search-drawer-item-cell-title">签收日期</view>
        <view class="search-drawer-item-cell-content">
          <view class="search-drawer-item-cell-date">
            <view class="start-date">开始时间</view>
            <view class="search-drawer-item-cell-date-split">-</view>
            <view class="end-date">结束时间</view>
          </view>
        </view>
      </view>
      <!-- input -->
      <view class="search-drawer-item-cell" v-if="item.type === 'input'">
        <view class="search-drawer-item-cell-title">签收日期</view>
        <view class="search-drawer-item-cell-content">
          <view class="search-drawer-item-cell-input">
            <view class="search-drawer-item-cell-input-item"><ky-input placeholder="收件人信息"></ky-input></view>
            <view class="search-drawer-item-cell-input-item">1</view>
            <view class="search-drawer-item-cell-input-item full-width">1</view>
            <view class="search-drawer-item-cell-input-item">1</view>
            <view class="search-drawer-item-cell-input-item">1</view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './index.scss'

const props = defineProps<{
  searchDrawerItems: any[]
}>()

const val = ref(['1'])

const onChange = (value: any) => {
  console.log('checkbox-1 change demo', value, val.value)
}

const onClick = (name, e) => {
  console.log('onClick', name, e)
}
</script>
