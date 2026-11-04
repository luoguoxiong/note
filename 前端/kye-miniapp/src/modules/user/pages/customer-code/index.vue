<template>
  <view class="customer-code-index">
    <!-- Loading 状态 -->
    <view v-if="loading" class="loading-container">
      <ky-loading type="spinner" size="40px" color="#8365f3" />
      <text class="loading-text">正在加载...</text>
    </view>

    <template v-if="!loading">
      <!-- 公共部分: Banner + 装饰标题 -->
      <Banner />

      <view class="customer-code-index__content">
        <DecorateTitle :title="pageTitle" />

        <!-- 绑定模式 (status=1) -->
        <BindCodeForm
          v-if="mode === 'bind'"
          ref="bindFormRef"
          :has-business="hasBusiness"
          :apply-button-text="applyButtonText"
          :subtitle="pageSubtitle"
          :subType="subType"
          @confirm="handleBindConfirm"
          @cancel="handleCancel"
          @apply="handleBindApply"
          @forget="handleBindForget"
          @contactBusiness="handleContactBusiness"
          @contactManager="handleContactManager"
          @learnMore="handleLearnMore"
        />

        <!-- 更换模式 (status=3) -->
        <template v-if="mode === 'change'">
          <ChangeCodeCard
            :show-department="isExpressType"
            @switch-department="handleSwitchDept"
            @apply-other="handleApplyOther"
            @unbind="initMode"
          />
        </template>

        <!-- 切换模式 (status=2) -->
        <view v-if="mode === 'switch'" class="switch-mode-container">
          <CompanyList
            ref="companyListRef"
            :show-manage-mode="true"
            :is-express-type="isExpressType"
            :show-footer="true"
            :config-data="configData"
            max-height="calc(100vh - 520px)"
            @switch="handleSwitch"
            @unbind="handleUnbind"
            @add-code="handleAddCode"
            @add-bind="handleAddBind"
            @apply-bind="handleApplyBind"
            @refresh="handleRefreshList"
          />
        </view>

        <!-- 猜您绑定模式 (type=120) -->
        <!-- <GuessCompanyList
          v-if="mode === 'guess'"
          @bind="handleGuessBind"
          @jump-bind="handleGuessJumpBind"
          @apply="handleApply"
        /> -->
      </view>
    </template>
  </view>
  <!-- 联系管理员 -->
  <ContactManager
    v-model:show="showManager"
    :roleName="managerInfo?.role || ''"
    :phone="userInfo?.phone || ''"
    :hideNeedClose="false"
    :managerInfo="managerInfo"
    :offset-bottom="isH5Env ? 50 : 0"
  ></ContactManager>
</template>

<script setup lang="ts">
/**
 * 客户编码统一入口页
 *
 * 与 H5 项目 page/index.jsx 保持一致：
 * - 统一入口，根据 API 返回的权限信息自动判断显示哪种模式
 * - 支持三种模式：绑定(bind)、切换(switch)、更换(change)
 * - 采用方案B：先显示 loading，异步加载后切换
 *
 * 公共UI结构:
 * ┌─────────────────────────────┐
 * │  Banner (客户编码图片)       │ ← 公共
 * │  DecorateTitle (模式标题)     │ ← 公共
 * ├─────────────────────────────┤
 * │  模式特定内容                │ ← 根据mode渲染
 * │  - BindCodeForm             │
 * │  - ChangeCodeCard           │
 * │  - CompanyList              │
 * └─────────────────────────────┘
 */
import { ref, computed, defineAsyncComponent } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { useCustomerCodeMode } from './hooks/useCustomerCodeMode'
import { useCustomerCodeEventBus, CC_EVENTS } from './hooks/useCustomerCodeEventBus'
import type { CustomerCodeMode } from './hooks/useCustomerCodeMode'
import Banner from './components/shared/Banner.vue'
import DecorateTitle from './components/shared/DecorateTitle.vue'
import BindCodeForm from './components/bind-code/index.vue'
import ChangeCodeCard from './components/change-code/index.vue'
import CompanyList from './components/switch-code/index.vue'
// import GuessCompanyList from './components/switch-code/GuessCompanyList.vue'
import { getToken } from '@/public/storage'
import { isH5Env } from '@/public/utils'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { useUserInfo } from '@/public/hooks'
import { getAppUserRelationAuth, getOtherBindApplyDetail, getConfig, getApplyVirtualContact } from '@modules/user/apis/customerCode'
const ContactManager = defineAsyncComponent(() => import('./components/contact-business/index.vue'))
const { autoLoginHook } = useAutoLogin()

