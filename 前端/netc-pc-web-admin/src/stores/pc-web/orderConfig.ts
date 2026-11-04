/**
 * pc-web 旧基座 orderConfig 模块 (Pinia 版, 仅保留在用成员)
 * 来源: netc-pc-web/src/store/modules/orderConfig.js (namespaced: 'orderConfig')
 *       admin 旧 Vuex src/store/modules/orderConfig
 *
 * 说明: 旧模块的 orderConfigList/Ready/Url/BatchUrl 等轻应用 url 成员已随
 * 轻应用方案重构删除(见 index.ts 头注释), 此处仅保留下单配置弹窗遮罩开关,
 * 供 header 遮罩展示与 iframe 子应用 ACTIONS_SWITCH_MODAL 通信使用。
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePcWebOrderConfigStore = defineStore('pcWebOrderConfig', () => {
  /** 是否开启 modal 遮罩开关(下单配置弹窗) */
  const orderConfigModal = ref(false)

  /** 旧 action: orderConfig/update_order_config_modal */
  function updateOrderConfigModal(val: any) {
    orderConfigModal.value = !!val
  }

  return {
    orderConfigModal,
    updateOrderConfigModal,
  }
})
