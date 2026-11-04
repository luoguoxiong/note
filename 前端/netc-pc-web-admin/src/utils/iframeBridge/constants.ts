/**
 * **********************************************
 * 事件类型目前主要四大类
 * 1、获取通用数据
 * 2、业务交互功能
 * 3、客户端平台能力
 * 4、公共辅助方法
 * **********************************************
 */

// 1、获取通用数据
export const EVENT_TYPE_GET_GENERAL_DATA = 'EVENT_TYPE_GET_GENERAL_DATA'
// 业务交互功能
export const EVENT_TYPE_INTERACTION = 'EVENT_TYPE_INTERACTION'
// 客户端平台能力
export const EVENT_TYPE_PLATFORM = 'EVENT_TYPE_PLATFORM'
// 公共辅助方法
export const EVENT_TYPE_COMMON_UTILS = 'EVENT_TYPE_COMMON_UTILS'

/**
 * **********************************************
 * 具体的动作类型
 * 1、获取通用数据下面比如获取用户信息
 * 2、业务交互功能 跳转路由的动作
 * 3、客户端平台能力 比如打印唤起，文件操作
 * 4、公共辅助方法 比如判断当前环境是客户端还是浏览器
 * **********************************************
 */
// 获取用户信息
export const ACTIONS_GET_USER_INFO = 'ACTIONS_GET_USER_INFO'
// 获取token信息
export const ACTIONS_GET_TOKEN = 'ACTIONS_GET_TOKEN'
// 获取客户编码信息
export const ACTIONS_CUSTOMER_CODE = 'ACTIONS_CUSTOMER_CODE'
// 实名信息
export const ACTIONS_REALNAME_INFO = 'ACTIONS_REALNAME_INFO'
// 获取location href
export const ACTIONS_GET_LOCATION_HREF = 'ACTIONS_GET_LOCATION_HREF'

// 路由跳转
export const ACTIONS_LOCATION_ROUTER = 'ACTIONS_LOCATION_ROUTER'
// 路由跳转-新
export const ACTIONS_LOCATION_ROUTER_V2 = 'ACTIONS_LOCATION_ROUTER_V2'
// 获取平台类型
export const ACTIONS_IS_CLIENT_MODE = 'ACTIONS_IS_CLIENT_MODE'

// 广播数据
export const ACTIONS_BROADCAST_MESSAGE = 'ACTIONS_BROADCAST_MESSAGE'

// 路由变化
export const ON_ROUTE_CHANGE = 'ON_ROUTE_CHANGE'
// 路由激活（iframe页面显示）
export const ON_ROUTE_ACTIVE = 'ON_ROUTE_ACTIVE'
// 路由离开（iframe页面隐藏）
export const ON_ROUTE_LEAVE = 'ON_ROUTE_LEAVE'

// Mask遮罩开关
export const ACTIONS_SWITCH_MODAL = 'ACTIONS_SWITCH_MODAL'

// 调用client原生能力
export const ACTIONS_CLIENT_API_CALL = 'ACTIONS_CLIENT_API_CALL'

// 通用-调用页面交互能力
export const ACTIONS_PAGE_API_CALL = 'ACTIONS_PAGE_API_CALL'

// 弹出MessageBox消息
export const ACTIONS_$MESSAGE_SEND = 'ACTIONS_$MESSAGE_SEND'

// 弹出MessageBox消息
export const ACTIONS_$MESSAGEBOX_SEND = 'ACTIONS_$MESSAGEBOX_SEND'

// 弹出手机号重新登录逻辑
export const ACTION_HANDLE_LOGOUT_CONFIRM = 'ACTION_HANDLE_LOGOUT_CONFIRM'

// 通知父应用强刷浏览器
export const ACTION_BROWSER_RELOAD = 'ACTION_BROWSER_RELOAD'

// 通知父应用强刷浏览器
export const ACTION_LOCATION_CHANGE = 'ACTION_LOCATION_CHANGE'

// 通知父应用刷新url
export const ACTION_LOCATION_REPLACE_QUERY = 'ACTION_LOCATION_REPLACE_QUERY'

// 通知父容器触发store-action
export const ACTION_STORE_ACTION = 'ACTIONS_STORE_ACTION'
// 通知父容器触发store-mutation
export const ACTION_STORE_MUTATION = 'ACTIONS_STORE_MUTATION'

// 获取父容器querySelector dom
export const ACTIONS_QUERY_SELECTOR = 'ACTIONS_QUERY_SELECTOR'
export const ACTIONS_QUERY_SELECTOR_ALL = 'ACTIONS_QUERY_SELECTOR_ALL'

// 通知父容器更新token
export const ACTION_CHANGE_TOKEN = 'ACTION_CHANGE_TOKEN'
// 获取父容器store数据
export const ACTION_GET_STORE_DATA = 'ACTION_GET_STORE_DATA'
