import { TodoListState } from '../store/types'

export type TodoSelectedTab = 'payment' | 'wp_order' | 'latest_waybill' | 'pending_item' | ''

export type TodoSelectedSubTab = '10' | '20' | '30' | '40' | ''

interface TodoTabsIn {
  paymentInfo: number
  thirdOrderInfo: number
  newestWaybillInfo: number
  total: number
  thirdOrderShow: boolean
}

// 第一次处理处理请求标识，如果是第一次，则根据接口设置默认选中
let isFirstRestDefault = true
let isFirstRestSubDefault = true

export const getTodoAllTabs = ({ paymentTotal, thirdOrderTotal, todoTotal, waybillTotal, thirdOrderShow }) => {
  const tabs = [
    { label: '费用支付', value: 'payment', total: paymentTotal, hide: paymentTotal <= 0 },
    { label: '唯品会订单', value: 'wp_order', total: thirdOrderTotal, hide: !thirdOrderShow, showBadge: true },
  ]

  if (waybillTotal > 0 || (waybillTotal === 0 && todoTotal === 0)) {
    tabs.push({ label: '最新运单', value: 'latest_waybill', total: waybillTotal, hide: false })
    tabs.push({ label: '待办事项', value: 'pending_item', total: todoTotal, showBadge: true, hide: false })
  } else {
    tabs.push({ label: '待办事项', value: 'pending_item', total: todoTotal, showBadge: true, hide: false })
    tabs.push({ label: '最新运单', value: 'latest_waybill', total: waybillTotal, hide: false })
  }

  return tabs.filter((i) => !i.hide)
}

export const getTodoTabsSelecter = (todoTabs: TodoTabsIn, currentSelectTab: TodoSelectedTab) => {
  const paymentTotal = todoTabs.paymentInfo
  const thirdOrderTotal = todoTabs.thirdOrderInfo
  const thirdOrderShow = todoTabs.thirdOrderShow || false
  const waybillTotal = todoTabs.newestWaybillInfo
  const todoTotal = todoTabs.total

  const showTabs = getTodoAllTabs({ paymentTotal, thirdOrderTotal, waybillTotal, todoTotal, thirdOrderShow })

  let defaultSelect: TodoSelectedTab = 'latest_waybill'

  // 唯品会订单优先级最高
  if (showTabs.find((i) => i.value === 'wp_order')) {
    defaultSelect = 'wp_order'
  }

  defaultSelect = showTabs[0]?.value as TodoSelectedTab

  const allShowTabValue = showTabs.map((item) => item.value)

  if (!isFirstRestDefault) {
    // 当前选中是否在所有tab内，不在则用默认的选择
    const selectedTab = allShowTabValue.includes(currentSelectTab) ? currentSelectTab : defaultSelect
    return { selectedTab }
  }

  isFirstRestDefault = false

  return { selectedTab: defaultSelect }
}

export const getTodoAllSubTabs = (todoList: TodoListState) => {
  const tabs = [
    {
      label: '付款授权',
      value: '10',
      count: todoList.paymentApproval?.count || 0,
      show: Boolean(todoList.paymentApproval?.count),
    },
    {
      label: '权限审批',
      value: '20',
      count: todoList.permissionApproval?.count || 0,
      show: Boolean(todoList.permissionApproval?.count),
    },
    {
      label: '运单审批',
      value: '30',
      count: todoList.waybillApproval?.count || 0,
      show: Boolean(todoList.waybillApproval?.count),
    },
    { label: '调价审核', value: '40', count: todoList.adjustPriceApproval?.count || 0, show: true },
  ]
  const showSubTabs = tabs.filter((i) => i.show)

  return showSubTabs
}

export const getTodoSubTabAndSelecter = (todoList: TodoListState, currentSelectTab: TodoSelectedSubTab) => {
  const showSubTabs = getTodoAllSubTabs(todoList)

  const filterTabs = showSubTabs.filter((i) => i.show && i.count)

  const defaultSelect = filterTabs[0]?.count > 0 ? filterTabs[0].value : '40'

  const allShowTabValue = showSubTabs.map((item) => item.value)

  if (!isFirstRestSubDefault) {
    const selectedSubTab = allShowTabValue.includes(currentSelectTab) ? currentSelectTab : defaultSelect
    return { showSubTabs, selectedSubTab }
  }

  isFirstRestSubDefault = false

  return { showSubTabs, selectedSubTab: defaultSelect }
}
