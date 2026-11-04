<template>
  <view v-if="taskList.length" class="daily-task">
    <view class="daily-task__title">每日任务</view>
    <view class="daily-task__warpper">
      <view v-for="item in taskList" :key="item.id" class="daily-task__item">
        <view class="daily-task__item-left">
          <ky-lazy-image :delay="500" :src="item.taskIcon" />
        </view>
        <view class="daily-task__item-center">
          <view class="daily-task__item-title">
            {{ item.title }}
          </view>
          <view class="desic-size">
            <rich-text :nodes="item.taskDesc" />
          </view>
        </view>
        <ky-button
          size="mini"
          type="primary"
          plain
          :id="item.taskCode === 'dailyAttendance' ? 'sign' : ''"
          class="daily-task__item-right"
          @click="handleTaskClick(item)"
          :disabled="item.hasStatus === 1 && item.taskStatus === 2"
        >
          {{ getButtonText(item) }}
        </ky-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { computed } from 'vue'
import { useHomeStore } from '../../store'
import { DailyTask } from '../../apis/types'
import { http } from '@/public/utils/request'
import { openURL } from '@/modules/webview/utils'
import { isWxMiniApp, navigateByOldPath } from '@/public/utils'
import './index.scss'
import { useBindCustomer } from '@/public/hooks/useBindCustomer'

defineOptions({ name: 'deily-task' })

const emits = defineEmits(['sign-success'])

const store = useHomeStore()

type Task = Required<Required<DailyTask>['detailList']>[number]

// 查询状态列表
const SearchStatusList = [
  'searchTab20', // 查件页-待揽件
  'searchTab30', // 查件页-待签收
  'searchTab40', // 查件页-已签收
  'searchTab50', // 查件页-全部
]

const { customerInfo } = useBindCustomer({ openCustomerApi: false })

const taskList = computed(() => {
  if (!isWxMiniApp) {
    // 处理微信小程序特有逻辑
    return store.data.taskList
  }
  return store.data.taskList.filter((item) => item.taskCode !== 'dailyAttendance') as unknown as Task[]
})

function getButtonText(item: Task) {
  if (item.hasStatus) {
    return { 1: item.gotoEnableDesc, 2: item.gotoDisableDesc }[item.taskStatus || 2]
  } else {
    return item.gotoEnableDesc
  }
}

const invokeActivityTask = async (apiCode: string, params: any) => {
  return await http<any>(apiCode, params, { hideToast: true })
}

const showToast = async (message: string) => {
  Taro.showModal({
    title: '温馨提示',
    content: message,
    confirmText: '我知道了',
    showCancel: false,
    confirmColor: '#8365f6',
  })
}
const handleTaskClick = async (item: Task) => {
  try {
    // 接口拦截前置判断
    if (item.beforeIntercept === 1) {
      try {
        const params = { taskId: item.id, customerCode: customerInfo.value?.customerCode, source: 3 }
        await invokeActivityTask(item.beforeApi!, params)
      } catch (err) {
        if (typeof err === 'string') {
          showToast(err)
          return
        }
        if (err && err.code !== 100201) {
          showToast(err.msg)
        }
        return
      }
    }

    /*
     * gotoType: 任务执行跳转类型
     * 1.无操作
     * 2.跳转小程序原生页面
     * 3.跳转包含h5链接的webview页面（统一采用/packages/webview/openWebview?url=xxx）
     * 4.请求api
     */
    if (item.gotoType === 4) {
      Taro.showLoading({ mask: true, title: '加载中...' })
      const params = { taskId: item.id, customerCode: customerInfo.value?.customerCode, source: 3 }
      invokeActivityTask(item.gotoLink!, params)
        .then(({ data: res }) => {
          Taro.hideLoading()

          if (item.taskCode === 'dailyAttendance') {
            emits('sign-success', res?.integralAmount)
          } else {
            showToast(item.toast!)
          }
        })
        .catch((err) => {
          Taro.hideLoading()
          if (err && err.code !== 100201) {
            showToast(err.msg || err.message)
          }
        })
    } else if (item.gotoType === 3) {
      openURL(item.gotoLink!, { needLogin: true })
    } else if (item.gotoType === 2) {
      if (SearchStatusList.includes(item.gotoLink!)) {
        // 跳转查件页逻辑特写，searchTabIndex: 查件页对应的tab，filterEvaluate: 查件页过滤已评价
        if (item.taskCode === 'okPingJia') {
          // 满意度评价场景
          Taro.getApp().globalData.filterEvaluate = 'true'
        } else {
          Taro.getApp().globalData.searchTabIndex = item.gotoLink!.split('searchTab')[1]
        }
        navigateByOldPath('/pages/search/index', { type: 'switchTab' })
      } else {
        Taro.navigateTo({
          url: item.gotoLink!,
        })
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    setTimeout(() => {
      store.getDailyTask()
    }, 1000)
  }
}
</script>
