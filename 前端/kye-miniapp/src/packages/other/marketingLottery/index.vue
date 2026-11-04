<!--
  CRM营销抽奖活动
  摇奖活动主页面，支持填写公司信息、选择地址
-->
<template>
  <view v-if="activityInfo && isNotMatch" class="not-match">
    <NotMatch :mobile="routeParams.mobile" />
  </view>
  <view v-else class="container" :style="containerStyle">
    <view v-if="activityInfo">
      <!-- 活动未结束的情况 -->
      <view v-if="activityInfo.activityStatus !== 40">
        <view v-if="signed">
          <LotteryNumber :activity="activityInfo" />
        </view>
        <view v-else>
          <Participate
            :activity="activityInfo"
            :prize-list="prizeList"
            :company-name="companyName"
            :customer-name="customerName"
            :company-addr="companyAddr"
            :is-need-company-addr="isNeedCompanyAddr"
            :is-need-company-name="isNeedCompanyName"
            :is-need-customer-name="isNeedCustomerName"
            @click="onClick"
            @update:companyName="(val) => (companyName = val)"
            @update:customerName="(val) => (customerName = val)"
            @update:companyAddr="(val) => (companyAddr = val)"
            @page-scroll="handlePageScroll"
          />
        </view>
      </view>
      <!-- 活动已结束的情况 -->
      <view v-else-if="activityInfo.activityStatus === 40">
        <End :activity="activityInfo" />
      </view>
    </view>
    <view v-else class="loading">加载中...</view>
    
    <!-- 文字logo，与React项目逻辑一致 -->
    <view class="text-logo-box" v-if="!isNewTemplate || canAutoModel">
      <image class="text-logo" :src="IMG_BASE_URL + '/marketing-lottery/text-logo.png'" />
    </view>
    
    <RulesDialog :show="showRules" @hide="() => (showRules = false)" />
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { computed, onMounted, ref, type CSSProperties } from 'vue'
import { MODEL_IMG_OP, isAutoModel } from './constants'
import RulesDialog from './components/rulesDialog/index.vue'
import Participate from './components/participate/index.vue'
import LotteryNumber from './components/lotteryNumber/index.vue'
import End from './components/end/index.vue'
import NotMatch from './components/not-match/index.vue'
import Taro from '@tarojs/taro'
import MarketingLotteryAPI from './apis'
import { useUserInfo } from '@/public/hooks'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'

defineOptions({ name: 'MarketingLotteryPage' })

const IMG_BASE_URL = 'https://ic-h5.kye-erp.com/intro/miniprogram'

// 获取营销 URL
const getMarketingUrl = () => {
  const ENV = process.env.TARO_APP_ENV || ''
  if (ENV.includes('stg')) {
    return 'https://edge-stg.kye-erp.com/crm-marketing-open'
  } else if (ENV.includes('uat')) {
    return 'https://edge.uat.kye-erp.com/crm-marketing-open'
  } else {
    return 'https://www.kye-erp.com/crm-marketing-open'
  }
}

// 路由参数
const routeParams = ref<{ id?: string; scene?: string; mobile?: string }>({})
let activityId: string | null = null

// 状态
const init = ref(false)
const signed = ref(false)
const activityInfo = ref<any | null>(null)
const prizeList = ref<any[]>([])
const companyName = ref('')
const customerName = ref('')
const companyAddr = ref('')
const mobile = ref('')
const showAddressPopup = ref(false)
const showRules = ref(false)
const toLogin = ref(false)

// 用户信息和登录
const { userInfo: usrInfo } = useUserInfo()
const { autoLoginHook } = useAutoLogin()

// 计算属性与模板逻辑
const canAutoModel = computed(() => isAutoModel(activityInfo.value))
const isNewTemplate = computed(() => {
  return activityInfo.value && activityInfo.value.templateId !== null && +activityInfo.value.templateId === 0
})
const isNeedCompanyName = computed(() => activityInfo.value && +activityInfo.value.companyNameFlag === 20)
const isNeedCustomerName = computed(() => activityInfo.value && +activityInfo.value.customerNameFlag === 20)
const isNeedCompanyAddr = computed(() => activityInfo.value && +activityInfo.value.companyAddrFlag === 20)

const isNotMatch = computed(() => {
  if (!routeParams.value.mobile || !mobile.value) return false
  return routeParams.value.mobile !== mobile.value
})

