<template>
  <div class="invite-card-item">
    <div class="invite-add-info">
      <div class="addr-box">
        <div class="title">{{ inviteItem.senderInfo?.city || '--' }}</div>
        <div class="name">{{ inviteItem.senderInfo?.person || '--' }}</div>
      </div>
      <div class="process-box">
        <img :src="getIcon(inviteItem.recordStatus)" />
      </div>
      <div class="addr-box receiver-add">
        <div class="title">{{ inviteItem.receiverInfo?.city || '未填写' }}</div>
        <div class="name">{{ inviteItem.receiverInfo?.person || '--' }}</div>
      </div>
    </div>
    <div class="invite-waybill-info">
      <div class="info-item" v-if="inviteItem.waybillNumber">
        <span class="label">运单号：</span>
        <span class="value" v-copy="inviteItem.waybillNumber">{{ inviteItem.waybillNumber }}</span>
        <SvgIcon
          v-copy="inviteItem.waybillNumber"
          class="copy-icon"
          name=""
          img-url="https://ic-img.ky-express.com/netc/20260129_12775_!!1769696260463_96_96.png"
        ></SvgIcon>
      </div>
      <!-- v-if="inviteItem.timeOutEndTime" -->
      <div class="info-item" v-if="inviteItem.timeOutEndTime">
        <span class="label">剩余时间：</span>
        <span class="value">{{ formattedTime }}</span>
      </div>
      <div class="info-item" v-if="inviteItem.msgTips">
        <span class="label">{{ inviteItem.msgTips }}</span>
      </div>
    </div>
    <div
      class="invite-bottom-btn"
      v-if="[InviteStatusEnum.待填写, InviteStatusEnum.待下单].includes(inviteItem.recordStatus as InviteStatusEnum)"
    >
      <template v-if="InviteStatusEnum.待填写 === inviteItem.recordStatus">
        <KyButton
          class="invite-btn"
          type="text"
          size="large"
          text="催他填写"
          :open-type="isWxAppEnv ? '' : 'share'"
          @click="toUrgeFill(inviteItem)"
          v-if="!timer"
        ></KyButton>
        <!-- 一分钟内不能重复点击 -->
        <KyButton
          class="invite-btn"
          type="text"
          size="large"
          text="催他填写"
          @click="toUrgeFill(inviteItem)"
          v-else
        ></KyButton>
      </template>

      <KyButton
        class="invite-btn"
        type="text"
        size="large"
        text="去下单"
        @click="toOrder(inviteItem)"
        v-if="InviteStatusEnum.待下单 === inviteItem.recordStatus"
      ></KyButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IInviteList, InviteStatusEnum } from '@order-public-sub-public/apis/share/types'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import vCopy from '@order-public-sub-public/directives/copy'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
// import { useCountdown } from '../../hooks/useCountDown.ts'
import { useCountdown } from '@/public/utils/useCountdown'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { onUnmounted, watch } from 'vue'
import Taro from '@tarojs/taro'
import { isWxAppIosEnv, isWxAppAndroidEnv, isWxAppOhosEnv, isWxAppEnv } from '@/public/utils'
import { appWxShare } from '@public/utils/appWxShare'
import { Channel } from '@order-public-sub-public/constants'
import { toOrderReport, toUrgeFillReport } from '../../../report'

const props = defineProps<{
  inviteItem: IInviteList
}>()

const { formattedTime, isFinished, stop } = useCountdown(props.inviteItem.timeOutEndTimeNum!)

const emits = defineEmits(['toRefresh', 'setShareInvitInfo', 'toChagneInviteStatus'])

const getIcon = (orderStatus: InviteStatusEnum) => {
  let imageMap = {
    [InviteStatusEnum.待填写]: 'https://ic-img.ky-express.com/netc/20260129_65130_!!1769695384360_276_96.png',
    [InviteStatusEnum.已取消]: 'https://ic-img.ky-express.com/netc/20260129_578_!!1769695381045_276_96.png',
    [InviteStatusEnum.已下单]: 'https://ic-img.ky-express.com/netc/20260129_96011_!!1769695381042_276_96.png',
    [InviteStatusEnum.待下单]: 'https://ic-img.ky-express.com/netc/20260129_41651_!!1769695381047_276_96.png',
  }
  return imageMap[orderStatus]
}

