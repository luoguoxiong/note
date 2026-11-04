/**
 * pc-web 旧基座 auth 模块 (Pinia 版)
 * 来源: netc-pc-web/src/store/modules/auth.js (namespaced: 'auth')
 *
 * 使用场景(标注):
 *  - 【权限】authCodeList UAM权限code列表 —— 登录后拉取一次, 同步写入 client.permissionCodes
 *    (旧版通过 root commit 'client/setPermissionPlus' 实现, Pinia 版直接调用 client store)
 *  - 【登出】logoutTip 登出错误提示 —— 登出失败时顶栏/登录页提示
 *
 * 【2026-09 删除】upgradeInfo/setUpgradeInfo: 旧项目中 setUpgradeInfo 无调用方, state 恒为 null(疑似弃用), 已移除
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUamPermissionList } from './deps/api'
import { usePcWebClientStore } from './client'

type AnyRecord = Record<string, any>

export const usePcWebAuthStore = defineStore('pcWebAuth', () => {
  // ==================== state (旧 auth.js state) ====================
  const authCodeList = ref<string[]>([])
  const logoutTip = ref('') // 登出错误提示

  // ==================== mutations (旧 auth.js mutations) ====================

  function setAuthCodeListMutation(list: string[]) {
    authCodeList.value = list
  }
  function SET_LOGOUT_TIP(payload: string) {
    logoutTip.value = payload
  }

  // ==================== actions (旧 auth.js actions) ====================

  /** 【权限】拉取UAM权限code列表并同步到 client.permissionCodes */
  async function setAuthCodeListAction() {
    const res = await getUamPermissionList()
    if (res.code === 0 && res.data) {
      const list = res.data.map((item: AnyRecord) => item.code)
      setAuthCodeListMutation(list)
      // 权限code列表 (旧版: commit('client/setPermissionPlus', list, { root: true }))
      const clientStore = usePcWebClientStore()
      clientStore.setPermissionPlus(list)
    }
  }

  /** 【登出】设置登出错误提示 */
  function setLoginTips(payload: string) {
    SET_LOGOUT_TIP(payload)
  }

  // ==================== getters (旧 auth.js getters) ====================

  // 旧版 getters 与同名 state 完全一致, Pinia setup store 直接暴露 state 即可

  return {
    // state
    authCodeList,
    logoutTip,
    // mutations
    setAuthCodeListMutation,
    SET_LOGOUT_TIP,
    // actions
    setAuthCodeListAction,
    setLoginTips,
  }
})
