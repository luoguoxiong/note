<template>
  <view :class="['company-list', isPopup && 'is-popup']">
    <view class="company-title">请选择您要切换的公司</view>
    <!-- 公司列表 -->
    <scroll-view
      :scroll-y="true"
      :showScrollbar="false"
      :scrollWithAnimation="true"
      :class="['list-content', isPopup && 'height-652']"
    >
      <view class="list-inner">
        <view
          v-for="(company, index) in companyList"
          :key="index"
          class="company-item"
          :class="{ 'company-item--current': isCurrent(company) }"
        >
          <!-- 公司信息 -->
          <view class="item-main" @tap="handleSwitch(company)">
            <view class="company-info">
              <text class="company-name">{{ company.customerName }}</text>
              <view class="code-row">
                <text class="code-label">客户编码：</text>
                <text class="code-value">{{ company.customerCode }}</text>
                <!-- 当前绑定标记 -->
                <BindTag v-if="isCurrent(company)" type="primary" />
              </view>
            </view>

            <!-- 切换中状态（参考 H5 BindLoading 组件） -->
            <view v-if="isSwitching(company)" class="bind-loading">
              <view class="bind-loading__loading">
                <ky-image
                  src="https://ic-img.ky-express.com/netc/20220920_67251702288_!!1663639875854_96_96.png"
                  mode="aspectFit"
                  class="loading-icon"
                />
              </view>
              <text class="bind-loading__text">切换中</text>
            </view>

            <!-- 管理模式下的解绑按钮（非切换中且非当前绑定时显示）-->
            <ky-button
              v-if="showManageMode && !isSwitching(company)"
              class="unbind-btn"
              size="mini"
              type="default"
              @click.stop="handleUnbind(company)"
            >
              <image src="https://ic-img.ky-express.com/netc/20260116_41859_!!1768532877699_48_48.png"></image>
              解绑
            </ky-button>
          </view>

          <!-- 部门切换（独立组件） -->
          <SwitchDepartmentSection
            v-if="isExpressType && isCurrent(company)"
            :show-department="isExpressType"
            @switch-department="handleSwitchDeptFromSection"
          />
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏（原 SwitchCodeFooter，合并至此组件） -->
    <view v-if="showFooter" :class="['switch-code-footer', isFixed && 'fixed', isSafeArea && 'safe-area']">
      <view class="switch-code-footer__text">如需绑定多个公司，可添加客户编码</view>
      <ky-button
        class="switch-code-footer__btn"
        :loading="footerLoading"
        type="primary"
        size="large"
        @click="handleAddBind"
      >
        {{ buttonText }}
      </ky-button>
    </view>

    <!-- 解绑确认弹窗 (type=3，对齐H5 switchCode type=3)
         标题: 解除绑定提示
         tip-bar: API返回的roleMsg(带警告图标)
         content: 您确定与XX公司(编码)解除绑定吗?
    -->
    <Alert
      :visible="showUnbindAlert"
      title="解除绑定提示"
      :tip-bar="unbindRoleMsg"
      :confirm-loading="confirmUnbindLoading"
      confirm-text="解除绑定"
      cancel-text="我再想想"
      :show-cancel="true"
      :closable="false"
      @confirm="handleConfirmUnbind"
      @cancel="handleCancelUnbind"
    >
      <view class="unbind-confirm-content">
        {{ unbindConfirmText }}
      </view>
    </Alert>

    <!-- 回收/冻结解绑弹窗（H5: FrozenUnbind组件）-->
    <Alert
      :visible="showFreezeAlert"
      title="温馨提示"
      :content="freezeContent"
      :tip-bar="freezeTipBar"
      :confirm-loading="forceUnbindLoading"
      confirm-text="解除绑定"
      cancel-text="我再想想"
      :show-cancel="true"
      :closable="false"
      @confirm="handleForceUnbind"
      @cancel="handleForceUnbindCancel"
      @close="showFreezeAlert = false"
    />

    <!-- 失去关联权限弹窗（一键解绑 / 去申请） -->
    <Alert
      :visible="showLostAuthTipDialog"
      title="温馨提示"
      :content="lostAuthContent"
      :tip-bar="lostAuthTipBar"
      confirm-text="去申请"
      cancel-text="一键解绑"
      :show-cancel="true"
      :closable="true"
      @confirm="handleLostAuthConfirm"
      @cancel="handleLostAuthCancel"
      @close="showLostAuthTipDialog = false"
    />
    <!-- 二次确认弹窗（展示待解绑公司列表） -->
    <Alert
      :visible="showSecondConfirmDialog"
      title="温馨提示"
      :tip-bar="secondConfirmTipBar"
      confirm-text="确定"
      cancel-text="取消"
      :show-cancel="true"
      :closable="false"
      :confirm-loading="secondConfirmLoading"
      @confirm="handleSecondConfirmSubmit"
      @cancel="showSecondConfirmDialog = false"
      @close="showSecondConfirmDialog = false"
    >
      <view class="second-confirm-content">
        <text class="second-confirm-label">将解绑以下{{ unbindCompanyList.length }}家公司：</text>
        <scroll-view :scroll-y="true" :showScrollbar="false" :scrollWithAnimation="true" class="company-scroll-list">
          <div class="company-name-text">{{ unbindCompanyNames }}</div>
        </scroll-view>
      </view>
    </Alert>

    <!-- 确认部门对话框（切换客户编码后确认部门）-->
    <ConfirmDepartmentDialog
      :visible="showConfirmDeptDialog"
      :department-list="departmentList"
      :current-department="currentDepartment"
      @confirm="handleConfirmDeptConfirm"
      @close="showConfirmDeptDialog = false"
    />
  </view>
