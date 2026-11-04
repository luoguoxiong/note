<template>
  <view v-if="visible" class="confirm-dept-dialog">
    <!-- 遮罩层 -->
    <view class="confirm-dept-dialog__bg" @click="handleClose"></view>

    <!-- 弹窗主体 -->
    <view class="confirm-dept-dialog__wrapper">
      <!-- 标题 -->
      <view class="confirm-dept-dialog__title">确认下单部门</view>

      <!-- 选择区域：带边框的容器（UI图: 包含提示+列表的整体区域有边框） -->
      <scroll-view :scroll-y="true" :showScrollbar="false" class="confirm-dept-dialog__content">
        <view class="confirm-dept-dialog__list-box">
          <!-- 提示文案 -->
          <view class="confirm-dept-dialog__hint">请选择下单部门</view>

          <!-- 部门列表 -->
          <view
            v-for="(dept, index) in departmentList"
            :key="index"
            class="confirm-dept-dialog__item"
            :class="{ 'is-current': isSelected(dept) }"
            @tap="handleSelect(dept)"
          >
            <ky-radio-v2
              :is-checked="isSelected(dept)"
              type="round"
              :size="32"
              :hide-label="true"
            />
            <text class="item-name">{{ dept.departmentName }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 底部按钮：取消 / 确定 -->
      <view class="confirm-dept-dialog__footer">
        <view class="cancel-btn" @tap="handleClose">取消</view>
        <view class="confirm-btn" @tap="handleConfirm">确定</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 确认下单部门弹窗组件（切换客户编码后弹出）
 *
 * UI交互说明:
 * 1. 切换客户编码时，如切换的公司"开通部门"以及用户"加入2个及2个以上部门"，需出现选择部门弹窗
 * 2. 弹窗默认选择成员最后添加的部门
 * 3. 点击[确定]为选择当前选中部门，关闭弹窗，返回toast提示"切换部门成功"
 * 4. 点击[取消]为选择默认部门，关闭弹窗，停留绑码组件，提示成功toast
 *
 * H5原始实现: switch-department-popup/confirm-department-dialog.jsx
 */
import { ref, watch } from 'vue'
import type { DepartmentInfo } from '../../types/customer-code'
import KyRadioV2 from '../ky-radio-v2/index.vue'
import { exp_change_departments } from '../../report/index'
import './ConfirmDepartmentDialog.scss'

interface Props {
  /** 是否显示 */
  visible: boolean
  /** 部门列表 */
  departmentList: DepartmentInfo[]
  /** 当前部门信息（用于默认选中） */
  currentDepartment: DepartmentInfo | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'confirm', deptCode: string): void
  (e: 'close'): void
}>()

/** 本地选中的部门编码 */
const selectedDeptCode = ref('')

/** 监听显示，同步默认选中（默认选中当前绑定部门） */
watch(
  () => props.visible,
  (val) => {
    if (val) {
      selectedDeptCode.value = props.currentDepartment?.departmentCode || ''
      // 埋点：部门切换弹窗曝光
      exp_change_departments()
    }
  },
)

/** 判断是否选中 */
const isSelected = (dept: DepartmentInfo): boolean => {
  return dept.departmentCode === selectedDeptCode.value
}

/** 选择部门 */
const handleSelect = (dept: DepartmentInfo) => {
  selectedDeptCode.value = dept.departmentCode
}

/** 确定：将选中的部门编码传给父组件 */
const handleConfirm = () => {
  emit('confirm', selectedDeptCode.value)
}

/** 取消：关闭弹窗 */
const handleClose = () => {
  emit('close')
}
</script>
