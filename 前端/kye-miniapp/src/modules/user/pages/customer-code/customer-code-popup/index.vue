<template>
  <ky-popup
    :show="visible"
    position="bottom"
    :offset-bottom="isH5Env ? 50 : 0"
    :close-on-click-overlay="closeOnClickOverlay"
    @close="handleClose"
    @open="initFn"
  >
    <view class="customer-code-popup" :style="`display: ${showMore ? 'none' : 'block'};`">
      <view class="popup-header">
        <view class="popup-title">
          <text>{{ pageUrlTitle }}</text>
          <view class="help-icon" v-if="mode !== 'bind'" @click="handleLearnMore">
            <image src="https://ic-img.ky-express.com/netc/20260113_67497_!!1768310839937_64_64.png"></image>
          </view>
        </view>
        <view class="close-icon" @click="() => handleClose()">
          <image src="https://ic-img.ky-express.com/netc/20250118_42870395139_!!1737186469837_64_64.png"></image>
        </view>
      </view>
      <!-- Loading 状态 -->
      <view v-if="loading" class="loading-container">
        <ky-loading type="spinner" size="60px" color="#8365f3" />
        <text class="loading-text">正在加载...</text>
      </view>

      <template v-if="!loading">
        <!-- 公共部分: Banner + 装饰标题 -->
        <Banner />

        <!-- 绑定模式 (status=1) -->
        <BindCodeForm
          v-if="mode === 'bind'"
          ref="bindFormRef"
          isPopup
          :isFixed="false"
          :isSafeArea="isSingleOrder"
          :need-adjust-position="needAdjustPosition"
          :has-business="hasBusiness"
          :has-market-activity="hasMarketActivity"
          :apply-button-text="applyButtonText"
          @confirm="handleBindConfirm"
          @cancel="handleCancel"
          @contactBusiness="handleContactBusiness"
          @contactManager="handleContactManager"
          @learnMore="handleLearnMore"
        />

        <!-- 更换模式 (status=3) -->
        <template v-if="mode === 'change'">
          <ChangeCode
            type="popup"
            isPopup
            :isFixed="false"
            :isSafeArea="isSingleOrder"
            :show-department="isSingleOrder"
            @switch-department="handleSwitchDept"
            @apply-other="handleApplyOther"
            @unbind="handleUnbindConfirm"
            @handel-change-code="handelChangeCode"
            @switch-mode="handleSwitchMode"
          />
        </template>

        <!-- 切换模式 (status=2) -->
        <view v-if="mode === 'switch'" class="switch-mode-container">
          <CompanyList
            ref="companyListRef"
            isPopup
            :show-manage-mode="true"
            :is-express-type="isSingleOrder"
            :show-footer="true"
            :isFixed="false"
            :isSafeArea="isSingleOrder"
            :config-data="configData"
            max-height="calc(100vh - 520px)"
            @switch="handleSwitch"
            @unbind="handleUnbind"
            @add-bind="handleAddBind"
            @apply-bind="handleApplyBind"
            @refresh="handleRefreshListAndEmit"
          />
        </view>

        <!-- 猜您绑定模式 (type=120) -->
        <!-- <GuessCompanyList
          v-if="mode === 'guess'"
          @bind="handleGuessBind"
          @jump-bind="handleGuessJumpBind"
          @apply="handleApply"
        /> -->
      </template>
    </view>
    <customerIntro v-if="showMore" @cancel="handleMoreCancel" />
  </ky-popup>
  <!-- 联系商务 -->
  <ContactManager
    v-model:show="showBussiness"
    :phone="userInfo?.phone || ''"
    :hideNeedClose="false"
    :offset-bottom="isH5Env ? 50 : 0"
    @callError="handleCallError"
  ></ContactManager>
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
 * │  - ChangeCode           │
 * │  - CompanyList              │
 * └─────────────────────────────┘
 */