const { mode, loading, pageUrlTitle, initMode, setMode } = useCustomerCodeMode()
const { emit: emitEvent } = useCustomerCodeEventBus()
const hasToken = ref(!!getToken())
/** 组件引用 */
const bindFormRef = ref()
const companyListRef = ref()

/** 配置数据（按钮列表，来自 getConfig 接口） */
const configData = ref<any>({})

const subType = ref('')

/** 是否有匹配商务（来自 getAppUserRelationAuth API 的 res.hasBusiness 字段） */
const hasBusiness = ref<boolean | null>(null)

const showManager = ref(false)
const managerInfo = ref<any>({})
const { userInfo } = useUserInfo()

/** 申请按钮自定义文案（从 configData.btnLists 获取） */
/** H5: configData.btnLists.find(e => e.scene == 'applyCustomerCode').buttonname */
const applyButtonText = computed(() => {
  if (!configData.value?.btnLists) return ''
  const btnConfig = configData.value.btnLists.find((item: any) => item.scene === 'applyCustomerCode')
  return btnConfig?.buttonname || ''
})

/** 是否快速寄件页 */
const isExpressType = computed(() => {
  const instance = Taro.getCurrentInstance()
  const routerParams = instance.router?.params || {}
  return routerParams.express_type === '快速寄件页'
})

/** 路由传入的自定义标题（优先级高于默认标题） */
const customPageTitle = ref('')

/** 副标题/提示文案（子类型为"添加客户编码"时固定显示） */
const pageSubtitle = ref('')

/** 页面标题映射（支持路由参数覆盖） */
const pageTitle = computed(() => {
  if (customPageTitle.value) {
    return customPageTitle.value
  }
  const titleMap: Record<string, string> = {
    bind: '绑定客户编码',
    guess: '客户编码',
    switch: '切换客户编码',
    change: '更换客户编码',
  }
  return titleMap[mode.value] || '绑定客户编码'
})

/**
 * 页面加载时初始化模式
 */
useDidShow(async () => {
  let token = getToken()
  if (!token) {
    await autoLoginHook({ needLogin: true })

    token = getToken()
    if (!token) {
      return
    }
  }
  hasToken.value = true

  // 检查路由参数（支持从其他页面跳转时传入模式和标题）
  const instance = Taro.getCurrentInstance()
  const routerParams = instance.router?.params || {}
  const routeMode = routerParams.mode as CustomerCodeMode | undefined
  const routeTitle = routerParams.title ? decodeURIComponent(routerParams.title) : ''

  // 如果有路由传入的自定义标题，存储到响应式变量
  if (routeTitle) {
    customPageTitle.value = routeTitle
  }

  // 解析绑定子类型（bind=绑定客户编码, add=添加客户编码, change=更换客户编码）
  subType.value = routerParams.subType as string | undefined
  if (subType.value === 'add') {
    // 添加客户编码模式：固定副标题 + 隐藏联系商务等操作区
    customPageTitle.value = routeTitle || '添加客户编码'
    pageSubtitle.value = '添加客户编码成功后，将自动切换为当前绑定'
  } else if (subType.value === 'change') {
    // 更换客户编码模式：固定标题为"更换客户编码"
    customPageTitle.value = routeTitle || '填写新的客户编码'
    pageSubtitle.value = '更换成功后将替换之前的客户编码'
  }

  // 如果有路由参数中的模式，直接使用该模式
  if (routeMode && ['bind', 'guess', 'switch', 'change'].includes(routeMode)) {
    setMode(routeMode)
    Taro.setNavigationBarTitle({ title: pageTitle.value === '填写新的客户编码' ? '更换客户编码' : pageTitle.value })
  } else {
    // 并行获取：模式信息 + 商务状态 + 配置数据
    const [modeResult, authResult, configResult] = await Promise.allSettled([
      initMode(),
      fetchHasBusiness(),
      fetchConfigData(),
    ])

    // 处理商务状态
    if (authResult.status === 'fulfilled') {
      hasBusiness.value = authResult.value
    }

    // 处理配置数据
    if (configResult.status === 'fulfilled') {
      configData.value = configResult.value
    }

    Taro.setNavigationBarTitle({
      title: pageUrlTitle.value,
    })
  }
})

