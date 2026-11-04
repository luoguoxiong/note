<template>
  <view class="message-card" @click="handleGetDetail" v-if="!isDel">
    <ky-swipe-group :move-end-close="true">
      <ky-swipe-cell name="row-1">
        <view :class="['message-card--wrapper', !calFinish && 'max-height']">
          <view class="message-card--wrapper--check" v-show="manageModel" @click.stop="handleCheck">
            <image
              :src="
                item.checked
                  ? 'https://ic-img.ky-express.com/netc/20251215_85887_!!1765766999274_40_40.png'
                  : 'https://ic-img.ky-express.com/netc/20251215_50026_!!1765766999270_40_40.png'
              "
            ></image>
          </view>
          <view class="message-card--wrapper--icon">
            <image :src="item.messageIcon" />
          </view>
          <view class="message-card--wrapper--content">
            <view class="message-card--wrapper--content--head">
              <view class="title">{{ item.messageTitle || '' }}</view>
              <view>{{ filterTime(item.messagePushTime) }}</view>
            </view>
            <view
              :id="`detail-${item.messageSerialNumber}`"
              :class="['message-card--wrapper--content--detail', expand && 'show-all']"
              >{{ filterMessageContent(item.messageContent) }}</view
            >
            <view v-if="showFoldBtn" class="message-card--wrapper--content--more" @click.stop="handleExpand">
              <view v-if="expand">收起</view>
              <view v-else>展开</view>
              <image
                v-if="expand"
                src="https://ic-img.ky-express.com/netc/20250820_19077_!!1755658815858_48_48.png"
              ></image>
              <image v-else src="https://ic-img.ky-express.com/netc/20250820_84183_!!1755654428140_48_48.png"></image>
            </view>
          </view>
        </view>
        <template #right>
          <view class="message-card--del" @click.stop="deleteRow">
            <image
              class="message-card--del--img"
              src="https://ic-img.ky-express.com/netc/20251230_4155_!!1767083942419_42_42.png"
            ></image>
            <view class="message-card--del--text">删除</view>
          </view>
        </template>
      </ky-swipe-cell>
    </ky-swipe-group>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import { ref, onMounted } from 'vue'
import './index.scss'
import * as API from '../../../apis'
import { getMessageRoutePath, getReportSorce } from '@/public/components/business/advertise-center/utils'
import { showDialog } from '@kye-netc/kye-miniui'
import kyeNavigate from '@/public/utils/native/navigate'
import { getQueryObject, isAliMiniApp, isAmapMiniApp } from '@/public/utils'
import { openURL } from '@/modules/webview/utils'
import plateform from '@kye-netc/plateform'
import { getEnvConfig } from '@/public/constants'
import { getToken } from '@/public/storage'

const props = defineProps<{
  item: any
  manageModel: boolean
  messageType: any
}>()

const emits = defineEmits(['check', 'readStateUpdate'])

const expand = ref(true)
const showFoldBtn = ref(false)
const isDel = ref(false)
const calFinish = ref(false)

const calFoldBtn = () => {
  const query = Taro.createSelectorQuery()
  if (isAliMiniApp || isAmapMiniApp) {
    query
      .select(`#detail-${props.item.messageSerialNumber}`)
      .boundingClientRect()
      .exec((res) => {
        if (res && res[0]) {
          // 计算行高，加2px误差
          if (res[0].height > 38) {
            expand.value = false
            showFoldBtn.value = true
          }
        }
        calFinish.value = true
      })
  } else {
    query
      .select(`#detail-${props.item.messageSerialNumber}`)
      .boundingClientRect((res) => {
        if (res) {
          if (res.height > 38) {
            expand.value = false
            showFoldBtn.value = true
          }
        }
        calFinish.value = true
      })
      .exec()
  }
}

