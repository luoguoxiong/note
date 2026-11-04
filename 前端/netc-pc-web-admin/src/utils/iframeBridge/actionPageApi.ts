/**
 * @Desc: actionPageApi - iframeBridge 页面交互能力调度
 */

import EE from '@/utils/eventemitter'

/** 动作页面映射表 */
export const actionPageMap: Record<string, { componentName: string; page: string }> = {
  // 单票修改弹窗关闭
  ORDER_CONFIG_SINGLE_MODIFY_DIALOG_CLOSE: {
    componentName: '',
    page: 'orderConfig',
  },
  // 执行配置下单页面刷新
  ORDER_CONFIG_PAGE_REFRESH: {
    componentName: '',
    page: 'orderConfig',
  },
}

/** 页面动作列表 */
export const ACTION_PAGE_LISTS: Record<string, string> = {
  消息单条触发: 'FUNCTION_MESSAGE_CENTER_ITEM_NAVIGATION',
  打开消息中心: 'FUNCTION_MESSAGE_CENTER_LIST_OPEN',
  付款授权消息弹窗: 'FUNCTION_MESSAGE_POPUP_PAYMENT',
}

/**
 * 消息单条触发：通过 EE 转发，由 header（setup 上下文）监听后调用
 * useMessageCenter().handleMessageNavigation（对齐老仓库直接调用行为，
 * 新版 useMessageCenter 依赖 useRouter 需在组件上下文中执行）
 */

/**
 * 通用-调用页面交互能力
 * @param data - 交互数据
 */
export const handleActionPageApi = (data: { method: string; params?: Record<string, any> }) => {
  const { method } = data

  switch (method) {
    case 'ORDER_CONFIG_SINGLE_MODIFY_DIALOG_CLOSE':
      EE.emit(method, { ...data, ...(actionPageMap[method] || {}) })
      break

    case 'ORDER_CONFIG_PAGE_REFRESH':
      switch (data?.params?.pageName) {
        case 'orderConfigSingle':
        case 'orderConfigBatch':
        case 'orderConfigSingleModify':
          EE.emit(`${method}_${data.params.pageName}`, { ...data, ...(actionPageMap[method] || {}) })
          break
      }
      break

    case ACTION_PAGE_LISTS['消息单条触发']:
      if (data.params) {
        EE.emit(ACTION_PAGE_LISTS['消息单条触发'], data.params)
      }
      break

    case ACTION_PAGE_LISTS['打开消息中心']:
      EE.emit(ACTION_PAGE_LISTS['打开消息中心'])
      break

    case 'OPEN_HEADER_SETTING':
      EE.emit('OPEN_HEADER_SETTING')
      break

    case ACTION_PAGE_LISTS['付款授权消息弹窗']:
      EE.emit(ACTION_PAGE_LISTS['付款授权消息弹窗'], { key: data?.params?.key })
      break

    default:
      console.log(`iframeBridge 通信方法：${method} 调用不存在`)
      break
  }
}
