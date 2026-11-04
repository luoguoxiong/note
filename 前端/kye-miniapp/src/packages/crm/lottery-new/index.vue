<!--
  CRM 摇奖活动
  精准营销-摇奖活动主页面
-->
<template>
  <view>
    <lottery-dialog
      v-if="lotteryDialogShow"
      :ani-url="lotteryAniUrl"
      :draw-status="drawStatus"
      :prize-list="prizeList"
      :on-lottery-dialog-close="onLotteryDialogClose"
    />
    <view class="draw-lottery-page" v-show="activityInfo.status">
      <!-- 顶部-中奖结果 -->
      <view class="lottery-result">
        <image class="lottery-bg" mode="widthFix" :src="LOTTERY_BG_URL" />
        <image v-if="isShowTopResult" class="result-tips-img" :src="resultImgSrc" />
        <view v-if="isShowTopResult" class="my-prize-btn" @tap="toConfig">活动规则</view>
      </view>

      <!-- 中间-抽奖/中奖信息 -->
      <view v-if="isShowPrizeInfo" class="lottery-info wining-prize">
        <content-card :title-text="prizeCount ? '获得奖品' : ''">
          <view
            v-if="prizeCount"
            :class="[
              'wining-prize-box',
              `wining-prize-box-${prizeCount}`,
              prizeCount > 4 && 'wining-prize-box-over',
            ]"
          >
            <view v-for="(prize, index) in prizeList" :key="index" class="prize-item">
              <image
                v-if="prize.type === 10 && prize.reliefForm"
                class="copon-tag"
                :src="getCouponTagSrc(prize.reliefForm)"
              />
              <image class="prize-icon" :src="getPrizeSrc(prize)" />
              <view class="prize-name">{{ prize.prizeName }}</view>
            </view>
          </view>
          <view v-else class="not-wining-prize-box">
            <image class="lucky-flower" :src="lucky_flower_2" />
            <view class="lucky-text">
              <view>好运迷了路，下次一定属于你！</view>
              <view style="margin-top: 15rpx">看看其他活动吧～</view>
            </view>
          </view>
        </content-card>
      </view>
      <view
        v-else-if="isActivityNotStart || isEmployee || [20, 30, 40].includes(+activityInfo.fillingLimit)"
        class="lottery-info"
      >
        <content-card :title-img="kye_logo_white">
          <view v-if="isActivityNotStart || isEmployee" class="lottery-form">
            <view class="not-start-tips">
              {{ isEmployee ? '温馨提醒：内部员工无法参与活动' : '活动未开始' }}
            </view>
            <view v-if="isActivityNotStart" class="start-time">{{ activityStartTime }}</view>
          </view>
          <view v-else-if="[20, 30, 40].includes(+activityInfo.fillingLimit)" class="lottery-form edit-form">
            <input
              class="phone-input"
              :value="submitValue"
              type="text"
              :maxlength="50"
              :placeholder="placeholder"
              @input="onLotteryInfoInput"
            />
            <image
              class="lottery-btn"
              :src="submitValue ? draw_lottery_btn : draw_lottery_btn_disabled"
              @tap="() => handleLottery()"
            />
          </view>
        </content-card>
      </view>

      <!-- 底部-按钮组 -->
      <view v-if="isShowPrizeInfo && prizeCount > 0" class="activity-btns">
        <image class="btn" :src="isGetAllActivity ? lock_info_btn : get_btn" @tap="toLotteryList" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { useLogin } from '@public/hooks'
import kyeNavigate from '@public/utils/native/navigate'
import ContentCard from './components/content-card/index.vue'
import LotteryDialog from './components/lottery-dialog/index.vue'
import LotteryNewAPI from './apis/index'
import {
  RESULT_TIPS_IMG,
  TEMP_IDS,
  CN_EN_NUM_REG,
  ACTIVITY_STATUS_NOT_START,
  FILLING_LIMIT_NONE,
  ACTIVITY_STATUS_IN_PROGRESS,
  ACTIVITY_STATUS_ENDED,
  USER_INPUT_TEXT,
  LOTTERY_ANI_GIF_URL,
  LOTTERY_BG_URL,
  getActivityRules,
  getEnvHost,
  kye_logo_white,
  draw_lottery_btn,
  draw_lottery_btn_disabled,
  coupon_img,
  lucky_flower_2,
  getCouponTagSrc,
  lock_info_btn,
  get_btn,
} from './config'

defineOptions({
  name: 'CrmLotteryNew',
})

// 声明全局变量
declare const getCurrentPages: any

const { autoLoginHook } = useAutoLogin()
const { token, isLogin } = useLogin()

// 获取路由参数
const getRouteParams = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage.options || {}
}

const params = getRouteParams()
let activityId: string | null = null
let isIOS = false

// 响应式数据
const activityInfo = ref<any>({})
const prizeList = ref<any[]>([])
const drawStatus = ref<number>()
const allReceiveStatus = ref<number>()
const inited = ref(false)
const submitValue = ref('')
const lotteryDialogShow = ref(false)
const debounce = ref(false)
const didLottery = ref(false)
const activityRules = ref<any[]>([])
const isEmployee = ref(false)
const lotteryAniUrl = ref<string>('')

