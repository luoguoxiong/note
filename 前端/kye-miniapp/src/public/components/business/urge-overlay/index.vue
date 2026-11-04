<template>
  <root-portal :enable="show" v-show="show">
    <ky-overlay :show="show" class="urge-overlay" :closeOnClickOverlay="true" position="center">
      <view class="wrapper" :catchMove="true">
        <view class="box">
          <view
            class="wrapper-header"
            :class="{
              'wrapper-header-guide': isGuide,
            }"
          ></view>
          <view class="wrapper-content">
            <view class="wrapper-content-success">{{ isGuide ? '温馨提示' : '催件成功' }}</view>
            <view class="wrapper-content-tip">{{ tipText }}</view>
            <view class="wrapper-content-time" v-if="lastRemindRecordMsg">{{ lastRemindRecordMsg }}</view>
          </view>
          <view class="wrapper-footer wrapper-footer-box1" @click="handleSee" v-if="!guideOperationType">
            <view class="wrapper-footer-btton-box wrapper-footer-btn-single">我知道了</view>
          </view>
          <view class="wrapper-footer wrapper-footer-box2" v-else>
            <view class="wrapper-footer-btton">
              <view
                class="wrapper-footer-btton-left wrapper-footer-btton-box"
                @click="handleSee"
                v-if="isGuide || guideOperationType === 50"
                >我知道了</view
              >
              <view
                class="wrapper-footer-btton-right wrapper-footer-btton-box"
                @click="handlePrimary"
                v-if="primaryButton[guideOperationType]"
                >{{ primaryButton[guideOperationType] }}</view
              >
            </view>
          </view>
        </view>
      </view>
    </ky-overlay>
  </root-portal>
  <OfficialAccountPop v-if="showOfficial" ref="officialAccountRef" />
  <!-- 联系商务 -->
  <ContactBusiness ref="contactBusinessRef" v-model:show="showBussiness" :phone="userInfo?.phone || ''" />
  <!-- 函数式调用弹窗（showUrgeDialog） -->
  <UrgeDialog />
</template>

<script lang="ts" setup>
import './index.scss'
import { ref, computed, watch, nextTick } from 'vue'
import OfficialAccountPop from './official-account.vue'
import Taro from '@tarojs/taro'
import { waybillRemindNew } from '@public/apis/pop'
import { useToast } from '@public/hooks/useToast'
import { report_EXP_event, report_CLK_event } from '@public/utils/reportUtil'
import { isH5FSEnv } from '@public/utils/device'
import { switchPushConfig } from '@public/components/business/urge-overlay/switchUrge'
import ContactBusiness from '@public/components/business/contact-business/index.vue'
import UrgeDialog from './urge-dialog.vue'
import { getUserInfoStorage } from '@/public/storage/user'

const userInfo = getUserInfoStorage()

const props = withDefaults(
  defineProps<{
    source: string
    toastId?: string
    waybillNumber: string
    open: boolean
  }>(),
  {
    source: 'base-page-content',
    open: true,
  },
)
const { showToast } = useToast()
const show = ref<boolean>(false)
const lastRemindRecordMsg = ref<string>('')
const tipText = ref<string>('')
const officialAccountRef = ref(null)
const showBussiness = ref(false)

const primaryButton = {
  10: '修改货好时间',
  30: '我要催件',
  20: '查看网点自提',
  40: '开启物流推送',
  50: '联系商务',
}

// 引导操作类型
const guideOperationType = ref(0)
const showOfficial = ref(false)
const remindResultType = ref()
const params = ref<{
  remindType?: string
  waybillNumber?: string
}>({})

const isGuide = computed(() => {
  return remindResultType.value === 30
})

const isPickUrgent = computed(() => {
  return params.value.remindType === '10'
})

const getEventCode = computed(() => {
  if (isPickUrgent.value) {
    return {
      exp: 'exp_urgetake_pop_v1',
      click: 'clk_urgetake_pop_button_v1',
    }
  }
  return {
    exp: 'exp_urgedelivery_pop_v1',
    click: 'clk_urgedelivery_pop_button_v1',
  }
})

const getEventParams = computed(() => {
  const { waybillNumber } = params.value
  return {
    waybillorder: waybillNumber,
    last_mind: lastRemindRecordMsg.value ? '是' : '否',
    popup_content: tipText.value,
    urge_success: remindResultType.value === 10 ? '是' : '否',
  }
})

const openPopup = (val: any, requestLoading?: boolean) => {
  params.value = val
  getLastRemindRecord(val, requestLoading)
}

watch(show, (val) => {
  if (!val) {
    skipOperation.value = 20
    guideOperationType.value = 0
    remindResultType.value = null
  }
})