/**
 * 获取用户商务匹配状态（hasBusiness）
 *
 * H5 来源 (page/index.jsx:284-286):
 *   const getUserAuth = async () => {
 *     let res = await customerService.getAppUserRelationAuth().catch((err) => {})
 *     setHasBusiness((res && res.hasBusiness) || false)
 *   }
 */
const fetchHasBusiness = async (): Promise<boolean> => {
  try {
    const res: any = await getAppUserRelationAuth()
    const data = res?.data || res
    return (data && data.hasBusiness) || false
  } catch (error) {
    console.warn('获取商务状态失败:', error)
    return false
  }
}

/**
 * 获取配置数据（按钮列表等）
 *
 * H5 来源 (bindCode/index.jsx:195-201):
 *   useEffect(() => {
 *     if (configData?.btnLists) {
 *       setBindCodeChangeCompany(configData.btnLists.find(e => e.scene == 'applyCustomerCode') || {})
 *     }
 *   }, [])
 */
const fetchConfigData = async (): Promise<any> => {
  try {
    const res: any = await getConfig({ source: 20 }) // 来源，20-跨越寄件扫码 || 60-整车扫码
    return res?.data || res || {}
  } catch (error) {
    console.warn('获取配置数据失败:', error)
    return {}
  }
}

// ==================== 绑定模式事件处理 ====================

/**
 * 绑码成功处理
 *
 * - 普通进入：仅提示 + 停留（用户手动返回）
 * - 从弹窗 subType=add 进入：通过 EventBus 通知弹窗刷新列表，然后自动返回
 */
const handleBindConfirm = (data?: any) => {
  console.log('绑定成功:', data)
  // Taro.showToast({ title: '绑码成功', icon: 'success' })

  // 检查是否从弹窗的"添加客户编码"入口进入
  const instance = Taro.getCurrentInstance()
  const routerParams = instance.router?.params || {}
  if (routerParams.subType === 'add') {
    // 通过 EventBus 通知弹窗：绑定已完成，请刷新列表
    const delivered = emitEvent(CC_EVENTS.ADD_BIND_SUCCESS, data)
    console.log('[EventBus] emit 结果:', delivered ? '已送达弹窗' : '无监听者')

    // 延迟返回，确保回调先执行完毕
    setTimeout(() => {
      Taro.navigateBack({ delta: 1 })
    }, 500)
  }
  if (routerParams.subType === 'change') {
    // 通过 EventBus 通知弹窗：绑定已完成，请刷新列表
    const delivered = emitEvent(CC_EVENTS.CHANGE_BIND_SUCCESS, data)
    console.log('[EventBus] emit 结果:', delivered ? '已送达弹窗' : '无监听者')
    Taro.navigateBack({ delta: 1 })
  }
}

const handleCancel = () => {
  Taro.navigateBack({ delta: 1 })
}

/** BindCodeForm - 申请商务回调 */
const handleBindApply = (url?: string) => {
  // TODO: [待实现] 跳转申请客户编码页面
  // H5: onApply(url) -> BusinessStore.onApply() 获取轻应用URL后跳转
  if (url) {
    console.log('跳转申请页URL:', url)
  }
  Taro.showToast({ title: '即将跳转申请页', icon: 'none' })
}

/** BindCodeForm - 忘记密码回调 */
const handleBindForget = (customerCode: string) => {
  console.log('忘记密码, customerCode:', customerCode)
}

/** BindCodeForm - 联系商务回调 */
const handleContactBusiness = () => {
  // TODO: 后续集成联系商务组件
  Taro.showToast({ title: '该功能暂不支持', icon: 'none' })
}

// 联系管理员
const handleContactManager = async (code) => {
  try {
    const res = await getApplyVirtualContact({
      customer: code,
      outPhone: userInfo?.value?.phone,
      from: '10',
    })
    console.log(res, '获取管理员信息')
    managerInfo.value = res?.data || {}
    managerInfo.value.customerCode = code
    showManager.value = true
  } catch (e) {
    console.log(e)
  }
}

/** BindCodeForm - 了解更多回调 */
const handleLearnMore = () => {
  // TODO: [待实现] 跳转客户介绍页面
  // H5: onCustomerIntro() -> 显示 CustomerIntro 组件
  console.log('了解更多')
}

// ==================== 更换模式事件处理 ====================

