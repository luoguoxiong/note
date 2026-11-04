/**
 * pc-web 旧基座 permission 模块 (Pinia 版, 精简)
 * 来源: netc-pc-web/src/store/modules/permission.js (namespaced: 'permission')
 *
 * 仅迁移「实时权限校验（越权监听）」所需子集：
 *  - 【越权】authUserInfo 登录用户权限信息（旧 state.auth_user_info）—— 回到首页时刷新
 *    （旧 routerGuard.afterEach: to.name === 'home' → dispatch('permission/get_common_user')）
 *  - 【越权】permissionMenuInfo 权限摘要（旧 getter permissionMenuInfo）—— tabs 组件 watch 捕获变更
 *
 * 旧版其余能力（审批角标/按钮配置/部门列表等）按需再迁移。
 * 旧版 get_common_user 会同步写 sessionStorage('UAM_USER')，新基座暂无消费方，未迁移。
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { uam_userInfo } from './deps/api'
import { uam_is_auth, uam_is_admin } from './deps/constants'

type AnyRecord = Record<string, any>

export const usePcWebPermissionStore = defineStore('pcWebPermission', () => {
  // ==================== state (旧 permission.js state.auth_user_info) ====================
  const authUserInfo = ref<AnyRecord>({})

  // ==================== mutations ====================

  /** 旧 mutation UPDATE_AUTH_USER：整体替换用户权限信息（子应用经 storeBridge 通道调用） */
  function setAuthUserInfo(payload: AnyRecord) {
    authUserInfo.value = payload || {}
  }

  // ==================== actions ====================

  /**
   * 旧 action get_common_user：拉取当前登录用户权限信息
   * 并处理 userRoleRequestList -> use_role_{roleType} 速查字段
   */
  async function getCommonUser() {
    try {
      const res = await uam_userInfo()
      if (res.code === 0) {
        const data = res.data || {}
        if (data.userRoleRequestList) {
          data.userRoleRequestList.forEach((item: AnyRecord) => {
            if (item.roleType) {
              data[`use_role_${item.roleType}`] = item
            }
          })
        }
        authUserInfo.value = data
        return data
      }
      ElMessage.error(res.msg)
      return authUserInfo.value
    } catch (e) {
      console.error('[permissionStore] getCommonUser error:', e)
      return authUserInfo.value
    }
  }

  // ==================== getters (旧 permission.js getters 精简) ====================

  /** 是否部门负责人（旧 getter isDepartmentManager） */
  const isDepartmentManager = computed(() => {
    const info = authUserInfo.value || {}
    const role = info.role || info.uamUserRole?.role
    return !(uam_is_auth(role) || uam_is_admin(role)) && Number(info?.isDepartmentManager) === 1
  })

  /**
   * 账号权限菜单信息（旧 getter permissionMenuInfo）
   * tabs 组件 deep watch 该对象，身份变化时触发越权处理
   */
  const permissionMenuInfo = computed(() => {
    const info = authUserInfo.value || {}
    const role = info.role || info.uamUserRole?.role
    const isAuth = uam_is_auth(role)
    const isAdmin = uam_is_admin(role)
    return {
      // 是否有账号权限管理菜单权限（旧 getter permissionMenuAble）
      permissionMenuAble: !!(info.customerCode && (isAuth || isAdmin || isDepartmentManager.value)),
      // 是否有(成员+部门)菜单（旧 getter hasDepartmentMenu）
      hasDepartmentMenu: (isAuth || isAdmin) && !!info?.departmentManagerSwitch,
      isAuthOrAdmin: isAuth || isAdmin,
      isDepartmentManager: isDepartmentManager.value,
      // 是否有公司配置菜单（旧 getter hasCompanyConfMenu）
      hasCompanyConfMenu: !!info?.companyConfMenuShow,
      // 是否开启部门管理开关（旧 getter departmentManagerSwitch）
      departmentManagerSwitch: info?.departmentManagerSwitch,
      haveApprovalOrderAuth: info?.haveApprovalOrderAuth === 20, // 是否有审批管理-运单审批权限
      id: info?.id,
      role,
    }
  })

  return {
    // state
    authUserInfo,
    // mutations
    setAuthUserInfo,
    // actions
    getCommonUser,
    // getters
    isDepartmentManager,
    permissionMenuInfo,
  }
})