const bgImgOp = computed(() => {
  const luckyActivityTemplate = (activityInfo.value && activityInfo.value.luckyActivityTemplate) || {}
  const { endPage, homePage, redemptionPage } = luckyActivityTemplate
  console.log('bgImgOp 计算:', {
    activityStatus: activityInfo.value?.activityStatus,
    signed: signed.value,
    canAutoModel: canAutoModel.value,
    isNewTemplate: isNewTemplate.value,
    luckyActivityTemplate,
    endPage,
    homePage,
    redemptionPage
  })
  
  if (!activityInfo.value) return MODEL_IMG_OP.initBg
  if (activityInfo.value.activityStatus === 40) {
    return canAutoModel.value
      ? { backgroundColor: '#4d46fa', backgroundImg: endPage }
      : isNewTemplate.value
        ? MODEL_IMG_OP.endBgNew
        : MODEL_IMG_OP.endBg
  }
  if (signed.value) {
    return canAutoModel.value
      ? { backgroundColor: '#4d46fa', backgroundImg: redemptionPage }
      : isNewTemplate.value
        ? MODEL_IMG_OP.lotteryBgNew
        : MODEL_IMG_OP.lotteryBg
  }
  return canAutoModel.value
    ? { backgroundColor: '#4d46fa', backgroundImg: homePage }
    : isNewTemplate.value
      ? MODEL_IMG_OP.initBgNew
      : MODEL_IMG_OP.initBg
})

const containerStyle = computed<CSSProperties>(() => ({
  background: `${init.value ? '#fefbf0' : bgImgOp.value.backgroundColor} url(${bgImgOp.value.backgroundImg}) no-repeat 0% 0%/100% 100%`,
  bottom: 0,
  position: showAddressPopup.value ? 'fixed' : undefined,
}))

// API 调用函数
async function getLuckyResultByPc() {
  console.log('=========getLuckyResultByPc=========')
  return new Promise(async (resolve, reject) => {
    try {
      Taro.showLoading()
      // 暂时使用模拟数据，避免网络请求问题
      // const res = { winningStatus: '0' }
      // resolve(res)
      
      // 真实 API 调用
      const res = await MarketingLotteryAPI.getLuckyResultByPc({ activityId: activityId! })
      resolve((res as any).data)
    } catch (error) {
      reject(error)
    } finally {
      Taro.hideLoading()
    }
  })
}

async function fetchActivityInfo() {
  try {
    Taro.showLoading({ mask: true, title: '正在加载中...' })
    // 真实 API 调用
    const response = await MarketingLotteryAPI.getActivityInfo({ activityId: activityId! })
    
    Taro.setNavigationBarTitle({
      title: '跨越速运'
    })
    prizeList.value = (response.data as any)?.appletPrizeList || []
    signed.value = +(response.data as any)?.status === 1
    activityInfo.value = response.data
    return response.data
  } catch (error) {
    console.log(error)
  } finally {
    Taro.hideLoading()
  }
}

// 表单验证
function beforeSaveCheck() {
  const inputCompanyName = companyName.value.trim()
  const inputCustomerName = customerName.value.trim()
  const inputCompanyAddr = companyAddr.value.trim()
  const REG_CHINESE = /[^\u4e00-\u9fa5]/
  const REG_CUSTOMER_NAME = /^[\u4E00-\u9FA5A-Za-z]+$/
  
  return new Promise((resolve, reject) => {
    let result: any = {}
    if (isNeedCustomerName.value) {
      if (!inputCustomerName.length) {
        return reject('请输入您的姓名')
      }
      if (!REG_CUSTOMER_NAME.test(inputCustomerName)) {
        return reject('姓名不能包含数字、特殊符号')
      }
      result.customerName = inputCustomerName
    }
    if (isNeedCompanyName.value) {
      if (!inputCompanyName.length) {
        return reject('请输入您的公司名称')
      }
      if (inputCompanyName.length < 4) {
        return reject('公司名称不能少于4个字')
      }
      if (REG_CHINESE.test(inputCompanyName)) {
        return reject('公司名称不能包含数字、字母、特殊符号')
      }
      result.companyName = inputCompanyName
    }
    if (isNeedCompanyAddr.value) {
      if (!inputCompanyAddr.length) {
        return reject('请输入您的公司地址')
      }
      result.companyAddr = inputCompanyAddr
    }
    return resolve(result)
  })
}

// 报名请求
async function onRequestSign() {
  try {
    const restParams = await beforeSaveCheck()
    Taro.showLoading({ mask: true, title: '正在加载中...' })
    
    // 真实 API 调用
    const response = await MarketingLotteryAPI.sign({
      activityId: activityId!,
      nickName: usrInfo.value.userName,
      mobile: mobile.value,
      ...(restParams as any)
    })
    
    const weUserInfo = await MarketingLotteryAPI.getActivityInfo({ activityId: activityId! })
    const headImg = (weUserInfo.data as any) ? (weUserInfo.data as any).headImg : ''
    
    Taro.hideLoading()
    const info = {
      activityId: activityId,
      nickName: usrInfo.value.userName,
      status: '1'
    }
    const old = {
      ...(activityInfo.value || ({} as any)),
      luckyCode: response.data,
      headImg,
    }
    Object.assign(info, old)
    activityInfo.value = info
    signed.value = true
  } catch (error: any) {
    Taro.hideLoading()
    if (error.msg) {
      Taro.showToast({
        title: error.msg,
        icon: 'none',
        duration: 3000
      })
    } else {
      Taro.showToast({
        title: error,
        icon: 'none',
        duration: 3000
      })
    }
    console.log(error)
  }
}