</template>

<script setup lang="ts">
/**
 * 客户编码模块 - 公司列表组件（含底部操作栏）
 *
 * 合并自原 CompanyList + SwitchCodeFooter，与 H5 SwitchCode + SwitchCodeFooter 保持一致：
 * - 展示已绑定公司列表，支持切换绑定、解绑操作
 * - 底部"添加客户编码"按钮（点击检查权限 → 无权限弹窗/有权限跳转）
 * - 失去关联权限时统一走 showLostAuthTipDialog → 一键解绑/去申请 → showSecondConfirmDialog
 *
 * 弹窗对照:
 * - showUnbindAlert: 单个公司解绑确认
 * - showFreezeAlert: 冻结/回收解绑弹窗
 * - showLostAuthTipDialog: 失去权限提示（一键解绑 / 去申请）
 * - showSecondConfirmDialog: 二次确认解绑公司列表
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { debounce } from 'lodash-es'
import { showToast } from '@tarojs/taro'
import BindTag from '../shared/BindTag.vue'
import Alert from '../shared/Alert.vue'
import KyImage from '@/public/components/base/ky-image/index.vue'
import SwitchDepartmentSection from '../switch-department/index.vue'
import ConfirmDepartmentDialog from '../switch-department/ConfirmDepartmentDialog.vue'
import { useCompanyList } from '../../hooks/useCompanyList'
import { useCustomerCodeStore } from '../../store/customerCode'
import {
  getAppUserRelationAuth,
  getOtherBindApplyDetail,
  unbindRelationCustomerCode,
} from '@modules/user/apis/customerCode'
import type { CompanyInfo as CompanyInfoType } from '../../types/customer-code'
import './index.scss'
import {
  exp_customer_code_switch_page,
  clk_customer_code_switch_old_button,
  clk_customer_code_relation_bindpopup_button,
  clk_customer_code_unbind_confirmpopup_button,
  exp_customer_code_unbind_confirmpopup,
  other_customer_code_bind_change_sub,
  clk_change_departments_button,
  other_change_departments_success,
  clk_customer_code_button,
  clk_customer_code_bindpopup_button,
} from '../../report/index'

interface Props {
  /** 是否显示管理模式（显示解绑按钮） */
  showManageMode?: boolean
  /** 是否显示帮助图标 */
  showHelp?: boolean
  /** 最大高度 */
  maxHeight?: string
  // 弹窗类型
  isPopup?: boolean
  /** 是否快速寄件页（控制部门切换显示） */
  isExpressType?: boolean
  // === Footer 相关 Props（原 SwitchCodeFooter） ===
  /** 配置数据中的按钮列表（用于获取自定义按钮文案和跳转URL） */
  configData?: {
    btnLists?: Array<{
      scene: string
      buttonname: string
      url: string
    }>
  }
  isSafeArea?: boolean
  isFixed?: boolean
  /** 是否显示底部操作栏（添加客户编码按钮区域） */
  showFooter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showManageMode: true,
  showHelp: false,
  maxHeight: '800px',
  isPopup: false,
  isExpressType: false,
  configData: () => ({ btnLists: [] }),
  isSafeArea: true,
  isFixed: true,
  showFooter: false,
})