const skipOperation = ref(20)
const curParams = ref({})
const getLastRemindRecord = async (params, requestLoading) => {
  try {
    curParams.value = params
    if (!requestLoading) {
      Taro.showLoading({ mask: true, title: '加载中...' })
    }
    const res = await waybillRemindNew({
      clientType: 20,
      waybillNumber: params.waybillNumber,
      remindType: params.remindType,
      skipOperation: skipOperation.value,
    })
    Taro.hideLoading()
    emit('closeQequestLoading', params.remindType === '10' ? 'canTake' : 'canExpediting')
    // 10 催件成功 20 失败  30温馨提示
    if (res?.code === 0 && [10, 30].includes(res?.data?.remindResultType)) {
      if (isGuide.value) {
        Taro.showToast({ title: '催件成功', icon: 'none' })
        show.value = false
        if (params.remindType === '10') {
          report_EXP_event('exp_urgetake_succeed_v1')
        } else {
          report_EXP_event('exp_urgedelivery_succeed_v1')
        }
      } else {
        tipText.value = res.data.note
        lastRemindRecordMsg.value = res.data.message
        guideOperationType.value = res.data?.guideOperationType
        remindResultType.value = res?.data?.remindResultType
        // 新的埋点
        const buttonName = primaryButton[guideOperationType.value]
        report_EXP_event(getEventCode.value?.exp, {
          ...getEventParams.value,
          button_name: '我知道了' + `${buttonName ? ',' + buttonName : ''}`,
        })
        if (guideOperationType.value === 40) {
          showOpenPush()
        } else {
          show.value = true
        }
      }
    } else {
      showToast({ title: res?.data?.note || res.msg, icon: 'none', toastId: props.toastId })
      show.value = false
      report_EXP_event('exp_urge_repetition_v1', {
        urgefrom: params.remindType === '10' ? '催取' : '催派',
      })
    }
  } catch (error) {
    console.log(error)
    Taro.hideLoading()
    emit('closeQequestLoading', params.remindType === '10' ? 'canTake' : 'canExpediting')
  }
}

const emit = defineEmits(['handleEditReadyTime', 'routerPush', 'closeQequestLoading'])

const showOpenPush = async () => {
  const modalResult = await Taro.showModal({
    title: '开启物流推送',
    content: '请点击【物流详情-物流推送】开启功能，实时关注本运单状态',
    cancelText: '我知道了',
    confirmText: '帮我开启',
  })
  if (!modalResult.confirm) {
    return
  }
  if (props.source === 'waybill-route-page') {
    handlePrimary()
    return
  }
  const res = await switchPushConfig(curParams.value?.waybillNumber, props.open)
  if (res?.type === 'app') {
    showOfficial.value = true
    await nextTick()
    officialAccountRef.value?.openPopup()
  }
}

// 修改货好时间
const handleEditReadyTime = () => {
  emit('handleEditReadyTime')
}

// 开启物流推送
const openLogisticsPush = () => {
  emit('routerPush', 'logistics')
}

// 自提信息
const branchPickInfo = () => {
  emit('routerPush', 'branchPickInfo')
}

// 我要催件
const urgentRequest = () => {
  skipOperation.value = 10
  getLastRemindRecord(curParams.value)
}

const contactBusiness = () => {
  showBussiness.value = true
}

const handlePrimary = () => {
  switch (guideOperationType.value) {
    case 10:
      handleEditReadyTime()
      show.value = false
      break
    case 30:
      urgentRequest()
      break
    case 20:
      branchPickInfo()
      show.value = false
      break
    case 40:
      openLogisticsPush()
      show.value = false
      break
    case 50:
      contactBusiness()
      show.value = false
      break
    default:
      break
  }
  if (guideOperationType.value === 30) {
    report_CLK_event('clk_urgedelivery_selfpickup_button_v1', {
      waybillorder: curParams.value?.waybillNumber,
      button_name: '我要催件',
    })
  }
  if (guideOperationType.value === 20) {
    report_CLK_event('clk_urgedelivery_selfpickup_button_v1', {
      waybillorder: curParams.value?.waybillNumber,
      button_name: '查看网点自提',
    })
  }
  if (guideOperationType.value === 40) {
    report_CLK_event('clk_urgedelivery_selfpickup_button_v1', {
      waybillorder: curParams.value?.waybillNumber,
      button_name: '物流推送',
    })
  }
  if (guideOperationType.value === 10) {
    report_CLK_event('clk_urgetake_goodstime_button_v1', {
      waybillorder: curParams.value?.waybillNumber,
      button_name: '修改货好时间',
    })
  }
  report_CLK_event(getEventCode.value?.click, {
    ...getEventParams.value,
    button_name: primaryButton[guideOperationType.value],
  })
}

const handleSee = () => {
  show.value = false
  // 新埋点
  report_CLK_event(getEventCode.value?.click, {
    ...getEventParams.value,
    button_name: '我知道了',
  })
  if (guideOperationType.value === 10) {
    report_CLK_event('clk_urgetake_goodstime_button_v1', {
      waybillorder: curParams.value?.waybillNumber,
      button_name: '我知道了',
    })
  }
  if (guideOperationType.value === 20 || guideOperationType.value === 30) {
    report_CLK_event('clk_urgedelivery_selfpickup_button_v1', {
      waybillorder: curParams.value?.waybillNumber,
      button_name: '我知道了',
    })
  }
}

defineExpose({
  openPopup,
})
</script>