// const curDate = dayjs()
// const remainingTime = computed(() => {
//   const time = unref(props.inviteItem.timeOutEndTime)
//   // if (!time || time < 0)
//   //   return {
//   //     formattedTime: '',
//   //     isFinished: true,
//   //     stop: () => {},
//   //   }
//   const timeNumber = curDate.add(time, 'millisecond').valueOf()
//   // console.log(timeNumber, 'timeNumber')
//   const { formattedTime, isFinished, stop } = useCountdown(timeNumber)
//   // console.log(formattedTime, 'formattedTime')
//   return {
//     formattedTime,
//     isFinished,
//     stop,
//   }
// })

watch(isFinished, (newVal) => {
  if (newVal) {
    const params = { ...props.inviteItem, recordStatus: InviteStatusEnum.已取消, timeOutEndTime: 0 }
    if (props.inviteItem?.recordStatus === InviteStatusEnum.待填写) {
      params.msgTips = '系统超时未填写，自动取消'
    }
    if (props.inviteItem?.recordStatus === InviteStatusEnum.待下单) {
      params.msgTips = '系统超时未下单，自动取消'
    }
    emits('toChagneInviteStatus', params)
  }
})

onUnmounted(() => {
  stop()
})

let timer: any = null

// 催填
const toUrgeFill = async (inviteItem: IInviteList) => {
  toUrgeFillReport()
  if (timer) {
    showToast('1分钟内仅可点击1次')
    return
  }
  // 如果是app
  if (isWxAppIosEnv || isWxAppAndroidEnv || isWxAppOhosEnv) {
    const { senderInfo, inviteCode } = inviteItem
    await appWxShare({
      title: (senderInfo?.person || '') + '邀请您填写收件地址',
      path: '/modules/order-build-sub-pages/pages/share-send/share/index?inviteCode=' + inviteCode,
      imagePath: 'https://ic-img.ky-express.com/netc/20260204_5157_!!1770203181112_450_360.png',
    }).then((res) => {
      console.log(res)
      showToast('邀请成功')
    })
  } else {
    emits('setShareInvitInfo', inviteItem)
  }
  timer = setTimeout(() => {
    console.log('催填写')
    timer = null
  }, 60 * 1000)
}

const toOrder = (inviteItem) => {
  console.log('kkkkkkkasdfsaf')
  toOrderReport()
  Taro.navigateTo({
    url: `/modules/order-build-sub-pages/pages/share-send/share/index?inviteCode=${inviteItem.inviteCode}&isBack=1`,
  })
}
</script>

<style lang="scss">
.invite-card-item {
  border-radius: 24px;
  padding: 24px;
  background: #fff;
  margin-bottom: 16px;
  margin: 16px 24px;
  .invite-add-info {
    display: flex;
    margin-bottom: 24px;
    .addr-box {
      flex: 1;
      flex-shrink: 0;
      .title {
        font-size: 32px;
        font-weight: 600;
        color: #24262b;
        margin-bottom: 8px;
      }
      .name {
        color: #8c8f99;
        font-size: 24px;
        font-weight: normal;
      }
    }
    .receiver-add {
      text-align: right;
    }
    .process-box {
      width: 138px;
      display: flex;
      align-items: center;
      justify-content: center;
      // height: 100%;
      image {
        width: 138px;
        height: 48px;
      }
    }
  }

  .invite-waybill-info {
    .info-item {
      font-size: 24px;
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      .copy-icon {
        width: 48px;
        height: 48px;
      }
      .label {
        color: #686b75;
      }
      .value {
        color: #24262b;
      }
    }
  }

  .invite-bottom-btn {
    display: flex;
    border-top: 1px solid #ebedf5;
    padding-top: 16px;
    margin-top: 16px;
    justify-content: flex-end;
    .invite-btn {
      border: 2px solid #8365f6;
      height: 56px;
      width: 120px;
      line-height: 56px;
      font-size: 24px;
      color: #8365f6;
      border-radius: 8px;
      background: #fff;
      margin-left: 16px;
      padding: 0;
    }
  }
}
</style>