const emit = defineEmits<{
  (e: 'switch', company?: CompanyInfoType): void
  (e: 'unbind'): void
  // === Footer emits（原 SwitchCodeFooter）===
  (e: 'addBind', url?: string): void
  (e: 'applyBind', title: string, applyStatus: string): void
  (e: 'refresh'): void
}>()

const { companyList, switchBind, unbind, fetchDepartments, switchDept, checkBindAuth, checkUserRole } = useCompanyList()
const store = useCustomerCodeStore()
// userStore 已移除：部门列表获取已由 SwitchDepartmentSection 内部管理

// ==================== 部门相关 ====================

/** 部门列表 */
const departmentList = computed(() => store.departmentList)
/** 当前部门 */
const currentDepartment = computed(() => store.currentDepartment)
/** 是否显示部门切换弹窗 */
// showDeptPopup 已移至 SwitchDepartmentSection 内部管理
/** 是否显示确认部门对话框（切换客户编码后） */
const showConfirmDeptDialog = ref(false)

// ==================== 解绑弹窗状态 (type=3 单个解绑 / 冻结) ====================

const showUnbindAlert = ref(false)
const showFreezeAlert = ref(false)
/** 冻结/回收解绑弹窗动态文案 */
const freezeContent = ref('')
const freezeTipBar = ref('')
/** 单个解绑弹窗 - API返回的角色提示文案（作为tip-bar显示，对齐H5 roleMsg） */
const unbindRoleMsg = ref('')
/** 冻结/回收解绑弹窗确认按钮loading */
const forceUnbindLoading = ref(false)
/** 常规解绑确认按钮loading */
const confirmUnbindLoading = ref(false)

// ==================== 失去关联权限 / 一键解绑弹窗状态 ====================

/** 失去权限提示弹窗（一键解绑 / 去申请） */
const showLostAuthTipDialog = ref(false)
/** 失去权限场景来源：'switch'=切换公司，'add'=添加客户编码 */
const lostAuthSource = ref<'switch' | 'add'>('switch')
const lostAuthContent = computed(() => {
  const action = lostAuthSource.value === 'add' ? '添加' : '切换'
  return `您暂不可${action}客户编码，如需绑定多家公司可申请。`
})
const lostAuthTipBar = computed(() => {
  const action = lostAuthSource.value === 'add' ? '添加' : '切换'
  return `如需${action}可一键解绑后再更换客户编码`
})

/** 二次确认弹窗（展示待解绑公司列表） */
const showSecondConfirmDialog = ref(false)
/** 二次确认提示条文案 */
const secondConfirmTipBar = ref('解除绑定后无法下单查件，非公司主授权号将清除所有用户权限，请您谨慎操作！')
const secondConfirmLoading = ref(false)

/** 待处理的目标公司（失去关联权限时需要先解绑再切换） */
const pendingTargetCompany = ref<CompanyInfoType | null>(null)

/** 待解绑公司列表（type=2 弹窗展示用） */
const unbindCompanyList = ref<CompanyInfoType[]>([])
/** 待解绑公司名称（顿号分隔，用于二次确认弹窗展示） */
const unbindCompanyNames = computed(() => {
  return unbindCompanyList.value.map((item) => item.customerName).join('、')
})

