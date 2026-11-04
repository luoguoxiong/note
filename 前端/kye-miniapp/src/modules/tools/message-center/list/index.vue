<template>
  <view class="message-list" v-if="list.length">
    <view class="message-list__manage" ref="messageListRef" @click="handleSwitchManage">
      <view class="type-name">{{ messageTypeName }}</view>
      <view class="manage-btn">{{ manageModel ? '退出管理' : '管理' }}</view>
    </view>
    <scroll-view class="message-list__wrapper" :scroll-y="true" @scroll="handleScroll">
      <messageCard
        v-for="item in list"
        :key="item.messageSerialNumber"
        :item="item"
        :messageType="messageType"
        :manage-model="manageModel"
        @check="handleCheck"
        @readStateUpdate="readStateUpdate"
      ></messageCard>
      <view v-show="finished" class="message-list__wrapper--empty">没有更多了</view>
    </scroll-view>
    <view v-show="manageModel" class="message-list__footer">
      <view class="message-list__footer--left" @click="handleCheckAll">
        <image
          v-show="getCheckedCount() === list.length"
          src="https://ic-img.ky-express.com/netc/20251215_85887_!!1765766999274_40_40.png"
        />
        <image
          v-show="getCheckedCount() !== list.length"
          src="https://ic-img.ky-express.com/netc/20251215_50026_!!1765766999270_40_40.png"
        />
        全选（{{ getCheckedCount() }}）
      </view>
      <view class="message-list__footer--right" @click="handleBatchDel">删除</view>
    </view>
  </view>
  <view class="message-list__empty" v-else>
    <image src="https://ic-img.ky-express.com/netc/20260226_997_!!1772089138032_296_296.png"></image>
    <view class="empty-text">暂无消息</view>
  </view>
</template>

<script setup lang="ts">
import { useReachBottom, useRouter } from '@tarojs/taro'
import { ref, onMounted } from 'vue'
import messageCard from './components/message-card/index.vue'
import './index.scss'
import * as API from '../apis'
import { getChannelCode } from '@/public/components/business/advertise-center/utils'
import { UserMessageListItem } from '../apis/types'
import Taro from '@tarojs/taro'
import { showDialog } from '@kye-netc/kye-miniui'

const router = useRouter()

const messageTypeName = ref()
const messageType = ref()
const manageModel = ref(false)
const list = ref<UserMessageListItem[]>([])
const page = ref(0)
const pageSize = ref(20)
const pageTotal = ref(1)
const endMessagePushTime = ref()
const endMessageIndex = ref()
const finished = ref(false)

const systemInfo = Taro.getSystemInfoSync()
const screenHeight = systemInfo.screenHeight

const handleSwitchManage = () => {
  manageModel.value = !manageModel.value
}

const handleCheck = (messageSerialNumber) => {
  list.value.map((i) => {
    if (i.messageSerialNumber === messageSerialNumber) {
      i.checked = !i.checked
    }
    return i
  })
}

// 获取选中数量
const getCheckedCount = () => {
  let arr = list.value.filter((item) => !!item.checked)
  return arr.length
}
// 全选或取消
const handleCheckAll = () => {
  if (getCheckedCount() === list.value.length) {
    list.value.map((obj) => {
      obj.checked = false
      return obj
    })
  } else {
    list.value.map((obj) => {
      obj.checked = true
      return obj
    })
  }
}

const handleBatchDel = async () => {
  let messageSerialNumbers: string[] = []
  let messagePushTimeList: number[] = []
  let newList: any[] = []
  list.value.forEach((item) => {
    if (item.checked) {
      messageSerialNumbers.push(item.messageSerialNumber)
      messagePushTimeList.push(item.messagePushTime)
    } else {
      newList.push(item)
    }
  })
  if (!messageSerialNumbers.length) {
    Taro.showToast({ title: '请选择消息', icon: 'none' })
    return
  }
  await showDialog({
    parentClassName: 'message-list',
    title: '温馨提示',
    message: '消息删除后将无法恢复，您确定要删除吗？',
    showCancelButton: true,
    confirm: async () => {
      await API.userMessageBatchDel({
        messageSerialNumbers,
        messageType: messageType.value,
        messagePushTimeList,
      })
      Taro.showToast({ title: '删除成功', icon: 'none' })
      list.value = newList
      manageModel.value = false
    },
  })
}

const getList = async (type) => {
  page.value++
  try {
    const res = await API.userMessageList({
      channelCode: getChannelCode(),
      page: page.value,
      pageSize: pageSize.value,
      messageTypeList: [+messageType.value],
      endMessagePushTime: endMessagePushTime.value,
      endMessageIndex: endMessageIndex.value,
    })
    console.log(res, 'res')
    list.value = [...list.value, ...res.data.rows]
    if (res.data.pageTotal) {
      pageTotal.value = res.data.pageTotal
      finished.value = page.value >= pageTotal.value
    } else {
      if (res.data.rows && res.data.rows.length === pageSize.value) {
        endMessagePushTime.value = res.data.rows[res.data.rows.length - 1].messagePushTime
        endMessageIndex.value = res.data.rows[res.data.rows.length - 1].messageIndex
      } else {
        finished.value = true
      }
    }
    if (type === '1' && !res.data.pageTotal) {
      readStateUpdate(30)
    }
  } catch (error) {
    list.value = []
    page.value--
    endMessageIndex.value = null
    endMessagePushTime.value = null
  }
}

const readStateUpdate = async (type, messageSerialNumber = '') => {
  try {
    await API.readStateUpdate({
      type,
      messageSerialNumber,
      messageType: messageType.value,
      channelCode: getChannelCode(),
      readIndex: list.value.length ? list.value[0]?.messageIndex : undefined,
      messagePushTime: list.value.length ? list.value[0]?.messagePushTime : undefined,
    })
    list.value.map((obj) => {
      if (obj.messageSerialNumber === messageSerialNumber) {
        obj.messageReadState = 1
      }
      return obj
    })
  } catch (err) {
    console.log(err)
  }
}

const handleScroll = (e) => {
  const { scrollTop, scrollHeight } = e.detail
  console.log(scrollTop, scrollHeight, screenHeight, 'eee')
  // 判断是否滚动到底部（留一定的缓冲距离）
  if (scrollHeight - scrollTop <= screenHeight + 10 && !finished.value) {
    getList('0')
  }
}

onMounted(async () => {
  console.log(router)
  const { type, typeName } = router.params
  messageType.value = type
  messageTypeName.value = typeName
  getList('1')
})
</script>
