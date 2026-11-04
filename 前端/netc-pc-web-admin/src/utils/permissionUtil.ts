/**
 * 权限校验工具
 * 来源: netc-pc-web/src/views/permission-manage/permissionUtil.js（实时越权子集）
 *
 * 供 tabs 组件 watch permissionMenuInfo 时使用：
 *  - permissionIsEqual 判断权限摘要是否变化
 *  - permissionManageUserAuthEqual 判断用户可感知的权限维度是否变化
 *  - permissionAuthConfirm 越权提示弹窗（customClass 用于防重复弹窗检测）
 */
import { isEqual } from 'lodash'
import { KMessageBox } from '@netc-design-pc/ui'
import { uam_is_normal } from '@/stores/pc-web/deps/constants'

type AnyRecord = Record<string, any>

/** 权限摘要对象是否完全一致（旧 permissionUtil.permissionIsEqual） */
export const permissionIsEqual = (currentData: AnyRecord, oldData: AnyRecord) => {
  return isEqual(currentData, oldData)
}

/**
 * 权限用户角色是否变更（旧 permissionUtil.permissionManageUserAuthEqual）
 * @returns true 表示用户可感知的权限维度未变化，无需越权处理
 */
export const permissionManageUserAuthEqual = (val: AnyRecord, oldVal: AnyRecord) => {
  const valid =
    oldVal?.role === val?.role &&
    (uam_is_normal(oldVal?.role) ? oldVal?.isDepartmentManager === val?.isDepartmentManager : true) &&
    oldVal?.hasCompanyConfMenu === val?.hasCompanyConfMenu &&
    oldVal?.departmentManagerSwitch === val?.departmentManagerSwitch
  return valid
}

/**
 * 越权提示弹窗（旧 permissionUtil.permissionAuthConfirm）
 * customClass 同时作为「是否已存在越权弹窗」的 DOM 检测标记（.permission-confirm-refresh）
 */
export const permissionAuthConfirm = () => {
  return KMessageBox.confirm('您的身份已发生变化，请刷新后重试', {
    closeOnClickModal: false,
    closeOnPressEscape: false,
    showClose: false,
    title: '温馨提示',
    confirmButtonText: '我知道了',
    type: 'warning',
    showCancelButton: false,
    customClass: 'permission-confirm-refresh permission-confirm-ft-normal',
  })
}