/** 单个解绑确认文案（对齐H5: "您确定与XX(编码)解除绑定吗?"） */
const unbindConfirmText = computed(() => {
  const c = pendingUnbindCompany.value
  return c ? `您确定与${c.customerName}（${c.customerCode}）解除绑定吗?` : ''
})

/** 待解绑的公司（单个解绑场景） */
const pendingUnbindCompany = ref<CompanyInfoType | null>(null)

// ==================== Footer 相关状态（原 SwitchCodeFooter）====================

/** 底部栏加载状态 */
const footerLoading = ref(false)

/** 自定义按钮配置 */
const customButtonConfig = computed(() => {
  return (
    props.configData?.btnLists?.find((item) => item.scene === 'addCustomerCode') ||
    ({} as { buttonname?: string; url?: string })
  )
})

/** 按钮显示文案 */
const buttonText = computed(() => {
  if (customButtonConfig.value.buttonname) {
    return customButtonConfig.value.buttonname
  }
  return '添加客户编码'
})

/**
 * 页面加载时触发埋点并初始化数据
 * 部门列表获取已移至 SwitchDepartmentSection 组件内部 onMounted
 */
onMounted(() => {
  // 埋点：页面曝光
  exp_customer_code_switch_page()
})

// ==================== 基础判断方法 ====================

/** 判断是否当前绑定 */
const isCurrent = (company: CompanyInfoType): boolean => {
  return company.isCurrBond === '1'
}

/** 判断是否正在切换中 */
const isSwitching = (company: CompanyInfoType): boolean => {
  return store.switchingCompany?.customerCode === company.customerCode
}

// ==================== 切换绑定逻辑 ====================

/**
 * 处理切换绑定
 *
 * H5 原流程 (switch-list.jsx handleSwitchBind):
 * 1. 调用 getAppUserRelationAuth() 检测绑定权限
 * 2. bindAuth=true → 直接执行 userBindCustomerCode() 切换
 * 3. bindAuth=false → 弹出 type=1 温馨提示弹窗（一键解绑/去申请）
 */
const handleSwitch = async (company: CompanyInfoType) => {
  if (isCurrent(company)) return

  // 埋点：点击切换公司
  // clk_customer_code_switch_old_button(company.customerName)
  clk_customer_code_button('切换客户编码', { page_type: '切换客户编码', customer_name: company.customerName })

  pendingTargetCompany.value = company

  try {
    const authData = await checkBindAuth()

    // 无绑定权限 → 弹出失去权限提示
    if (!authData?.bindAuth) {
      openLostAuthTipDialog()
      return
    }

    // 有权限，正常执行切换
    await executeSwitch(company)
  } catch (error: any) {
    console.error('切换绑定失败:', error)

    other_customer_code_bind_change_sub({
      request_result: '失败',
      customer_no: company.customerCode,
      failure_reason: error?.msg || error?.message || '无权限或API错误',
    })
    showToast({
      title: error?.msg || error?.message || '切换失败',
      icon: 'none',
    })
  }
}

/**
 * 执行切换操作
 *
 * H5 原始流程 (switchCode/index.jsx handleSwitchBind catch):
 * - err.code === 111227: 冻结解绑弹窗
 * - err.code === 60037: 该客户编码已被解绑，toast提示后延迟刷新
 * - 其他错误: toast提示错误信息
 */