function onClick() {
  if (usrInfo.value.phone) {
    mobile.value = usrInfo.value.phone
    onRequestSign()
  } else {
    toLogin.value = true
    Taro.navigateTo({ url: '/modules/user/pages/login/index?showNewCustomer=0' })
  }
}

function handlePageScroll(fixed: boolean) {
  showAddressPopup.value = fixed
  if (!fixed) {
    setTimeout(() => {
      Taro.pageScrollTo({
        scrollTop: 2000,
        duration: 0
      })
    }, 0)
  }
}

// 解析 scene 参数的工具函数
function parseSceneParam(scene: string): string | null {
  if (!scene) return null
  try {
    // 尝试多次解码，处理多重编码的情况
    let decodedScene = scene
    let decodeCount = 0
    const maxDecodes = 3 // 最多解码3次，防止无限循环
    while (decodeCount < maxDecodes && decodedScene.includes('%')) {
      const beforeDecode = decodedScene
      decodedScene = decodeURIComponent(decodedScene)
      decodeCount++
      // 如果解码后没有变化，说明已经解码完成
      if (beforeDecode === decodedScene) {
        break
      }
    }
    // 尝试不同的解析方式
    // 方式1: "id=470616" (标准格式)
    if (decodedScene.includes('id=')) {
      const match = decodedScene.match(/id=([^&]+)/)
      if (match && match[1]) {
        console.log('方式1解析成功，activityId:', match[1])
        return match[1]
      }
    }
    // 方式2: 处理各种编码格式的 "id="
    const idPatterns = [
      /id%3D([^&%]+)/,      // id%3D470616
      /id%253D([^&%]+)/,    // id%253D470616 (双重编码)
      /id%25253D([^&%]+)/,  // id%25253D470616 (三重编码)
      /id=([^&]+)/          // id=470616
    ]
    for (let i = 0; i < idPatterns.length; i++) {
      const pattern = idPatterns[i]
      const match = scene.match(pattern) || decodedScene.match(pattern)
      if (match && match[1]) {
        console.log(`方式${i + 2}解析成功，activityId:`, match[1])
        return match[1]
      }
    }
    // 方式3: 直接提取数字ID
    const numberMatch = decodedScene.match(/\d+/)
    if (numberMatch) {
      return numberMatch[0]
    }
    return null
  } catch (error) {
    return null
  }
}

// 生命周期
onMounted(async () => {
  console.log('=== Vue项目 onMounted 开始 ===')
  try {
    // 获取路由参数
    const router = Taro.getCurrentInstance().router
    console.log('路由参数:', router?.params)
    
    if (router?.params?.id) {
      activityId = router.params.id
      console.log('从 id 参数获取 activityId:', activityId)
    } else if (router?.params?.scene) {
      const parsedId = parseSceneParam(router.params.scene)
      if (parsedId) {
        activityId = parsedId
        console.log('从 scene 参数解析得到 activityId:', activityId)
      }
    }
    
    // 如果没有获取到 activityId，使用默认值进行测试
    if (!activityId) {
      console.log('未获取到 activityId，使用默认值')
      activityId = 'test-activity-id'
    }
    
    console.log('当前 activityId:', activityId)
    console.log('Vue项目 API 调用参数:', { activityId: activityId })
    
    // 处理登录逻辑
    await autoLoginHook()
  } catch (error) {
    console.log('初始化失败:', error)
  }
  
  if (!init.value) {
    try {
      const res = await getLuckyResultByPc()
      if ((res as any).winningStatus === '1') {
        // 跳中奖结果页
        const base_url = `${getMarketingUrl()}/marketing-lottery.html#/result?id=${activityId}`
        Taro.redirectTo({
          url: `/packages/webview/openWebview?url=${encodeURIComponent(base_url)}&needLogin=true`,
        })
        return
      }
    } catch (error) {
      console.log('获取中奖结果失败:', error)
    }
  }
  
  init.value = true
  await fetchActivityInfo()
  
  if (toLogin.value && usrInfo.value.phone) {
    toLogin.value = false
    onClick()
  } else if (toLogin.value) {
    toLogin.value = false
  }
})
</script>
