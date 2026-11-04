<template>
  <view v-if="showDepartment && departmentList.length > 0" class="department-section">
    <view class="department-row">
      <view class="department-info">
        <text class="dept-label">下单部门：</text>
        <text class="dept-value">{{ currentDepartment?.departmentName || '未设置' }}</text>
      </view>
      <view v-if="departmentList.length > 1" class="switch-dept-btn" @click="handleSwitchDepartment">
        <image
          class="switch-icon"
          src="https://ic-img.ky-express.com/netc/20260527_55193_!!1779849413398_24_24.svg+xml"
        />
        切换
      </view>
    </view>

    <!-- 部门切换弹窗 -->
    <SwitchDepartmentPopup
      :show="showDeptPopup"
      :department-list="departmentList"
      :current-department="currentDepartment"
      @select="handleDeptSelect"
      @close="showDeptPopup = false"
    />
  </view>
</template>

<script setup lang="ts">
/**
 * 部门切换组件
 *
 * 从 ChangeCodeCard 中抽离出来，作为独立组件使用
 * 展示当前部门信息，支持切换操作
 */
import { ref, computed, onMounted } from 'vue'
import SwitchDepartmentPopup from './SwitchDepartmentPopup.vue'
import { useCompanyList } from '../../hooks/useCompanyList'
import { useCustomerCodeStore } from '../../store/customerCode'
import { clk_change_departments_button, other_change_departments_success, clk_customer_code_button } from '../../report/index'
import './index.scss'

interface Props {
  /** 是否显示部门切换（快速寄件页） */
  showDepartment?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDepartment: false,
})

const emit = defineEmits<{
  (e: 'switchDepartment', dept: any): void
}>()

const store = useCustomerCodeStore()
const { currentCompany, switchDept, fetchDepartments } = useCompanyList()

const departmentList = computed(() => store.departmentList)
const currentDepartment = computed(() => store.currentDepartment)

/** 是否显示部门弹窗 */
const showDeptPopup = ref(false)

/**
 * 组件挂载时获取部门列表（仅快速寄件页）
 */
onMounted(async () => {
  if (props.showDepartment) {
    await fetchDepartments(currentCompany.value?.customerCode)
  }
})

/**
 * 处理点击切换部门
 */
const handleSwitchDepartment = async () => {
  if (!currentDepartment.value) return

  clk_customer_code_button('切换', { page_type: '切换客户编码' })

  await fetchDepartments(currentCompany.value?.customerCode)

  if (departmentList.value.length > 1) {
    showDeptPopup.value = true
  }
}

/**
 * 处理选择部门
 */
const handleDeptSelect = async (dept: any) => {
  clk_change_departments_button('确定')

  const success = await switchDept(dept)
  if (success) {
    other_change_departments_success()
    emit('switchDepartment', dept)
  }
  showDeptPopup.value = false
}
</script>
