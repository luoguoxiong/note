<template>
  <ky-popup :show="show" position="bottom" :close-on-click-overlay="true" @open="handleOpen" @close="handleClose">
    <view class="dept-popup">
      <!-- 标题栏 -->
      <view class="popup-header">
        <text class="popup-title">下单部门</text>
        <view class="close-icon" @click="handleClose">
          <image src="https://ic-img.ky-express.com/netc/20250118_42870395139_!!1737186469837_64_64.png"></image>
        </view>
      </view>

      <!-- 部门列表 -->
      <scroll-view class="dept-list" :scroll-y="true" :showScrollbar="false" :class="['dept-list-content', 'height-652']">
        <view class="list-inner ">
          <view
            v-for="(dept, index) in departmentList"
            :key="index"
            class="dept-item"
            @tap="handleSelect(dept)"
          >
            <text class="dept-name" :class="{ 'dept-name--active': isSelected(dept) }">{{ dept.departmentName }}</text>
            <ky-radio-v2
              :isChecked="isSelected(dept)"
              type="round"
              :size="32"
            />
          </view>
        </view>
      </scroll-view>

      <!-- 底部按钮 -->
      <view class="popup-footer">
        <ky-button class="confirm-btn" type="primary" size="large" @click="handleConfirm"> 确定 </ky-button>
      </view>
    </view>
  </ky-popup>
</template>

<script setup lang="ts">
/**
 * 客户编码模块 - 部门切换弹窗组件
 *
 * 用于快速寄件页场景下的部门选择
 * 使用 miniUI 组件库 (ky-popup, ky-radio, ky-button)
 */
import { ref } from 'vue'
import type { DepartmentInfo } from '../../types/customer-code'
import './index.scss'
import KyRadioV2 from '../ky-radio-v2/index.vue'

interface Props {
  /** 是否显示 */
  show: boolean
  /** 部门列表 */
  departmentList: DepartmentInfo[]
  /** 当前选中的部门 */
  currentDepartment: DepartmentInfo | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select', dept: DepartmentInfo): void
  (e: 'close'): void
}>()

/** 本地选中的部门（用于交互反馈） */
const localSelectedDept = ref<DepartmentInfo | null>(null)

/** 弹窗打开时同步当前部门 */
const handleOpen = () => {
  localSelectedDept.value = props.currentDepartment
}

/** 判断是否选中 */
const isSelected = (dept: DepartmentInfo): boolean => {
  return !!localSelectedDept.value && dept.departmentCode === localSelectedDept.value.departmentCode
}

/** 处理选择部门 */
const handleSelect = (dept: DepartmentInfo) => {
  localSelectedDept.value = dept
}

/** 确认选择 */
const handleConfirm = () => {
  if (localSelectedDept.value && !isSelected(props.currentDepartment!)) {
    emit('select', localSelectedDept.value)
  }
  handleClose()
}

/** 关闭弹窗 */
const handleClose = () => {
  emit('close')
}
</script>
