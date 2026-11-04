<template>
  <div class="realname-page-home" v-if="relaNameSwitch">
    <!-- 温馨提示 -->
    <div class="tip lineHeight36" @click="onClickNoticeExplain(noticeExplain)" v-show="noticeExplain">
      <span class="noticeExplain"> 温馨提示：{{ noticeExplain }} </span>
      <image
        src="https://ic-img.ky-express.com/netc/20260325_74722_!!1774426298822_32_32.svg+xml"
        class="page-home-arrow"
      />
    </div>

    <div class="realname-page-home__body">
      <!-- 个人认证卡片 -->
      <AuthCard
        :type="'personal'"
        :is-authenticated="!!personalInfo"
        :info="personalInfo"
        :show-reward="personFirstFlag"
        @click="goPage('Personal', personalInfo)"
      />

      <!-- 企业认证卡片 -->
      <AuthCard
        v-if="!isCommonOrFence"
        :type="'enterprise'"
        :is-authenticated="!!enterpriseInfo"
        :info="enterpriseInfo"
        :show-reward="enterpriseFirstFlag"
        :is-disabled="isCommonOrFence"
        :show-tooltip="showCompanyTooltip"
        @click="isCommonOrFence ? onShowCompanyTooltip() : goPage('Enterprise', enterpriseInfo)"
      />
    </div>

    <CustomerBindDialog
      express-type="企业认证"
      :need-adjust-position="true"
      v-model:visible="isShowCustomerBindDialog"
      @update-customer-code="reloadPage"
    />
  </div>
  <page-loading :show="isShowPageLoading" :preload="preloadLoadingImg" />
</template>

<script setup lang="ts">
import './index.scss'
import { ref, computed } from 'vue'
defineOptions({ name: 'RealnameHomePage' })
import delay from 'lodash-es/delay'
import { getAuthDetail } from '@modules/user/apis/realname'
import { getQueryObject, report_CLK_event, report_EXP_event, urlContact } from '@/public/utils'
import { useRealNameStore } from '../store'
import {
  CUSTOMER_TYPE,
  ENTERPRISE_DISABLE_FLAG,
  CONFIG,
  type PersonalInfo,
  type EnterpriseInfo,
  type ForceVerifyObj,
  type RouteName,
} from '../hooks'
import { useUserInfo, useLogin } from '@/public/hooks'
import { openLoginPage } from '@/public/utils/request/useLogOutTip/openLogin'
import Taro, { useDidShow } from '@tarojs/taro'
import { myAtob } from '../hooks/useAtob'
import { isFromScan } from '../hooks/useEnterpriseData'
import { redirectToH5, relaNameSwitch } from '@public/hooks/useRedirectH5ToNative'
// @ts-ignore
import { showDialog } from '@kye-netc/kye-miniui'

// 组件引入
import AuthCard from '../components/auth-card.vue'
import PageLoading from '@/modules/user/components/page-loading/index.vue'
import CustomerBindDialog from '@/modules/user/pages/customer-code/customer-code-popup/index.vue'

const realNameStore = useRealNameStore()

// ==================== 响应式数据 ====================

/** 加载状态 */
const loading = ref<boolean>(true)

/** 公告内容 */
const noticeExplain = ref<string>('')

/** 个人认证信息 */
const personalInfo = ref<PersonalInfo | null>(null)

/** 企业认证信息 */
const enterpriseInfo = ref<EnterpriseInfo | null>(null)

/** 是否显示半屏绑码弹窗 */
const isShowCustomerBindDialog = ref<boolean>(false)

/** 是否更新客户编码 */
const updateCustomerCode = ref<boolean>(false)

/** 显示企业提示 */
const showCompanyTooltip = ref<boolean>(false)

/** 个人实名认证送积分标识 */
const personFirstFlag = ref<boolean>(false)

/** 企业实名认证送积分标识 */
const enterpriseFirstFlag = ref<boolean>(false)

/** 客户后台类型 */
const customerType = ref<string>('')

/** 企业认证是否置灰 */
const enterpriseDisableFlag = ref<string>('')

/** pageLoading */
const isShowPageLoading = ref<boolean>(false)

/** 是否预加载图片 */
const preloadLoadingImg = ref<boolean>(false)

// ==================== 计算属性 ====================

/** 是否公共后台或围栏后台 */
const isCommonOrFence = computed<boolean>(() => {
  return (
    [CUSTOMER_TYPE.COMMON, CUSTOMER_TYPE.FENCE].includes(customerType.value as any) ||
    enterpriseDisableFlag.value === ENTERPRISE_DISABLE_FLAG.DISABLED
  )
})

/**
 * 初始化查询参数
 */
const initQueryData = (): void => {
  const { orderPageSource, uniqueId, forceFlag, otherPhone, idName } = getQueryObject()

  let decodedPhone = ''
  if (otherPhone) {
    try {
      decodedPhone = myAtob(otherPhone)
    } catch (error) {
      console.error('Base64 解码失败:', error)
      decodedPhone = otherPhone
    }
  }

  const forceVerifyObj: ForceVerifyObj = {
    orderPageSource,
    uniqueId,
    forceFlag,
    otherPhone: decodedPhone,
    idName: idName ? decodeURIComponent(idName) : '',
  }

  realNameStore.setForceVerifyObj(forceVerifyObj)
}

/**
 * 处理认证数据
 */
