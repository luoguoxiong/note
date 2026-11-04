<template>
  <view class="third-signIn-page" v-if="statusMsg">
    <image class="img" :src="statusMsg.imgSrc"></image>
    <view class="title">{{ statusMsg.title }}</view>
    <view class="desc">{{ statusMsg.desc }}</view>
    <view class="btn" v-show="status === 'success'" @click="goBackHome">返回首页</view>
  </view>
</template>

<script lang="ts" setup>
import './index.scss'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { computed, ref } from 'vue'
import { useLogin } from '@/public/hooks'
import { getQueryObject, isLogined, uuid } from '@/public/utils'
import { getLocationValueWithAuth } from '@/public/getLocaltion'
import { report_EXP_event, report_other_event, report_pv_event } from '@/public/utils/reportUtil'

import { getThirdBusinessSignStatus } from '../apis'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'

const router = useRouter()
enum StatusMap {
  success = 'success',
  expire = 'expire',
  fail = 'fail',
}

const statusMap = {
  success: {
    imgSrc: 'https://ic-img.ky-express.com/netc/20251121_62059_!!1763688185254_280_280.png',
    title: '扫码成功',
    desc: '感谢您的配合，更多跨越速运详情可点击查看',
  },
  expire: {
    imgSrc: 'https://ic-img.ky-express.com/netc/20251121_74598_!!1763688187071_280_280.png',
    title: '二维码失效',
    desc: '请关闭小程序后，重新扫码',
  },
  fail: {
    imgSrc: 'https://ic-img.ky-express.com/netc/20251121_9231_!!1763688181384_560_560.png',
    title: '扫码失败',
    desc: '请关闭小程序后，重新扫码',
  },
}

const otherEventCode = {
  结果页初次展示: 'facetoface_result_show',
  当前用户登录态: 'facetoface_result_status',
  '上报已扫码，调用接口前': 'facetoface_isscan_request',
  '上报已扫码，调用接口后': 'facetoface_isscan_result',
  '上报扫码结果，调用接口前': 'facetoface_result_request',
  '上报扫码结果，调用接口后': 'facetoface_result_result',
}

const { isLogin } = useLogin()
const status = ref<StatusMap>()
const workId = ref('')

const statusMsg = computed(() => {
  return status.value ? statusMap[status.value] : null
})

const goBackHome = () => {
  Taro.switchTab({ url: '/layout/pages/home/index' })
}

// 请求接口前，埋点上报
const postApiBeforeReport = () => {
  report_other_event(otherEventCode['上报扫码结果，调用接口前'], {
    workId: workId.value,
    performanceNow: new Date().getTime(),
  })
}

// 请求接口后，埋点上报
const postApiAfterReport = (is_success, traceId) => {
  report_other_event(otherEventCode['上报扫码结果，调用接口后'], {
    workId: workId.value,
    performanceNow: new Date().getTime(),
    is_success,
    traceId,
  })
}

// 上报已扫码前，埋点上报
const scanCodeBeforeReport = () => {
  report_other_event(otherEventCode['上报已扫码，调用接口前'], {
    workId: workId.value,
    performanceNow: new Date().getTime(),
  })
}

// 上报已扫码后，埋点上报
const scanCodeAfterReport = (is_success, traceId) => {
  report_other_event(otherEventCode['上报已扫码，调用接口后'], {
    workId: workId.value,
    performanceNow: new Date().getTime(),
    is_success,
    traceId,
  })
}

// 扫码结果接口调用
const scanCodeAfter = async () => {
  postApiBeforeReport()
  try {
    const { scene } = router.params
    const { u } = getQueryObject(decodeURIComponent(scene as string))
    const { code, data, msg, traceId } = await getThirdBusinessSignStatus({
      uuid: u,
      optType: 20,
    })
    report_other_event(otherEventCode['结果页初次展示'], {
      workId: workId.value,
      performanceNow: new Date().getTime(),
    })
    postApiAfterReport(code === 0 ? '是' : '否', traceId)
    if (code === 0) {
      const { qrcodeStatus } = data
      const qrcodeStatusMap: Record<2 | 3, StatusMap> = {
        2: StatusMap.success,
        3: StatusMap.expire,
      }
      status.value = qrcodeStatusMap[qrcodeStatus]
      report_other_event('other_facetoface_result_v1', {
        page_code: 'page_facetoface_result_v1',
        event_name: '面对面签到_扫码结果页_扫码结果',
        scan_result: +qrcodeStatus === 3 ? '二维码失效' : '扫码成功',
      })
    } else {
      throw msg
    }
  } catch (error) {
    console.error(error)
    status.value = StatusMap.fail
    report_other_event('other_facetoface_result_v1', {
      page_code: 'page_facetoface_result_v1',
      event_name: '面对面签到_扫码结果页_扫码结果',
      scan_result: '扫码失败',
    })
  }
}

const { autoLoginHook } = useAutoLogin()

useDidShow(async () => {
  try {
    await autoLoginHook({ needLogin: true })
    report_pv_event('page_facetoface_result_v1')
    workId.value = uuid()
    report_other_event(otherEventCode['当前用户登录态'], {
      workId: workId.value,
      performanceNow: new Date().getTime(),
      is_login: isLogin ? '是' : '否',
    })
    if (!isLogined()) return
    try {
      scanCodeBeforeReport()
      const { lat, lng } = await getLocationValueWithAuth()
      const { scene } = router.params
      const { u } = getQueryObject(decodeURIComponent(scene as string))
      const params = {
        uuid: u,
        optType: 10,
      }
      // 存在经纬度
      if (lat && lng) {
        params['address'] = { lat, lng }
      }
      const { code, traceId } = await getThirdBusinessSignStatus(params)
      scanCodeAfterReport(code === 0 ? '是' : '否', traceId)
      if (code === 0) {
        console.log(code, '999')
        scanCodeAfter()
      }
    } catch (error) {
      console.error(error)
    }
  } catch (error) {
    console.error(error)
  }
})
</script>