// 计算属性
const isActivityNotStart = computed(() => activityInfo.value.status === ACTIVITY_STATUS_NOT_START)
const isActivityProgress = computed(() => +activityInfo.value.status === ACTIVITY_STATUS_IN_PROGRESS)
const isActivityEnd = computed(() => +activityInfo.value.status === ACTIVITY_STATUS_ENDED)
const isNeedInfo = computed(() => activityInfo.value.fillingLimit !== FILLING_LIMIT_NONE)
const hasDrawStatus = computed(() => !!drawStatus.value)

const isShowTopResult = computed(() => isActivityEnd.value || hasDrawStatus.value)
const isShowMiddle = computed(
  () =>
    inited.value &&
    (isEmployee.value ||
      isActivityNotStart.value ||
      isActivityEnd.value ||
      (isActivityProgress.value && isNeedInfo.value) ||
      (didLottery.value && !isNeedInfo.value) ||
      (hasDrawStatus.value && !lotteryDialogShow.value)),
)
const isDirectDraw = computed(
  () => isActivityProgress.value && !isNeedInfo.value && !hasDrawStatus.value,
)
const isShowPrizeInfo = computed(() => (hasDrawStatus.value && !lotteryDialogShow.value) || isActivityEnd.value)

const resultImgSrc = computed(() => {
  return RESULT_TIPS_IMG[isActivityEnd.value ? ACTIVITY_STATUS_ENDED : drawStatus.value!]
})

const activityStartTime = computed(() => {
  // 手动未开启，不展示文案
  if (+activityInfo.value.startPushType === 10 && !activityInfo.value.realPushStart) {
    return ''
  }
  return activityInfo.value.realPushStart
    ? `开始时间：${formatDate(activityInfo.value.realPushStart, 'YYYY-MM-DD HH:mm')}`
    : '活动开始时间以实际时间为准'
})

// 所有礼品均已领取
const isGetAllActivity = computed(() => {
  return +allReceiveStatus.value === 10
})

// 开始时间
const start = computed(() => {
  return `${activityInfo.value.realPushStart || ''}`
})

// 结束时间
const end = computed(() => {
  return `${activityInfo.value.realPushEnd || ''}`
})

const placeholder = computed(
  () => `请输入您的${USER_INPUT_TEXT[activityInfo.value.fillingLimit] || ''}后点击抽奖`,
)

const prizeCount = computed(() => prizeList.value.length)

// 格式化日期
const formatDate = (timestamp: number, format: string): string => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
}

// 错误提示
const handleErrToast = (err: any) => {
  Taro.hideLoading()
  Taro.showToast({ icon: 'none', title: (err && err.msg) || '服务异常，请稍后重试' })
  console.log('==================', 'handleErrToast')
}

// 获取活动信息
const fetchActivityInfo = async () => {
  try {
    Taro.showLoading({ mask: true })
    const response = await LotteryNewAPI.getActivityInfo({ activityId: activityId! })
    console.log('response', response)
    Taro.setNavigationBarTitle({
      title: '跨越速运',
    })
    const data = response.data || {}
    const { activityInfo: info, prizeInfos, drawStatus: status, allReceiveStatus: allGetStatus } = data
    activityInfo.value = info
    prizeList.value = prizeInfos || []
    drawStatus.value = status
    allReceiveStatus.value = allGetStatus
    inited.value = true
    activityRules.value = getActivityRules(info)
    // 直接抽奖：未抽奖 && 无需填写信息 && 活动进行中
    const flag = +info.status === ACTIVITY_STATUS_IN_PROGRESS && +info.fillingLimit === FILLING_LIMIT_NONE && !status
    if (flag) {
      handleLottery(true)
    } else {
      Taro.hideLoading()
    }
    return response
  } catch (err: any) {
    handleErrToast(err)
  }
}

// 微信本地文件转base64
const getImageBase64 = async (tempFilePath: string): Promise<string> => {
  return await new Promise((resolve) => {
    Taro.getFileSystemManager().readFile({
      filePath: tempFilePath,
      encoding: 'base64',
      success: ({ data }: any) => {
        return resolve('data:image/png;base64,' + data)
      },
      fail: (err) => {
        handleErrToast({})
      },
    })
  })
}

// 设置抽奖动画图片
const setLotteryImage = (cb?: () => void) => {
  if (lotteryAniUrl.value) {
    cb && cb()
    return
  }
  
  // 直接使用网络图片URL，避免 getImageInfo 下载失败
  // 在真机上会自动处理，开发工具可能有兼容性问题
  lotteryAniUrl.value = LOTTERY_ANI_GIF_URL
  cb && cb()
  
  // 如果需要转 base64（iOS），在实际需要时再处理
  // Taro.getImageInfo({
  //   src: LOTTERY_ANI_GIF_URL,
  //   success: async (res) => {
  //     let path = res.path
  //     if (isIOS) {
  //       path = await getImageBase64(res.path)
  //     }
  //     lotteryAniUrl.value = path
  //     cb && cb()
  //   },
  //   fail: (err) => {
  //     console.log('getImageInfo fail:', err)
  //     // 失败时直接使用网络URL
  //     lotteryAniUrl.value = LOTTERY_ANI_GIF_URL
  //     cb && cb()
  //   },
  // })
}

