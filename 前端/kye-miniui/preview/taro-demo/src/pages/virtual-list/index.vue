<template>
  <view class="list-content">
    <ListVirtual
      ref="waybillSearchListRef"
      :fetch="fetchList"
      :getKey="getItemKey"
      :itemSpace="8"
      :overscan="5"
      :scrollViewProps="{ scrollY: true }"
    >
      <!-- 渲染多节点复杂结构 -->
      <template #default="{ data }">
        <!-- height: data.height + 'px', -->
        <view
          class="virtual-list-item"
          :style="{
            height: '210px',
            padding: '16px 0',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }"
        >
          <!-- 标题行 -->
          <view style="font-weight: bold; font-size: 28rpx; margin-bottom: 8px">
            {{ data.title }}
          </view>

          <!-- 副标题 + 标签 -->
          <view style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
            <text style="font-size: 24rpx; color: #666">{{ data.subtitle }}</text>
            <view
              :style="{
                background: data.status === '已完成' ? '#52c41a' : '#faad14',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '22rpx',
              }"
              @tap="() => handleClick(data)"
            >
              {{ data.status }}
            </view>
          </view>
          <input placeholder="输入框1placeholder" />
          <input placeholder="输入框2placeholder" />
          <input placeholder="输入框3placeholder" />
          <!-- 描述 -->
          <view style="font-size: 24rpx; color: #999; line-height: 1.4">
            {{ data.description }}
          </view>

          <!-- 底部信息 -->
          <view style="margin-top: auto; display: flex; justify-content: space-between; align-items: center">
            <text style="font-size: 22rpx; color: #aaa">{{ data.time }}</text>
            <button
              size="mini"
              style="background: #1677ff; color: #fff; border-radius: 8px; font-size: 22rpx; padding: 4px 12px"
            >
              查看详情
            </button>
          </view>
        </view>
      </template>

      <template #empty>
        <view style="font-size: 18rpx"> 默认展示近60天数据，可筛选查询近1年内运单 </view>
      </template>
      <template #finished>
        <view style="font-size: 18rpx"> 可筛选查询近1年内运单, 去筛选 </view>
      </template>
    </ListVirtual>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ListVirtual } from '@ky-miniui-lib/ky-miniui-lib'
import './index.scss'

const waybillSearchListRef = ref<any>(null)
const totalItems = 100
const pageSize = 20

function getRandomSize() {
  const arr = [160, 200, 240]
  return arr[Math.floor(Math.random() * arr.length)]
}

const fetchList = async (page: number) => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const start = (page - 1) * pageSize
  const end = Math.min(start + pageSize, totalItems)

  const statusList = ['待处理', '已完成', '进行中']

  const data = Array.from({ length: end - start }, (_, i) => {
    const id = start + i + 1
    return {
      id,
      title: `运单号 #${id}`,
      subtitle: `客户姓名 ${id}`,
      description: `这是运单 ${id} 的详细描述，包含了收发件人信息、货物明细等内容。`,
      status: statusList[Math.floor(Math.random() * statusList.length)],
      time: `2025-09-04 1${i % 10}:30`,
      // height: getRandomSize(),
    }
  })
  console.log('data >>>>>> ', data)
  return { data, total: totalItems }
}

const getItemKey = (item: any) => item.id

const handleClick = (item: any) => {
  console.log('点击状态变化', item)

  console.log('修改 >>> ')

  item.title = 'xxxxxxxxxxxxxxxxx'

  waybillSearchListRef.value.updateVisiblePool()
}
</script>