const handleAuthData = (data: any): void => {
  // 个人认证信息
  personalInfo.value = data.personCertification
  noticeExplain.value = data.noticeExplain || ''
  personFirstFlag.value = data.personFirstFlag === CUSTOMER_TYPE.NORMAL
  enterpriseFirstFlag.value = data.enterpriseFirstFlag === CUSTOMER_TYPE.NORMAL

  // 存储个人认证信息
  realNameStore.setPersonal(personalInfo.value ? '1' : '')
  realNameStore.setPersonInfo({
    ...personalInfo.value,
    isSupportForeignOCR: data.isSupportForeignOCR,
  })

  // 企业认证信息
  enterpriseInfo.value = data.enterpriseCertification
  realNameStore.setEnterprise(enterpriseInfo.value ? '1' : '')
  realNameStore.setEnterpriseInfo({ ...enterpriseInfo.value })

  // 客户类型
  customerType.value = data.customerType
  enterpriseDisableFlag.value = data.enterpriseDisableFlag
}

/**
 * 初始化数据
 */
const initData = async (): Promise<void> => {
  try {
    // Taro.showLoading({ mask: true, title: CONFIG.RELOAD_MESSAGE })

    const authDetail = await getAuthDetail({})

    if (authDetail.data) {
      handleAuthData(authDetail.data)
    }
  } catch (error) {
    // Toast.fail((error as Error).message)
  } finally {
    loading.value = false
    // Taro.hideLoading()
    isShowPageLoading.value = false
  }
}

const { isLogin } = useLogin()
const { userInfo } = useUserInfo()
/**
 * 重新加载页面
 */
const reloadPage = async (): Promise<void> => {
  updateCustomerCode.value = false
  // Taro.showLoading({ mask: true, title: CONFIG.RELOAD_MESSAGE })
  isShowPageLoading.value = true

  const doReload = async () => {
    await initData()
  }

  setTimeout(doReload, CONFIG.RELOAD_DELAY)
}

/**
 * 处理企业认证检查
 */
const checkEnterpriseAuth = (name: RouteName): boolean => {
  if (name === 'Enterprise' && !userInfo.value?.customerCode) {
    report_EXP_event('exp_id_company_popup')
    isShowCustomerBindDialog.value = true
    return false
  }
  return true
}

/**
 * 上报埋点事件
 */
const reportAuthEvent = (name: RouteName, workId: number): void => {
  const buttonName = name === 'Personal' ? '个人认证' : '企业认证'
  report_CLK_event('clk_identification_button_name', {
    button_name: buttonName,
    work_id: workId,
  })
}

/**
 * 处理路由跳转
 */
const handleRouteNavigation = (name: RouteName, data: PersonalInfo | EnterpriseInfo | null, workId: number): void => {
  const urlMap = {
    Personal: '/modules/user/pages/realname/personal/index',
    Enterprise: '/modules/user/pages/realname/enterprise/step-one/index',
    VerifyInfo: '/modules/user/pages/realname/view-verify-info/index',
  }
  const url = urlMap[name]
  // 路由跳转逻辑
  if (data) {
    // 已认证，跳转查看认证信息
    Taro.navigateTo({
      url: urlContact(urlMap.VerifyInfo, { source: name, id: data.id, work_id: workId }),
    })
  } else {
    // 未认证，跳转认证页面
    Taro.navigateTo({
      url: urlContact(url, { work_id: workId }),
    })
  }
}

/**
 * 页面跳转
 */
const goPage = async (name: RouteName, data: PersonalInfo | EnterpriseInfo | null): Promise<void> => {
  const workId = Date.now()

  // 埋点上报
  reportAuthEvent(name, workId)

  // 企业认证需要绑定客户编码
  if (!checkEnterpriseAuth(name)) {
    return
  }

  preloadLoadingImg.value = true

  // 路由跳转
  handleRouteNavigation(name, data, workId)
}

/**
 * 点击温馨提示
 */
const onClickNoticeExplain = (notice: string): void => {
  // Dialog.alert({
  //   className: 'base-dialog left-dialog',
  //   title: CONFIG.DIALOG_TITLE,
  //   message: notice,
  //   confirmButtonText: CONFIG.DIALOG_CONFIRM,
  // })
  // Taro.showModal({
  //   title: CONFIG.DIALOG_TITLE,
  //   content: notice,
  //   confirmText: CONFIG.DIALOG_CONFIRM,
  //   showCancel: false,
  //   confirmColor: '#8365F6',
  // })
  showDialog({
    parentClassName: 'realname-page-home',
    zIndex: 1000,
    title: CONFIG.DIALOG_TITLE,
    message: notice,
    confirmButtonText: CONFIG.DIALOG_CONFIRM,
    showCancelButton: false,
  })
}

/**
 * 显示企业提示
 */
const onShowCompanyTooltip = (): void => {
  showCompanyTooltip.value = !showCompanyTooltip.value
  delay(() => {
    showCompanyTooltip.value = false
  }, CONFIG.TOOLTIP_DELAY)
}

// ==================== 生命周期 ====================

const initPage = async () => {
  const isRedirectToH5 = await redirectToH5('')
  if (isRedirectToH5) return
  if (!isLogin.value) {
    openLoginPage()
    return
  }

  initQueryData()
  initData()
}

/**
 * 组件挂载
 */
useDidShow(() => {
  initPage()
  isFromScan.value = false
  if (loading.value) return
  reloadPage()
})
</script>
