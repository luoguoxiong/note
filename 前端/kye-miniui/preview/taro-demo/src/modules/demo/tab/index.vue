<template>
  <view>等比排列</view>
  <ky-tab :tabs="tab1" v-model="activeIndex"></ky-tab>
  <view>左对齐</view>
  <ky-tab :tabs="tab1" v-model="activeIndex" :distributeEvenly="false"></ky-tab>
  <view>带红点</view>
  <ky-tab :tabs="tab3" v-model="activeIndex" :distributeEvenly="false"></ky-tab>
  <view>带数量</view>
  <ky-tab :tabs="tab2" v-model="activeIndex" :distributeEvenly="false"></ky-tab>
  <view>胶囊</view>
  <ky-tab :tabs="tab2" v-model="activeIndex" theme="capsule" :distributeEvenly="false" :capsule="true"></ky-tab>
  <view>dark</view>
  <ky-tab :tabs="tab2" v-model="activeIndex" theme="dark" :distributeEvenly="false" :capsule="true"></ky-tab>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const tab1 = ref([
  {
    label: '选项卡四',
  },
  {
    label: '选项卡五',
  },
  {
    label: '选项卡六',
  },
])

const tab2 = ref([
  {
    label: '选项卡一',
    badgeCount: 100,
  },
  {
    label: '选项卡二',
    badgeCount: 100,
  },
  {
    label: '选项卡三',
    badgeCount: 100,
  },
  {
    label: '选项卡四',
  },
  {
    label: '选项卡五',
  },
  {
    label: '选项卡六',
  },
])

const tab3 = ref([
  {
    label: '选项卡一',
    badgeCount: 100,
    showBadgeDot: true,
  },
  {
    label: '选项卡二',
    badgeCount: 100,
    showBadgeDot: true,
  },
  {
    label: '选项卡三',
    badgeCount: 100,
    showBadgeDot: true,
  },
])

const activeIndex = ref(0) // 当前激活的索引
</script>