import './index.scss'
import { ref, computed, onUnmounted, nextTick, defineAsyncComponent } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { useCustomerCodeMode } from '../hooks/useCustomerCodeMode'
import { useCustomerCodeEventBus, CC_EVENTS } from '../hooks/useCustomerCodeEventBus'
import Banner from '../components/shared/Banner.vue'
// 懒加载：4 个模式组件 + 联系弹窗 + 介绍页，按需加载以减小主包体积
const BindCodeForm = defineAsyncComponent(() => import('../components/bind-code/index.vue'))
const ChangeCode = defineAsyncComponent(() => import('../components/change-code/index.vue'))
const CompanyList = defineAsyncComponent(() => import('../components/switch-code/index.vue'))
// import GuessCompanyList from '../components/switch-code/GuessCompanyList.vue'
const customerIntro = defineAsyncComponent(() => import('../components/customerIntro/index.vue'))
// const ContactBusiness = defineAsyncComponent(() => import('@/public/components/business/contact-business/index.vue'))
const ContactManager = defineAsyncComponent(() => import('../components/contact-business/index.vue'))
import { getToken } from '@/public/storage'
import { isH5Env } from '@/public/utils'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
// import { onLoginPageOpen } from '@public/utils/request/useLogOutTip/openLogin'
import { useUserInfo } from '@/public/hooks'
import { useRoleFlags } from '@/layout/pages/home/hooks'
import { getAppUserRelationAuth, getConfig, getApplyVirtualContact } from '@modules/user/apis/customerCode'
import { useMessageDataHook } from '@modules/webview/pages/webview/hooks/useMessageDataHook'
import { CurrentBindInfo } from '@/modules/user/apis/customerCode/types'
import { useUpdateSomeUserInfoV1 } from '@public/hooks/useUpdateSomeUserInfoV1'
import { useCustomerCodeStore } from '../store/customerCode'
import { setExpressType, exp_customer_code_bind_page } from '../report'

const { getMinePageUserInfo, globalUserStore } = useUpdateSomeUserInfoV1()
const { autoLoginHook } = useAutoLogin()
const { updateCustomerCodeHandler } = useMessageDataHook(() => {})
const customerCodeStore = useCustomerCodeStore()