const executeSwitch = async (company: CompanyInfoType) => {
  try {
    await switchBind(company, () => {
      other_customer_code_bind_change_sub({
        request_result: '成功',
        customer_no: company.customerCode,
      })
    })
    showToast({
      title: '切换成功',
      icon: 'none',
    })

    // 快速寄件页场景：切换成功后重新获取部门列表
    if (props.isExpressType) {
      await fetchDepartments(company.customerCode)
      if (departmentList.value.length > 1) {
        showConfirmDeptDialog.value = true
      } else {
        emit('switch', company)
      }
    } else {
      emit('switch', company)
    }
  } catch (error: any) {
    const errMsg = error?.msg || error?.message || `ERR_CODE: ${error?.code}`

    // 后台已回收/冻结 → 弹出冻结解绑弹窗
    if (error?.code === 111227 || error?.errorCode === 111227) {
      const errorMsg = error?.msg || ''
      const separatorIndex = errorMsg.indexOf('@')
      if (separatorIndex > -1) {
        freezeContent.value = errorMsg.substring(0, separatorIndex)
        freezeTipBar.value = errorMsg.substring(separatorIndex + 1)
      } else {
        freezeContent.value = errorMsg || '此账户已被冻结，不可切换绑定，是否解绑？'
        freezeTipBar.value = ''
      }
      pendingUnbindCompany.value = company
      showFreezeAlert.value = true
      other_customer_code_bind_change_sub({
        request_result: '失败',
        customer_no: company.customerCode,
        failure_reason: errMsg,
      })
      return
    }

    // 对应公司已解绑 → toast提示 + 延迟自动刷新
    else if (error?.code === 60037 || error?.errorCode === 60037) {
      showToast({
        title: error?.msg || '该客户编码已被解绑，请刷新后重试',
        icon: 'none',
      })
      setTimeout(() => {
        emit('unbind')
      }, 1800)
      other_customer_code_bind_change_sub({
        request_result: '失败',
        customer_no: company.customerCode,
        failure_reason: errMsg,
      })
      return
    }

    // 其他错误
    if (error?.code !== 100201 && error?.errorCode !== 100201) {
      showToast({ title: error?.msg || error?.message || '切换失败', icon: 'none' })
    }
    other_customer_code_bind_change_sub({
      request_result: '失败',
      customer_no: company.customerCode,
      failure_reason: errMsg,
    })

    throw error
  }
}

// ==================== 失去关联权限 / 一键解绑弹窗逻辑 ====================

/**
 * 打开失去权限提示弹窗
 *
 * 对齐 H5 setAlertObj({ type:'1', ... })，同时适用于：
 * - 切换公司时无权限（source='switch'，显示"切换"）
 * - Footer 添加客户编码时无权限（source='add'，显示"添加"）
 */
const openLostAuthTipDialog = (source: 'switch' | 'add' = 'switch') => {
  lostAuthSource.value = source
  showLostAuthTipDialog.value = true
}

/** 失去权限弹窗 → "去申请" */
const handleLostAuthConfirm = async () => {
  showLostAuthTipDialog.value = false

  try {
    const res: any = await getOtherBindApplyDetail()
    const data = res?.data || res
    const applyStatus = data.applyStatus || ''
    const currentCompany = store.companyInfoList.find((item) => item.isCurrBond === '1')
    const title = currentCompany ? '4' : '1'

    emit('applyBind', title, applyStatus)
  } catch (error: any) {
    if (error?.code !== 100201) {
      showToast({ title: error?.msg || '服务错误', icon: 'none' })
    }
    // 失败时重新打开弹窗让用户可重试
    showLostAuthTipDialog.value = true
  }
}

/**
 * 失去权限弹窗 → "一键解绑"
 *
 * 收集所有 isCurrBond !== '1' 的公司，打开二次确认弹窗展示待解绑列表
 * H5 原逻辑: companyInfoList.forEach(item => { if (item.isCurrBond !== '1') arr.push(item) })
 */
const handleLostAuthCancel = () => {
  showLostAuthTipDialog.value = false

  const list: CompanyInfoType[] = []
  companyList.value.forEach((item) => {
    if (item.isCurrBond !== '1') {
      list.push(item)
    }
  })

  unbindCompanyList.value = list.length > 0 ? list : [pendingTargetCompany.value!]
  showSecondConfirmDialog.value = true
}

/**
 * 二次确认弹窗 → "确定"，执行一键解绑
 *
 * H5 原实现: unbindRelationCustomerCode({ unbindList: [...非当前绑定公司的customerCode] })
 */
