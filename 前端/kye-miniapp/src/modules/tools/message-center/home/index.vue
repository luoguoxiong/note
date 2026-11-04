<template>
  <view class="message-home">
    <view
      v-for="(item, index) in list"
      :key="'0_' + index"
      class="message-home__item"
      @click="() => handleJumpList(item)"
    >
      <view class="message-home__item--left">
        <view class="message-home__item--icon">
          <image :src="item.imageUrl" />
        </view>
        <view class="message-home__item--content">
          <view class="message-home__item--box">
            <view class="message-home__item--title">
              <view class="message-home__item--title-label">{{ item.label }}</view>
              <view class="message-home__item--title-new" v-if="item.hasNewMessage"></view>
            </view>
            <view class="message-home__item--right">{{ item.creationDate || '' }}</view>
          </view>
          <view class="message-home__item--message">{{ item.messageTitle }}</view>
        </view>
      </view>
    </view>
    <view class="message-home__footer">
      <fixed-footer />
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { ref } from 'vue'
import FixedFooter from './components/fixed-footer/index.vue'
import './index.scss'
import * as API from '../apis/index'
import { getChannelCode } from '@/public/components/business/advertise-center/utils'
import { UserMessageTypeRes } from '../apis/types'

const list = ref<UserMessageTypeRes[]>([])

const handleJumpList = (item) => {
  Taro.navigateTo({
    url: '/modules/tools/message-center/list/index?type=' + item.value + '&typeName=' + item.label,
  })
}

useDidShow(async () => {
  try {
    const res = await API.getUserMessageType({
      channelCode: getChannelCode(),
    })
    list.value = res.data
  } catch (error) {
    console.log(error)
  }
})
</script>
