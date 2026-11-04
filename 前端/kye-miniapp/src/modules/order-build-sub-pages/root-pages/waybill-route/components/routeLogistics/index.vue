<template>
  <view class="logistics">
    <view class="logistics-item" v-for="(item, index) in routeList" :key="item.date + index">
      <view class="logistics-item-state">
        {{ item.nodeName }}
        <image :src="item.iconImageUrl" mode="scaleToFill" :class="['state-image', item.icon]" />
      </view>
      <view class="logistics-item-info">
        <view class="time">
          <text class="time-text">{{ item.date }}</text>
          <view class="city">{{ item.city }}</view>
        </view>
        <view class="desc">{{ item.desc }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { ref, computed } from 'vue'
import { nodeIcons } from '../../constant'

const routeList = computed(() => {
  return routeData.value.map((item) => {
    return {
      ...item,
      iconImageUrl: nodeIcons[item.icon],
    }
  })
})

const routeData = ref([
  {
    nodeName: '运输中',
    nodeStatus: 1,
    nodeColour: 0,
    date: '2025-01-16 15:07:35',
    desc: '快件已到达【宝安机场分拨二区SS】，准备分拣',
    icon: 'node-end',
    nodeCode: null,
    timeQuantum: null,
    driverMobile: null,
    phoneFlag: null,
    city: '珠海市',
    county: '香洲区',
  },
  {
    nodeName: '',
    nodeStatus: 1,
    nodeColour: 0,
    date: '2025-01-16 15:07:19',
    desc: '快件已离开【秦皇岛福海和平二级中转场_测试别名】',
    icon: 'node-process',
    nodeCode: null,
    timeQuantum: null,
    driverMobile: null,
    phoneFlag: null,
    city: '秦皇岛市',
    county: '北戴河新区',
  },
  {
    nodeName: '',
    nodeStatus: 1,
    nodeColour: 0,
    date: '2025-01-16 15:05:33',
    desc: '快件在【秦皇岛福海和平二级中转场_测试别名】装车，即将送往【宝安机场分拨二区SS】',
    icon: 'node-process',
    nodeCode: null,
    timeQuantum: null,
    driverMobile: null,
    phoneFlag: null,
    city: '秦皇岛市',
    county: '北戴河新区',
  },
  {
    nodeName: '',
    nodeStatus: 1,
    nodeColour: 0,
    date: '2025-01-16 15:03:23',
    desc: '快件已在【秦皇岛福海和平二级中转场_测试别名】完成分拣，准备中转',
    icon: 'node-process',
    nodeCode: null,
    timeQuantum: null,
    driverMobile: null,
    phoneFlag: null,
    city: '秦皇岛市',
    county: '北戴河新区',
  },
  {
    nodeName: '',
    nodeStatus: 1,
    nodeColour: 0,
    date: '2025-01-16 15:03:11',
    desc: '先充钱后下单思密达',
    icon: 'node-process',
    nodeCode: null,
    timeQuantum: null,
    driverMobile: null,
    phoneFlag: null,
    city: '秦皇岛市',
    county: '北戴河新区',
  },
  {
    nodeName: '',
    nodeStatus: 1,
    nodeColour: 0,
    date: '2025-01-16 15:03:09',
    desc: '快件在【秦皇岛福海和平二级中转场_测试别名】装车，即将送往【宝安机场分拨二区SS】',
    icon: 'node-process',
    nodeCode: null,
    timeQuantum: null,
    driverMobile: null,
    phoneFlag: null,
    city: '秦皇岛市',
    county: '北戴河新区',
  },
  {
    nodeName: '已揽件',
    nodeStatus: 1,
    nodeColour: 0,
    date: '2025-01-16 15:02:20',
    desc: '快件已由跨越速运揽件完毕！',
    icon: 'node-process',
    nodeCode: null,
    timeQuantum: null,
    driverMobile: null,
    phoneFlag: null,
    city: '深圳市',
    county: '宝安区',
  },
  {
    nodeName: '待揽件',
    nodeStatus: 1,
    nodeColour: 0,
    date: '2025-01-16 14:54:59',
    desc: '取货员已到客户处，待揽件！',
    icon: 'node-process',
    nodeCode: null,
    timeQuantum: null,
    driverMobile: null,
    phoneFlag: null,
    city: '深圳市',
    county: '宝安区',
  },
  {
    nodeName: '',
    nodeStatus: 1,
    nodeColour: 0,
    date: '2025-01-16 14:54:51',
    desc: '已安排肖茂春-培训专用勿动前往客户处取货，车牌号：川EPZ4N30',
    icon: 'node-start',
    nodeCode: null,
    timeQuantum: null,
    driverMobile: null,
    phoneFlag: null,
    city: '深圳市',
    county: '宝安区',
  },
])
</script>