const handleSecondConfirmSubmit = async () => {
  if (unbindCompanyList.value.length === 0) return

  secondConfirmLoading.value = true

  try {
    const unbindList = unbindCompanyList.value.map((item) => item.customerCode)

    await unbindRelationCustomerCode({ unbindList })

    showToast({ title: '解绑成功', icon: 'none' })

    showSecondConfirmDialog.value = false
    pendingTargetCompany.value = null
    unbindCompanyList.value = []
    emit('refresh')
  } catch (error: any) {
    console.error('一键解绑失败:', error)

    // 冻结解绑场景(111227) → 转冻结弹窗
    if (error?.code === 111227 || error?.errorCode === 111227) {
      const errorMsg = error?.msg || ''
      const separatorIndex = errorMsg.indexOf('@')
      showSecondConfirmDialog.value = false
      if (separatorIndex > -1) {
        freezeContent.value = errorMsg.substring(0, separatorIndex)
        freezeTipBar.value = errorMsg.substring(separatorIndex + 1)
      } else {
        freezeContent.value = errorMsg || '此账户已被冻结'
        freezeTipBar.value = ''
      }
      pendingUnbindCompany.value = unbindCompanyList.value[0] || pendingTargetCompany.value
      showFreezeAlert.value = true
    } else {
      showToast({
        title: error?.msg || error?.message || '操作失败',
        icon: 'none',
      })
    }
  } finally {
    secondConfirmLoading.value = false
  }
}

// ==================== Footer "添加客户编码" 按钮（原 SwitchCodeFooter）====================

/**
 * 点击"添加客户编码"按钮
 *
 * H5 原流程 (switchCodeFooter hanldeAddBind):
 * 1. 调用 getAppUserRelationAuth() 检测权限
 * 2. 无 bindAuth → setAlertObj type=1 弹窗（一键解绑/去申请）
 * 3. 有 bindAuth + bindOverLimitFlag → 提示已达上限
 * 4. 有 bindAuth → 触发 addBind 跳转
 */
const handleAddBind = async () => {
  // 埋点
  // const currentCompany = store.companyInfoList.find((item) => item.isCurrBond === '1')
  // const bindStatus = currentCompany ? '切换' : '绑定'

  clk_customer_code_button('添加客户编码', { page_type: '切换客户编码' })
  // clk_customer_code_switch_old_button('添加客户编码')
  // clk_customer_code_relation_bindpopup_button(`添加客户编码(${bindStatus})`)
  // clk_customer_code_relation_bindpopup_button('添加客户编码')

  footerLoading.value = true
  try {
    const res: any = await getAppUserRelationAuth()
    const data = res?.data || res

    if (!data.bindAuth) {
      // 无权限 - 弹出失去权限提示（一键解绑/去申请）
      pendingTargetCompany.value = null // Footer 场景无目标公司
      openLostAuthTipDialog('add')
    } else if (data.bindOverLimitFlag) {
      showToast({ title: '已达上限', icon: 'none' })
    } else {
      // 有权限 - 触发跳转
      emit('addBind', customButtonConfig.value.url)
    }
  } catch (error) {
    console.error('检查绑定权限失败:', error)
  } finally {
    footerLoading.value = false
  }
}

// ==================== 部门切换逻辑 ====================

/** 处理 SwitchDepartmentSection 组件触发的部门切换事件（日常切换） */
const handleSwitchDeptFromSection = (dept: any) => {
  // SwitchDepartmentSection 内部已完成切换，此处仅做事件透传或后续处理
  console.log('SwitchDepartmentSection 部门切换完成:', dept)
}

/** 处理确认部门对话框确认（切换客户编码后确认部门） */
const handleConfirmDeptConfirm = async (deptCode: string) => {
  const selectedDept = departmentList.value.find((d) => d.departmentCode === deptCode)

  if (selectedDept && currentDepartment.value?.departmentCode === deptCode) {
    showConfirmDeptDialog.value = false
    return
  }

  clk_change_departments_button('确定')

  if (selectedDept) {
    const success = await switchDept(selectedDept)
    if (success) {
      other_change_departments_success()
      showToast({ title: '切换部门成功', icon: 'none' })
      emit('switch')
    }
  }
  showConfirmDeptDialog.value = false
}