const handleSwitchDept = (dept: any) => {
  console.log('切换部门:', dept)
}

/**
 * 申请绑定其他公司（更换模式）
 *
 * H5 原始流程 (handleApplyBind):
 * 1. 调用 getAppUserRelationAuth 检查权限
 * 2. 有 bindAuth → 直接刷新列表
 * 3. 无权限 → 调用 getOtherBindApplyDetail 获取申请状态后跳转申请页
 */
async function handleApplyOther() {
  try {
    Taro.showLoading({ title: '加载中...', mask: true })
    const res: any = await getAppUserRelationAuth()
    const data = res?.data || res

    if (data?.bindAuth) {
      // 有权限 - 刷新公司列表
      Taro.hideLoading()
      handleRefreshList()
    } else {
      // 无权限 - 获取申请详情后跳转
      const detailRes: any = await getOtherBindApplyDetail()
      const detailData = detailRes?.data || detailRes
      const applyStatus = detailData.applyStatus || ''
      Taro.hideLoading()

      // 触发申请绑定流程：title=3(更换), applyStatus=当前状态
      handleApplyBindFlow('3', applyStatus)
    }
  } catch (error: any) {
    Taro.hideLoading()
    if (error?.code !== 100201) {
      Taro.showToast({ title: error?.msg || '服务错误', icon: 'none' })
    }
  }
}

/**
 * 执行申请绑定跳转
 *
 * @param title - 场景标识: 1=绑定, 2=添加, 3=更换, 4=切换
 * @param applyStatus - 申请状态
 */
const handleApplyBindFlow = (title: string, applyStatus: string) => {
  // TODO: 根据项目实际路由配置跳转到申请页面
  // H5 跳转逻辑: onApplyBind(title, applyStatus) -> customer-code.html#/apply-bind 或 #/apply-bind-result
  console.log('申请绑定其他公司:', { title, applyStatus })

  if (applyStatus === '10') {
    // 已有申请 - 跳转结果页
    Taro.showToast({ title: '已有申请在审核中', icon: 'none' })
  } else {
    // 跳转申请页
    Taro.showToast({ title: '即将跳转申请页', icon: 'none' })
  }
}

/** 解绑成功后刷新页面 */
const handleUnbind = () => initMode()

// ==================== 切换模式事件处理 ====================

const handleSwitch = (company: any) => {
  console.log('切换公司:', company)
  // Taro.showToast({ title: '切换成功', icon: 'success' })
}

const handleAddCode = () => {
  mode.value = 'bind'
}

/** SwitchCodeFooter - 添加客户编码回调 */
const handleAddBind = (url?: string) => {
  console.log('添加客户编码:', url)
  if (url) {
    // 有自定义跳转URL（来自配置接口）
    console.log('跳转URL:', url)
  } else {
    mode.value = 'bind'
  }
}

/** SwitchCodeFooter - 申请绑定回调 */
const handleApplyBind = (title: string, applyStatus: string) => {
  handleApplyBindFlow(title, applyStatus)
}

/** SwitchCodeFooter - 刷新列表回调 */
const handleRefreshList = () => {
  console.log('刷新公司列表')
  if (companyListRef.value) {
    companyListRef.value.fetchList?.()
  }
}

// ==================== 猜您绑定模式事件处理 ====================

/** 猜您绑定 - 绑定成功回调 */
const handleGuessBind = (data?: any) => {
  console.log('猜您绑定成功:', data)
  // Taro.showToast({ title: '绑码成功', icon: 'success' })
}

/** 猜您绑定 - 跳转手动绑码 */
const handleGuessJumpBind = () => {
  mode.value = 'bind'
}

/** 猜您绑定/通用 - 申请客户编码 */
const handleApply = () => {
  console.log('申请客户编码')
  // TODO: 跳转申请客户编码页面
  Taro.showToast({ title: '即将跳转申请页', icon: 'none' })
}
</script>

<style lang="scss">
.customer-code-index {
  min-height: 100vh;
  background-color: #fff;

  &__content {
    position: relative;
    z-index: 1;
    margin-top: -24px;
    border-radius: 24px 24px 0px 0px;
    overflow: hidden;
    background-color: #fff;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #ffffff;

    .loading-text {
      margin-top: 16px;
      font-size: 14px;
      color: #666666;
    }
  }

  .switch-mode-container {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 200px);
    padding-bottom: 120px; // 为底部操作栏留空间
  }
}
</style>