// 开始抽奖
const setDrawData = ({ prizeInfos, drawStatus: status, allReceiveStatus: allGetStatus }: any) => {
  lotteryDialogShow.value = true
  Taro.hideLoading()
  setTimeout(() => {
    // 等待2s动画结束后回填中奖结果
    prizeList.value = prizeInfos || []
    drawStatus.value = status
    allReceiveStatus.value = allGetStatus
  }, 1300)
}

const doLottery = async () => {
  try {
    const requestParams: any = { activityId: activityId! }
    if (submitValue.value) {
      requestParams.userKey = submitValue.value
    }
    Taro.showLoading({ mask: true })
    const data = await LotteryNewAPI.prizeDraw(requestParams)

    // 摇奖动画加载
    console.log(8888888888888, !!lotteryAniUrl.value)
    if (lotteryAniUrl.value) {
      setDrawData(data.data)
    } else {
      setLotteryImage(() => setDrawData(data.data))
    }
  } catch (err: any) {
    Taro.hideLoading()
    if (err && err.code === 46370) {
      // 内部员工
      isEmployee.value = true
    } else {
      handleErrToast(err)
    }
  }
}

// 订阅消息
const onSubscribeMessage = (cb?: () => void) => {
  if (debounce.value) return
  debounce.value = true
  Taro.requestSubscribeMessage({
    tmplIds: TEMP_IDS,
    complete: () => {
      debounce.value = false
      cb && cb()
    },
  })
}

// 抽奖
const handleLottery = (flag?: boolean) => {
  if (!CN_EN_NUM_REG.test(submitValue.value) && !flag) {
    return Taro.showToast({
      title: `${USER_INPUT_TEXT[activityInfo.value.fillingLimit]}只能输入中英文或数字`,
      icon: 'none',
      duration: 3000,
    })
  }
  doLottery()
}

// 填写信息
const onLotteryInfoInput = (e: any) => {
  submitValue.value = e.detail.value
}

// 发送通知
const sendNotice = () => {
  LotteryNewAPI.winningNotice({ activityId: activityId! })
}

// 抽奖结果确认
const onLotteryDialogClose = (status = false) => {
  lotteryDialogShow.value = false
  didLottery.value = true

  // 跳我的奖品页面
  status && toLotteryList()

  // 订阅消息
  Taro.getSetting({
    withSubscriptions: true,
    success: ({ subscriptionsSetting }: any) => {
      const itemSettings = subscriptionsSetting.itemSettings
      const isSubscribed = itemSettings && TEMP_IDS.every((id) => itemSettings[id] === 'accept')
      if (isSubscribed) {
        // 已订阅，直接发通知
        sendNotice()
        return
      }
      // 未订阅，调起订阅消息
      onSubscribeMessage(sendNotice)
    },
  })
}

// 跳我的奖品
const toLotteryList = () => {
  const h5_url = `${getEnvHost()}/crm/crm-marketing-open/lottery-new.html#/list?activityId=${activityId}&token=${
    token.value
  }`
  Taro.navigateTo({
    url: `/packages/webview/openWebview?url=${encodeURIComponent(h5_url)}`,
  })
}

// 跳活动规则页
const toConfig = () => {
  const h5_url = `${getEnvHost()}/crm/crm-marketing-open/lottery-new.html#/config?activityId=${activityId}&start=${
    start.value
  }&end=${end.value}&token=${token.value}`
  console.log('-----', h5_url)
  Taro.navigateTo({
    url: `/packages/webview/openWebview?url=${encodeURIComponent(h5_url)}`,
  })
}

// 获取奖品图片
const getPrizeSrc = (prize: any) => {
  return prize.type === 10 ? coupon_img : prize.prizeImg
}

// 初始化
useDidShow(async () => {
  if (!isLogin.value) {
    // 登录成功后自动跳回摇奖页（带 activityId）
    const targetActivityId = params.activityId || ''
    const targetUrl = targetActivityId
      ? `/packages/crm/lottery-new/index?activityId=${targetActivityId}`
      : '/packages/crm/lottery-new/index'
    kyeNavigate.checkLogin(() => {
      Taro.reLaunch({ url: targetUrl })
    })
    return
  }
  try {
    activityInfo.value = {}
    setLotteryImage()
    activityId = params.activityId
    await autoLoginHook()
    const systemInfo = await Taro.getSystemInfo()
    isIOS = systemInfo.platform === 'ios'
    fetchActivityInfo()
  } catch (error) {
    console.log(error)
  }
})
</script>

<style lang="scss">
@import './index.scss';
</style>

