<template>
  <view :class="['change-code-card', isPopup && 'is-popup']">
    <view class="padding-32">
      <!-- 当前绑定标记 -->
      <view class="card-header">
        <text class="header-title">当前绑定公司</text>
      </view>

      <!-- 公司信息 -->
      <view v-if="currentCompany" class="card-body">
        <view class="company-info">
          <text class="company-name">{{ currentCompany.customerName }}</text>
          <view class="company-code-row">
            <text class="code-label">客户编码：</text>
            <text class="code-value">{{ currentCompany.customerCode }}</text>
            <BindTag v-if="currentCompany" type="primary" />
          </view>
          <!-- 部门切换（独立组件） -->
          <SwitchDepartmentSection
            v-if="showDepartment"
            :show-department="showDepartment"
            @switch-department="$emit('switchDepartment', $event)"
          />
        </view>

        <!-- 申请绑定其他公司入口 -->
        <view class="apply-other" @tap="handleApplyOther">
          <view class="apply-text">
            如需绑定多家公司进行下单，您可
            <view class="apply-link"
              ><image
                src="https://ic-img.ky-express.com/netc/20260305_62789_!!1772701746355_56_56.png"
                class="loading-img"
                v-if="applyOtherLoading"
              ></image
              >申请绑定其他公司
              <image
                v-if="!applyOtherLoading"
                src="https://ic-img.ky-express.com/netc/20260115_3340_!!1768467485643_48_48.png"
              ></image
            ></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮组 -->
    <view
      v-if="currentCompany"
      :class="['customer-page-footer', isFixed && 'fixed', isSafeArea && 'safe-area']"
      :data-mode="type"
    >
      <ky-button class="submit-btn action-btn--secondary" size="large" @click="handleUnbindClick"> 解绑 </ky-button>
      <ky-button
        class="submit-btn action-btn--primary"
        type="primary"
        size="large"
        :loading="changeCodeLoading"
        @click="handleChangeCode"
      >
        更换客户编码
      </ky-button>
    </view>

    <!-- 解绑确认弹窗 -->
    <Alert
      :visible="showUnbindAlert"
      title="解除绑定提示"
      :tip-bar="unbindRoleMsg || '解除绑定后无法下单寄件，非公司主授权号将清除所有用户权限，请您谨慎操作！'"
      confirm-text="解除绑定"
      cancel-text="我再想想"
      :confirm-loading="unbindLoading"
      :show-cancel="true"
      :closable="false"
      @confirm="handleUnbindConfirm"
      @cancel="handleUnbindCancel"
    >
      <view class="alert-confirm-text">
        您确定与{{ currentCompany?.customerName }}（{{ currentCompany?.customerCode }}）解除绑定吗？
      </view>
    </Alert>
  </view>
</template>

<script setup lang="ts">
/**
 * 客户编码模块 - 更换客户编码卡片组件
 *
 * 展示当前绑定的公司信息
 * 部门切换功能已抽离为独立组件 SwitchDepartmentSection
 */
import { computed, onMounted, ref } from 'vue'
import Taro from '@tarojs/taro'
import BindTag from '../shared/BindTag.vue'
import Alert from '../shared/Alert.vue'
import SwitchDepartmentSection from '../switch-department/index.vue'
import { useCustomerCodeStore } from '../../store/customerCode'
import { useUserGlobalStore } from '@/store/user'
import { useCompanyList } from '../../hooks/useCompanyList'
import {
  unBindCustomerCode,
  getAppUserRelationAuth,
  getOtherBindApplyDetail,
  getUserRoleByCustomerCode,
} from '@modules/user/apis/customerCode'
import type { DepartmentInfo as DeptInfoType } from '../../types/customer-code'
import {
  exp_customer_code_change_page,
  clk_change_departments_button,
  other_change_departments_success,
  clk_customer_code_button,
  clk_customer_code_unbind_confirmpopup_button,
  exp_customer_code_unbind_confirmpopup,
  other_customer_code_bindpopup_success,
} from '../../report/index'
import './index.scss'

interface Props {
  /** 是否显示部门切换（快速寄件页） */
  showDepartment?: boolean
  /** 使用模式：page-页面级 / popup-弹窗级 */
  type?: 'page' | 'popup'
  isPopup?: boolean
  isFixed?: boolean
  isSafeArea?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDepartment: false,
  type: 'page',
  isPopup: false,
  isFixed: false,
  isSafeArea: false,
})

const emit = defineEmits<{
  (e: 'switchDepartment', dept: any): void
  (e: 'applyOther'): void
  (e: 'unbind'): void
  (e: 'handelChangeCode'): void
  (e: 'switchMode'): void
}>()

const store = useCustomerCodeStore()
const userStore = useUserGlobalStore()
const { fetchDepartments, switchDept } = useCompanyList()

// 申请绑定其他公司loading
const applyOtherLoading = ref(false)

/** 当前绑定公司 */
const currentCompany = computed(() => store.currentCompany)

/**
 * 获取部门列表（快速寄件页场景）
 * 参考 switch-code/index.vue:355-364
 */
const getDepartmentList = async () => {
  if (!props.showDepartment) return
  const phone = userStore.phone || ''
  if (!phone) return
  try {
    await fetchDepartments()
  } catch (err) {
    console.warn('获取部门列表失败:', err)
  }
}

/**
 * 页面曝光时触发埋点并初始化数据
 * 参考 switch-code/index.vue:369-377
 */
onMounted(async () => {
  // 埋点：页面曝光
  exp_customer_code_change_page()

  // 快速寄件页场景：获取部门列表
  if (props.showDepartment) {
    await getDepartmentList()
  }
})