// ==================== 单个解绑逻辑 (type=3) ====================

/** 处理解绑（点击解绑按钮，对齐H5 handleUnbind type=3）
 *
 * H5逻辑 (switchCode/index.jsx handleUnbind):
 * 1. getUserRoleByCustomerCode → res.msg 存入 roleMsg（作为tip-bar展示）
 * 2. alertObj = { title:'解除绑定提示', type:'3' }
 * 3. content = 自定义插槽: "您确定与{customerName}(customerCode)解除绑定吗?"
 */
const handleUnbind = debounce(async (company: CompanyInfoType) => {
  pendingUnbindCompany.value = company

  clk_customer_code_button('解绑', { page_type: '切换客户编码', customer_name: company.customerName })

  try {
    const roleData = await checkUserRole(company.customerCode)
    // API返回的roleMsg作为tip-bar提示条文案（对齐H5 roleMsg）
    unbindRoleMsg.value = roleData?.msg || '解除绑定后无法下单寄件，且会清除所有用户权限，请您谨慎操作！'
  } catch {
    // 接口失败时使用默认tip-bar文案
    unbindRoleMsg.value = '解除绑定后无法下单寄件，且会清除所有用户权限，请您谨慎操作！'
  }

  showUnbindAlert.value = true
  exp_customer_code_unbind_confirmpopup()
}, 500)

/** 取消解绑（我再想想） */
const handleCancelUnbind = () => {
  clk_customer_code_unbind_confirmpopup_button('我再想想', '切换客户编码')
  showUnbindAlert.value = false
}

/** 确认解绑 (type=3) */
const handleConfirmUnbind = async () => {
  if (!pendingUnbindCompany.value) return

  clk_customer_code_unbind_confirmpopup_button('解除绑定', '切换客户编码')

  confirmUnbindLoading.value = true

  try {
    const success = await unbind(pendingUnbindCompany.value)

    if (success) {
      showToast({ title: '解绑成功', icon: 'none' })
      emit('refresh')
    }

    showUnbindAlert.value = false
    pendingUnbindCompany.value = null
  } catch (error: any) {
    if (error?.code === 111227 || error?.errorCode === 111227) {
      showUnbindAlert.value = false
      showFreezeAlert.value = true
    } else if (error?.code === 60115 && error.msg.includes('用户已经解绑')) {
      showUnbindAlert.value = false
      showToast({ title: error.msg, icon: 'none' })
      emit('refresh')
    } else {
      showToast({ title: error || '解绑失败', icon: 'none' })
    }
  } finally {
    confirmUnbindLoading.value = false
  }
}

/** 冻结弹窗 - bind_status 判断（对齐H5: isCurrBond==='1' ? '切换' : '绑定'） */
const freezeBindStatus = computed(() => {
  return store.companyInfoList.find((item) => item.isCurrBond === '1') ? '切换' : '绑定'
})

/** 强制解绑（冻结状态） */
const handleForceUnbind = async () => {
  if (!pendingUnbindCompany.value) return

  // 埋点：冻结弹窗点击"立即解绑"
  clk_customer_code_bindpopup_button('立即解绑', freezeBindStatus.value, '切换客户编码')

  forceUnbindLoading.value = true

  try {
    const success = await unbind(pendingUnbindCompany.value)

    if (success) {
      showToast({ title: '解绑成功', icon: 'none' })
      emit('unbind')
    }

    showFreezeAlert.value = false
    pendingUnbindCompany.value = null
  } catch (error: any) {
    showToast({ title: error || '解绑失败', icon: 'none' })
  } finally {
    forceUnbindLoading.value = false
  }
}

/** 冻结弹窗取消（我再想想） */
const handleForceUnbindCancel = () => {
  // 埋点：冻结弹窗点击"我再想想"（与常规解绑弹窗共用 unbind_confirmpopup_button 事件）
  clk_customer_code_unbind_confirmpopup_button('我再想想', '切换客户编码')
  showFreezeAlert.value = false
}
</script>