const handleGetDetail = async () => {
  const item = props.item
  reportUserMsg(item)
  if (props.manageModel) {
    handleCheck()
    return
  }
  if (isAliMiniApp || isAmapMiniApp) {
    Taro.showToast({ title: '当前渠道暂不支持跳转，请前往微信小程序', icon: 'none' })
    return
  }
  if (item.appJumpType === 0) return
  emits('readStateUpdate', '20', item.messageSerialNumber)
  // 检查是否仅客户端消息
  const valid = await handleMessagePCValid(item)
  if (valid) return
  let url = item.appUrl
  if (url.includes('/netc-h5-tools-optimize/message-center/message-center.html#/detail')) {
    console.log('hhh', url)
    const params = item.appUrl.split('?')[1] || ''
    kyeNavigate.navigateBefore('navigateTo', {
      url: `/modules/tools/message-center/detail/index?${params}`,
    })
    return
  }
  if (item.appJumpType === 1) {
    url = item.appUrl.replace(/^http:\/\//, 'https://')
    if (url.includes('#/waybill-route')) {
      const { waybillNo } = getQueryObject(url)
      kyeNavigate.navigateBefore('navigateTo', {
        url: `/modules/waybill-build/pages/waybill-route/index?waybillNumber=${waybillNo}`,
      })
      return
    }
    if (url.includes('#/waybill-detail')) {
      const { waybillNo } = getQueryObject(url)
      kyeNavigate.navigateBefore('navigateTo', {
        url: `/modules/waybill-build/pages/waybill-detail/index?waybillNumber=${waybillNo}`,
      })
      return
    }
    if (url.includes('#/order')) {
      const { channel } = getQueryObject(url)
      kyeNavigate.navigateBefore('navigateTo', {
        url: `/modules/order-build/pages/order/index?channel=${channel}`,
      })
      return
    }
    openURL(url, { needLogin: true })
  } else if (item.appJumpType === 2) {
    const routeList = await getMessageRoutePath()
    if (!routeList.length) {
      // 没有配置内部路由回到首页
      Taro.switchTab({ url: '/layout/pages/home/index' })
      return
    }
    // 查询状态列表
    const SearchStatusList = ['searchTab20', 'searchTab30', 'searchTab40', 'searchTab50']
    // 一级页面
    const searchTab = SearchStatusList.find((tab) => item.appUrl.includes(tab))
    if (searchTab && searchTab) {
      Taro.switchTab({ url: '/layout/pages/waybill/index' })
      return
    }
    const pathObj = routeList.find((obj) => obj.pageName === item.appUrl)
    if (!pathObj) {
      // 没有找到匹配路由回首页
      Taro.switchTab({ url: '/layout/pages/home/index' })
      return
    }
    const { type: routeType, url, customParams } = pathObj
    if (routeType === 'miniProgram') {
      const miniProgramName = pathObj.customParams?.miniProgramName ? `“${pathObj.customParams?.miniProgramName}”` : ''
      await showDialog({
        parentClassName: 'message-list',
        title: '温馨提示',
        message: `即将打开${miniProgramName}小程序`,
        showCancelButton: true,
        confirm: () => {
          let path = url
          // 跳转跨越领鲜小程序且为登录状态：需要带上token和fromId参数
          const token = getToken()
          if (customParams.appId === 'wxb1503f29025cc7aa' && token) {
            const fromId = getEnvConfig().xForm
            path = `${path}${path.indexOf('?') > 0 ? '&' : '?'}token=${token}&fromId=${fromId}`
          }
          console.log('path', path)
          plateform.openMiniProgram({
            path: path,
            appId: customParams.appId,
            ...customParams,
            envVersion: getEnvConfig().isProd ? 'release' : 'trial',
          } as any)
        },
      })
    } else if (routeType === 'native') {
      Taro.navigateTo({ url })
    } else {
      openURL(url, { needLogin: true })
    }
  }
}

const filterMessageContent = (text: string) => {
  const hasHTMLTag = /<\/?\w+[^<>/]*\/?>/.test(text)
  if (hasHTMLTag) {
    return text.split(/<\/?\w+[^<>/]*\/?>/).map(t => t.trim()).filter(Boolean).join('; ')
  }
  return text
}

/**
 * 检查是否仅客户端消息-跳转客户端消息
 * @param item 消息列数据
 * @return {Promise<boolean>}<默认：否>
 */
const handleMessagePCValid = async (item) => {
  // <jumpRestrict-跳转限制，1：仅移动端跳转，2：仅PC端跳转，其他：无限制>
  let result = false
  const { jumpRestrict, pcJumpType } = item || {}
  // 存在仅PC端跳转
  if (jumpRestrict === 2) {
    result = true
    // pcJumpType - pc端跳转类型 <0=不跳转；1=h5；2=原生；3=外部小程序；4=调接口>
    switch (pcJumpType) {
      case 1:
      case 2:
        Taro.showToast({ title: '跨越速运APP/小程序不支持查看，请前往跨越速运PC端查看', icon: 'none' })
        break
      case 3:
        // eslint-disable-next-line no-case-declarations
        const url = item.pcUrl.replace('http://', 'https://')
        Taro.navigateTo({
          url: `/packages/webview/openWebview?url=${encodeURIComponent(url)}&needLogin=true`,
        })
        break
    }
  }
  return result
}

const reportUserMsg = async (item) => {
  const { messagePushTime, messageSerialNumber, messageType, customParams } = item
  /**
   * @type {Record<string, unknown>}
   */
  let parsedCustomParams = {}
  try {
    parsedCustomParams = JSON.parse(customParams)
  } catch (e) {
    /* ignore */ console.error(e)
  }
  if (!messageSerialNumber) {
    return
  }
  const { operatePort, operatorSystem } = getReportSorce()
  const params = {
    messagePushTime,
    messageSerialNumber,
    messageType,
    operatePort,
    operatorSystem,
    // operatePort: isAppBrowse ? 'APP' : 'MINIPROGRAM',
    // operatorSystem: isIphone ? 'ios' : 'android',
    msgTaskCode: parsedCustomParams && parsedCustomParams['MSG_TASK_CODE'],
  }
  await API.reportUserMsg(params)
}

const handleCheck = () => {
  emits('check', props.item.messageSerialNumber)
}

const filterTime = (time) => {
  if (!time) return ''
  return dayjs(time).format('YYYY/MM/DD')
}

const handleExpand = () => {
  expand.value = !expand.value
}

const deleteRow = async () => {
  await showDialog({
    parentClassName: 'message-list',
    title: '温馨提示',
    message: '消息删除后将无法恢复，您确定要删除吗？',
    showCancelButton: true,
    confirm: () => handleDelete(),
  })
}

const handleDelete = async () => {
  try {
    await API.userMessageBatchDel({
      messageSerialNumbers: [props.item.messageSerialNumber],
      messageType: props.messageType,
      messagePushTimeList: [props.item.messagePushTime],
    })
    Taro.showToast({ title: '删除成功', icon: 'none' })
    isDel.value = true
  } catch (err) {
    console.log(err)
  }
}

onMounted(() => {
  calFoldBtn()
})
</script>