/**
 * 处理申请绑定其他公司
 *
 * 完整逻辑（从 customer-code-popup 移入）：
 * 1. 调用 getAppUserRelationAuth() 检测绑定权限
 * 2. bindAuth=true → emit('applyOther') 通知父组件刷新列表
 * 3. bindAuth=false → 调用 getOtherBindApplyDetail() 获取申请状态，走申请流程
 */
const handleApplyOther = async () => {
  if (applyOtherLoading.value) return
  // 埋点：申请绑定其他公司
  clk_customer_code_button('申请绑定其他公司', { page_type: '更换客户编码' })
  try {
    // Taro.showLoading({ title: '加载中...', mask: true })
    applyOtherLoading.value = true
    const res: any = await getAppUserRelationAuth()
    const data = res?.data || res

    if (data?.bindAuth) {
      // Taro.hideLoading()
      // 有权限 → 通知父组件刷新列表
      emit('applyOther')
      applyOtherLoading.value = false
    } else {
      const detailRes: any = await getOtherBindApplyDetail()
      const detailData = detailRes?.data || detailRes
      const applyStatus = detailData.applyStatus || ''
      // Taro.hideLoading()
      applyOtherLoading.value = false

      // 无权限 → 申请流程
      handleApplyBindFlow(applyStatus)
    }
  } catch (error: any) {
    // Taro.hideLoading()
    applyOtherLoading.value = false
    if (error?.code !== 100201) {
      Taro.showToast({ title: error?.msg || '服务错误', icon: 'none' })
    }
  }
}

/**
 * 申请绑定其他公司流程
 * @param applyStatus - 申请状态（'10'=审核中）
 */
const handleApplyBindFlow = (applyStatus: string) => {
  if (applyStatus === '10') {
    Taro.navigateTo({
      url: `/modules/user/pages/customer-code/apply-result/index?applyStatus=10&title=3`,
    })
  } else {
    Taro.navigateTo({
      url: `/modules/user/pages/customer-code/apply/index?title=3`,
    })
  }
}

/** 更换客户编码按钮 loading 状态 */
const changeCodeLoading = ref(false)

/**
 * 更换客户编码：点击后校验手机号关联账号权限
 *
 * 产品文档要求（第7点）：
 * 1. 点击按钮展示加载loading
 * 2. 校验手机号是否有关联账号权限
 *    - 是 → 自动刷新页面为【切换客户编码】状态页（emit switchMode）
 *    - 否 → 进入【更换客户编码-账密绑码】页（emit handelChangeCode）
 */
const handleChangeCode = async () => {
  // 埋点：更换客户编码
  clk_customer_code_button('更换客户编码', { page_type: '更换客户编码' })
  changeCodeLoading.value = true
  try {
    const res: any = await getAppUserRelationAuth()
    const data = res?.data || res

    // 判断是否有关联账号权限：bindAuth 或 existedRelationBind 任一为 true 即可切换
    if (data?.bindAuth || data?.existedRelationBind) {
      // 有权限 → 刷新为【切换客户编码】状态页
      emit('switchMode')
    } else {
      // 无权限 → 进入【账密绑码】页
      emit('handelChangeCode')
    }
  } catch (error: any) {
    if (error?.code !== 100201) {
      Taro.showToast({ title: error?.msg || '服务错误', icon: 'none' })
    }
  } finally {
    changeCodeLoading.value = false
  }
}

/** 解绑确认弹窗是否显示 */
const showUnbindAlert = ref(false)

/** 解绑确认按钮 loading 状态（组件内部管理） */
const unbindLoading = ref(false)

/** 解绑弹窗 tip-bar 文案（由接口返回） */
const unbindRoleMsg = ref('')

/**
 * 点击解绑按钮 → 先查询用户角色，再弹出二次确认
 * H5逻辑：调用 getUserRoleByCustomerCode 获取角色提示文案，作为 tip-bar 展示
 */
const handleUnbindClick = async () => {
  const company = currentCompany.value
  if (!company?.customerCode) return

  // 埋点：点击解绑按钮
  clk_customer_code_button('解绑', { page_type: '更换客户编码' })

  try {
    const res: any = await getUserRoleByCustomerCode({ customerCode: company.customerCode })
    unbindRoleMsg.value = res?.data?.msg || res?.msg || ''
  } catch (e) {
    console.warn('getUserRoleByCustomerCode 失败:', e)
  }
  showUnbindAlert.value = true
  // 埋点：解绑确认弹窗曝光
  exp_customer_code_unbind_confirmpopup('更换客户编码')
}

/** 取消解绑（我再想想） */
const handleUnbindCancel = () => {
  clk_customer_code_unbind_confirmpopup_button('我再想想', '更换客户编码')
  showUnbindAlert.value = false
}

/**
 * 用户点击弹窗"解除绑定"确认 → 内部完成全部解绑流程
 */
const handleUnbindConfirm = async () => {
  const company = currentCompany.value
  if (!company?.customerCode) return

  // 埋点：确认解除绑定
  clk_customer_code_unbind_confirmpopup_button('解除绑定', '更换客户编码')

  unbindLoading.value = true
  try {
    await unBindCustomerCode({ customerCode: company.customerCode })
    Taro.showToast({ title: '解绑成功', icon: 'none' })
    // 埋点：解绑成功结果上报
    other_customer_code_bindpopup_success()
    showUnbindAlert.value = false
    emit('unbind')
  } catch (e) {
    console.error('解绑失败:', e)
    Taro.showToast({ title: '解绑失败，请重试', icon: 'none' })
  } finally {
    unbindLoading.value = false
  }
}
</script>
