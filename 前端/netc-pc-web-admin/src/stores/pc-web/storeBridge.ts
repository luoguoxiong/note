/**
 * iframe 子应用 Vuex 风格 store 通信兼容层
 *
 * 背景: 旧基座(netc-pc-web/admin Vuex)通过以下通道向 iframe 子应用暴露父容器 store:
 *  1. iframeBridge(Postmate): ACTION_STORE_ACTION / ACTION_STORE_MUTATION /
 *     ACTION_GET_STORE_DATA, 子应用按 '模块/action' 风格 key 动态触发/读取;
 *  2. iframe 容器组件(base.vue / index.vue): postMessage 'storeDispatch'/'storeCommit'
 *     消息转发 + window.parentStore 直连;
 * Vuex 移除后, 本模块以相同的 dispatch/commit/state 接口承接上述通道,
 * 将已知的旧 key 映射到 Pinia 实现, 未映射 key 仅开发环境告警。
 */
import { usePcWebRootStore } from './root'
import { usePcWebOrderConfigStore } from './orderConfig'
import { usePcWebPermissionStore } from './permission'
import { useUserStore } from '@/stores/user'
import useCustomerCodeStore from '@/views/home/module/module-customer-code/hooks/useCustomerCodeStore'

/** 已知旧 key -> Pinia 处理映射 */
function handleLegacyKey(key: string, value?: any) {
  switch (key) {
    // 下单配置弹窗遮罩(iframe 子应用 ACTIONS_SWITCH_MODAL / storeDispatch 通道)
    case 'orderConfig/update_order_config_modal':
    case 'orderConfig/UPDATE_ORDER_CONFIG_MODAL':
      usePcWebOrderConfigStore().updateOrderConfigModal(value)
      return true
    // 旧根 mutation: 写入用户信息
    case 'SET_USER_INFO':
      usePcWebRootStore().updateUserInfo(value || {})
      return true
    // 旧根 action: 拉取最新用户信息并更新(个人中心子应用保存资料后通知父级刷新)
    case 'updateUserInfo': {
      usePcWebRootStore().updateUserInfoAction()
      // 侧边栏头像/昵称/性别(useUserInfo.defaulSextAvatar 等)读 useUserStore, 同步强制刷新
      useUserStore().updateUserInfo()
      return true
    }
    // 旧根 action: 拉取可切换登录手机号列表(个人中心子应用保存资料后通知父级刷新)
    case 'setSwitchLoginMobileAction':
      usePcWebRootStore().setSwitchLoginMobileAction()
      return true
    // 旧根 action: 拉取实名认证信息(实名认证完成/变更后由个人中心子应用通知)
    case 'updateRealNameInfo': {
      usePcWebRootStore().updateRealNameInfoAction()
      // 侧边栏实名标签(headImgRealNameTagVO)读 useUserStore, 同步强制刷新
      useUserStore().updateUserInfo()
      return true
    }
    // 旧根 action: 拉取绑码关联权限(绑码/解绑后由个人中心子应用通知)
    case 'getAppUserRelationAuth': {
      usePcWebRootStore().getAppUserRelationAuthAction()
      // 侧边栏按钮文案/切换列表(relateAccountAuth/existedRelationBind)读 module useCustomerCodeStore, 同步刷新
      useCustomerCodeStore().getAppUserRelationAuthAction()
      return true
    }
    // 旧根 action: 拉取可绑定公司列表(绑码/解绑后由个人中心子应用通知)
    case 'setCustomerListAction': {
      usePcWebRootStore().setCustomerListAction()
      // 侧边栏切换列表(customerList/companyInfoType)读 module useCustomerCodeStore, force 强刷绕过会话缓存
      useCustomerCodeStore().fetchCustomerListAction(true)
      return true
    }
    // 权限模块(账号权限 iframe 子应用): 拉取/更新用户权限信息, 驱动 tabs 实时越权监听
    case 'permission/get_common_user':
      usePcWebPermissionStore().getCommonUser()
      return true
    case 'permission/update_auth_user':
      usePcWebPermissionStore().setAuthUserInfo(value || {})
      return true
    default:
      return false
  }
}

function warnUnmapped(method: 'dispatch' | 'commit', key: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[storeBridge] unmapped vuex-style ${method} key: "${key}"`)
  }
}

/** Vuex 风格 dispatch 兼容(iframe 子应用动态 action 触发) */
function dispatch(key: string, value?: any) {
  if (key && !handleLegacyKey(key, value)) {
    warnUnmapped('dispatch', key)
  }
}

/** Vuex 风格 commit 兼容(iframe 子应用动态 mutation 触发) */
function commit(key: string, value?: any) {
  if (key && !handleLegacyKey(key, value)) {
    warnUnmapped('commit', key)
  }
}

/**
 * Vuex 风格 state 兼容(ACTION_GET_STORE_DATA / parentStore.state.xxx 读取)
 * 仅暴露旧根 state 中仍有对应实现的成员
 */
function getState(): Record<string, any> {
  const rootStore = usePcWebRootStore()
  return {
    get userInfo() {
      return rootStore.userInfo
    },
  }
}

/** 挂载到 window.parentStore 的兼容对象(对齐旧基座暴露形状) */
export const storeBridge = {
  dispatch,
  commit,
  get state() {
    return getState()
  },
}