interface Props {
  visible: boolean
  closeOnClickOverlay?: boolean
  showDepartment?: boolean
  expressType?: string
  /** 透传给 BindCodeForm：弹窗形态下首个输入框是否使用系统键盘避让。默认 false 防止 iOS 26 容器 focus 振荡；无底部 tabbar 的场景需传 true */
  needAdjustPosition?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closeOnClickOverlay: true,
  needAdjustPosition: false,
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel', 'switch', 'unbind', 'change', 'updateCustomerCode'])

const { mode, loading, initMode, pageUrlTitle } = useCustomerCodeMode()
const { once, clear: clearEvent } = useCustomerCodeEventBus()
const hasToken = ref(!!getToken())
const { userInfo } = useUserInfo()

const bindFormRef = ref()
const companyListRef = ref()

const isForceUpdate = ref(false)

const configData = ref<any>({})
const hasBusiness = ref<boolean | null>(null)
const hasMarketActivity = ref<boolean | null>(null)
const showMore = ref(false)
const showBussiness = ref(false)
const showManager = ref(false)
const managerInfo = ref<any>({})

/** 弹窗打开时的绑定快照，用于手动关闭时对比是否发生变化 */
let snapshotCode = ''
let snapshotDeptCode = ''
/** 弹窗打开前我的页面的绑定编码，用于检测外部绑定状态变化（如在其他设备解绑） */
let minePageSnapshotCode = ''

const applyButtonText = computed(() => {
  if (!configData.value?.btnLists) return ''
  const btnConfig = configData.value.btnLists.find((item: any) => item.scene === 'applyCustomerCode')
  return btnConfig?.buttonname || ''
})

const isSingleOrder = computed(() => {
  return props.expressType === '快速寄件页'
})

// const popupTitle = computed(() => {
//   const titleMap: Record<string, string> = {
//     bind: '绑定客户编码',
//     guess: '客户编码',
//     switch: '切换客户编码',
//     change: '更换客户编码',
//   }
//   return titleMap[mode.value] || '绑定客户编码'
// })

const initFn = async () => {
  /**
   * 策略：弹窗立即打开显示 loading，接口异步加载
   *
   * 流程:
   * 1. loading = true → 触发 Vue 响应式更新
   * 2. nextTick() → 等 DOM 更新完成（loading spinner 已渲染）
   * 3. 再发起网络请求 → 用户已能看到 loading 动画
   */
  setExpressType(props.expressType || '')
  loading.value = true
  isForceUpdate.value = false
  exp_customer_code_bind_page({
    express_type: props.expressType || '',
    isPopUp: true,
    page_type: '绑码弹窗',
    page_name: '绑码弹窗',
  })
  // 订阅远程关闭事件：登录页 useLoad 时 emit，触发本弹窗静默关闭
  // 在 initFn（@open 回调）中注册，确保每次弹窗打开都重新订阅（once 执行后会被清空）
  once(CC_EVENTS.CLOSE_POPUP, () => {
    if (props.visible) handleClose(true)
  })
  // 捕获我的页面当前的绑定编码，用于关闭时检测外部绑定状态变化（如在其他设备解绑）
  minePageSnapshotCode = globalUserStore.customerCode || ''
  // 等待 DOM 更新（loading UI 已渲染）后再发起请求，避免卡顿
  await nextTick()

  let token = getToken()
  if (!token) {
    await autoLoginHook({ needLogin: true })

    token = getToken()
    if (!token) {
      loading.value = false
      return
    }
  }
  hasToken.value = true
  // console.log(homeStore?.data, 'homeStore')
  const { hasLeadCapture, hasLeadCaptureActivity } = useRoleFlags()
  hasMarketActivity.value = (!hasLeadCapture.value && hasLeadCaptureActivity.value) || false

  /**
   * 优化：合并重复的 getAppUserRelationAuth 调用
   *
   * 原问题：
   * - initMode() 内部可能调用 getAppUserRelationAuth（回退场景）
   * - fetchHasBusiness() 又单独调用 getAppUserRelationAuth
   * → 导致同一接口被请求2次
   *
   * 解决方案：
   * - 先并行执行 initMode() 和 fetchConfigData()
   * - 从 initMode 的 store 中读取权限信息设置 hasBusiness
   * - 移除独立的 fetchHasBusiness 调用
   */
  const [modeResult, configResult] = await Promise.allSettled([initMode(), fetchConfigData()])

  if (configResult.status === 'fulfilled') {
    configData.value = configResult.value
  }

  // 从 store 或重新获取权限信息设置 hasBusiness（复用已有数据）
  if (modeResult.status === 'fulfilled') {
    getUserAuth()
  }
  // 弹窗打开时快照当前绑定（编码+部门），用于手动关闭时对比
  snapshotCode = customerCodeStore.currentCustomerCode
  snapshotDeptCode = customerCodeStore.currentDepartment?.departmentCode || ''
}

const getUserAuth = async () => {
  try {
    const authRes: any = await getAppUserRelationAuth()
    const data = authRes?.data || authRes
    hasBusiness.value = (data && data.hasBusiness) || false
  } catch {
    hasBusiness.value = false
  }
}

const fetchConfigData = async (): Promise<any> => {
  try {
    const res: any = await getConfig({ source: 20 }) // 来源，20-跨越寄件扫码 || 60-整车扫码
    return res?.data || res || {}
  } catch (error) {
    console.warn('获取配置数据失败:', error)
    return {}
  }
}

// ==================== 公共事件处理 ====================

const handleClose = (isAutoClosed?: boolean) => {
  // 自动关闭场景（绑定/解绑/切换成功后直接关闭）：跳过对比，外层已自行处理更新
  if (!isAutoClosed) {
    const currentCode = customerCodeStore.currentCustomerCode
    const currentDeptCode = customerCodeStore.currentDepartment?.departmentCode || ''

    const codeChanged = currentCode && currentCode !== snapshotCode
    const deptChanged = isSingleOrder.value && currentDeptCode !== snapshotDeptCode
    // 检测外部绑定状态变化：弹窗查询到的最新状态与我的页面不一致（如在其他设备解绑）
    const externalChanged = currentCode !== minePageSnapshotCode

    console.log('手动关闭检测到绑定变化:', {
      code: `${snapshotCode}→${currentCode}`,
      dept: `${snapshotDeptCode}→${currentDeptCode}`,
      minePage: `${minePageSnapshotCode}→${currentCode}`,
    })

    if (codeChanged || deptChanged || isForceUpdate.value || externalChanged) {
      console.log('[CustomerBindDialog] 手动关闭检测到绑定变化，通知外层更新')
      afterCustomerChange()
      emit('updateCustomerCode', {
        ...customerCodeStore.currentCompany,
        ...(deptChanged ? { department: customerCodeStore.currentDepartment } : {}),
      })
      isForceUpdate.value = false
    }
  }
  emit('update:visible', false)
}

// ==================== 绑定模式事件处理 ====================

const handleBindConfirm = (data?: any) => {
  console.log('绑定成功:', data)
  // Taro.showToast({ title: '绑码成功', icon: 'success' })
  emit('updateCustomerCode', data)
  handleClose(true)
  // 通知更新客户编码（写入全局Store + 刷新用户信息）
  afterCustomerChange(data)
}

const handleUnbindConfirm = (data?: CurrentBindInfo) => {
  console.log('解绑成功:', data)
  // Taro.showToast({ title: '解绑成功', icon: 'success' })
  emit('updateCustomerCode', data)
  handleClose(true)
  // 通知更新客户编码（写入全局Store + 刷新用户信息）
  afterCustomerChange(data)
}

const afterCustomerChange = (data?: CurrentBindInfo) => {
  console.log(data, '我选择不更新全局客户编码，看看')
  updateCustomerCodeHandler(data)
  getMinePageUserInfo()
}

const handleCancel = () => {
  emit('cancel')
  handleClose()
}

const handleCallError = () => {
  getUserAuth()
}

const handleContactBusiness = () => {
  showBussiness.value = true
}

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

const handleLearnMore = () => {
  showMore.value = true
}

const handleMoreCancel = () => {
  showMore.value = false
}

// ==================== 更换模式事件处理 ====================

const handleSwitchDept = (dept: any) => {
  console.log('切换部门:', dept)
}

// ==================== 更换模式事件处理 ====================
/**
 * 申请绑定其他公司（已由 ChangeCode 组件内部处理完整逻辑）
 * 此处仅处理有权限时的事件转发：刷新列表
 * @see change-code/index.vue - handleApplyOther
 */
const handleApplyOther = () => {
  handleRefreshList()
}

const handleRefreshListAndEmit = () => {
  handleRefreshList()
  isForceUpdate.value = true
}

/** 解绑成功后刷新页面 */
const handleUnbind = () => initMode()

// ==================== 切换模式事件处理 ====================

const handleSwitch = (company?: any) => {
  console.log('切换公司:', company)
  // Taro.showToast({ title: '切换成功', icon: 'success' })
  emit('updateCustomerCode', company)
  handleClose(true)
  // 通知更新客户编码（写入全局Store + 刷新用户信息）
  afterCustomerChange(company || {})
}

/**
 * 添加客户编码：跳转到页面级绑码页，通过 EventBus 接收绑定结果
 *
 * 数据流: Popup(once 注册回调) → Page(navigateTo) → Page(emit) → Popup(回调执行→刷新列表)
 */
const handleAddBind = () => {
  // 注册一次性回调：页面绑码成功后自动触发
  once(CC_EVENTS.ADD_BIND_SUCCESS, (data?: any) => {
    console.log('[EventBus] 收到页面绑定成功通知:', data)
    initMode()
    emit('confirm', data)
    afterCustomerChange(data)
    // 注意：不在此处调用 afterCustomerChange，由 handleClose 关闭时统一对比更新
  })
  Taro.navigateTo({
    url: '/modules/user/pages/customer-code/index?mode=bind&subType=add',
  })
}

/**
 * 更换客户编码按钮点击 → 校验后切换到切换模式
 * 用户点击"更换客户编码"按钮后，校验发现有关联账号权限时触发
 */
const handleSwitchMode = () => {
  console.log('[更换→切换] 校验通过，刷新为切换模式')
  initMode()
}

const handelChangeCode = () => {
  once(CC_EVENTS.CHANGE_BIND_SUCCESS, (data?: any) => {
    console.log('[EventBus] 收到更换绑定成功通知:', data)
    initMode()
    afterCustomerChange()
    // 注意：不在此处调用 afterCustomerChange，由 handleClose 关闭时统一对比更新
  })
  Taro.navigateTo({
    url: '/modules/user/pages/customer-code/index?mode=bind&subType=change',
  })
}

/**
 * 申请绑定（CompanyList 触发，已由各组件内部处理）
 * 保留签名兼容，实际逻辑已下沉到 switch-code/change-code 组件
 * @deprecated 逻辑已迁移至子组件内部
 */
const handleApplyBind = (_title?: string, _applyStatus?: string) => {
  // 子组件已处理完整申请流程，此处无需额外操作
  if (_applyStatus === '10') {
    Taro.navigateTo({
      url: `/modules/user/pages/customer-code/apply-result/index?applyStatus=10&title=${_title}`,
    })
  } else {
    Taro.navigateTo({
      url: `/modules/user/pages/customer-code/apply/index?title=${_title}`,
    })
  }
}

const handleRefreshList = () => {
  console.log('刷新公司列表')
  initMode(true)
}

// ==================== 猜您绑定模式事件处理 ====================

// const handleGuessBind = (data?: any) => {
//   console.log('猜您绑定成功:', data)
//   // Taro.showToast({ title: '绑码成功', icon: 'success' })
//   emit('confirm', data)
//   handleClose(true)
// }

// const handleGuessJumpBind = () => {
//   mode.value = 'bind'
// }

// const handleApply = () => {
//   console.log('申请客户编码')
//   Taro.showToast({ title: '即将跳转申请页', icon: 'none' })
// }

// 监听小程序切回前台，刷新权限信息
const onAppShowCallback = () => {
  console.log('有没有进来')
  getUserAuth()
}
useDidShow(() => {
  console.log('小程序显示')
  // 登录页返回后静默关闭弹窗（避免绑码弹窗在登录流程后仍显示）
  // 传 isAutoClosed=true 跳过绑定变更对比，避免误触发 updateCustomerCode
  getUserAuth()
})

// 安全兜底：弹窗卸载时清除未触发的回调，防止内存泄漏
onUnmounted(() => {
  clearEvent(CC_EVENTS.ADD_BIND_SUCCESS)
  clearEvent(CC_EVENTS.CLOSE_POPUP)
  Taro.offAppShow(onAppShowCallback)
})

defineExpose({
  refreshMode: initMode,
  getMode: () => mode.value,
})
</script>
