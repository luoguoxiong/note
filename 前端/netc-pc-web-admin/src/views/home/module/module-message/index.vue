<template>
  <div id="message-content">
    <div class="title">
      <span class="text">
        <span class="new-msg">最新消息</span>
      </span>
      <More :to-more="toMore"></More>
    </div>

    <div class="message-box" v-if="latestMessageList.length > 0">
      <div class="message-item" v-for="item in latestMessageList" :key="item.messageId" @click="toDetail(item)">
        <div class="message-title">
          {{ item.messageTitle }}
          <span class="message-time">{{ dayjs(item.messagePushTime).format('YYYY/MM/DD') }}</span>
        </div>
        <div class="message-word">{{ item.messageContent }}</div>
      </div>
    </div>
    <div class="message-empty" v-else>近30天内暂无消息</div>
  </div>
</template>
<script setup lang="ts">
import { UserMessageVO } from '@/apis/home/types'
import { useHomeStore } from '@/hooks'
import { $parentMessageListNavigation, $parentMessageNavigation, isClientMode } from '@/utils/appBridge'
import More from '@/views/home/components/more/index.vue'
import dayjs from 'dayjs'
import { reportUserMsg } from '@/apis/home'

const { latestMessageList } = useHomeStore()

const toMore = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_message_centre_view_more_v1',
    },
    {
      region_code: 'message_centre',
      message_have_ornot: latestMessageList.value.length > 0 ? '有' : '无',
    }
  )
  $parentMessageListNavigation()
}

// 上报数据
const getReportUserMsg = async (data: UserMessageVO) => {
  const { messagePushTime, messageSerialNumber, messageType } = data
  if (!messageSerialNumber) return
  reportUserMsg({
    messagePushTime,
    messageSerialNumber,
    messageType,
    operatePort: 'PC',
    operatorSystem: (await isClientMode()) ? 'pcClient' : 'pc',
  })
}

const toDetail = (info: UserMessageVO) => {
  getReportUserMsg(info)
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_message_centre_details_v1',
    },
    {
      region_code: 'message_centre',
      message_code: info.messageSerialNumber,
    }
  )
  $parentMessageNavigation({ ...info })
}
</script>
<style scoped lang="scss">
#message-content {
  padding: 16px 0;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
  .title {
    height: 26px;
    color: var(---CG-Grey-09, rgba(36, 38, 43, 1));
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    .text {
      display: flex;
      align-items: center;
    }
    .new-msg {
      font-size: 18px;
      font-weight: 600;
      line-height: 26px;
    }
  }
  .message-box {
    padding: 8px 16px 0;
  }
  .message-item:last-child {
    &::before {
      display: none;
    }
  }
  .message-item {
    cursor: pointer;
    padding: 16px 8px;
    box-sizing: border-box;
    position: relative;
    border-radius: 4px;
    &::before {
      content: '';
      height: 1px;
      // 边框/分割线统一取色彩库 CG-Grey-04（#e6e8ed）
      background: var(---CG-Grey-04, rgba(230, 232, 237, 1));
      position: absolute;
      bottom: 0;
      left: 8px;
      right: 8px;
      // QA1028：1px 实线在非整倍像素密度/缩放下会落在不同设备像素上，同列表内忽粗忽细；
      // 统一缩成半像素细线，保证每条分割线渲染粗细一致
      transform: scaleY(0.5);
      transform-origin: center bottom;
    }
  }
  .message-item:hover {
    background: rgba(36, 38, 43, 0.03);
  }
  .message-item:active {
    background: rgba(36, 38, 43, 0.06);
  }
  .message-item:last-child {
    border-bottom: 0;
  }
  .message-title {
    font-size: 13px;
    font-weight: 600;
    color: #24262b;
    height: 20px;
    line-height: 20px;
    padding-right: 100px;
    width: 100%;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 4px;
  }
  .message-word {
    height: 18px;
    line-height: 18px;
    margin-top: 4px;
    font-size: 12px;
    color: #686b75;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .message-time {
    font-size: 12px;
    color: #8c8f99;
    position: absolute;
    right: 0;
    font-weight: 400;
  }
  .message-empty {
    height: 18px;
    margin-top: 8px;
    color: #8c8f99;
    font-size: 12px;
    line-height: 18px;
    text-align: center;
  }
}
</style>
