import { TodoTabEnum } from '@/apis/home/types'

/* 离开页面埋点 - 关闭tab */
export const quitPage = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_page_tab_close_v1',
      event_code: 'clk_homepage_page_tab_close_v1',
      region_code: 'page_tab',
    },
    {}
  )
}

const maps = {
  [TodoTabEnum.PAYMENT]: {
    expInfo: {
      eventCode: 'exp_homepage_fee_payment_todo_v1',
      region_code: 'fee_payment_todo',
    },
  },
  [TodoTabEnum.PAY_AUTH]: {
    expInfo: {
      eventCode: 'exp_homepage_pay_accredit_todo_v1',
      region_code: 'pay_accredit_todo',
    },
  },
  [TodoTabEnum.AUTH_APPROVAL]: {
    expInfo: {
      eventCode: 'exp_homepage_authority_approval_todo_v1',
      region_code: 'authority_approval_todo',
    },
  },
  [TodoTabEnum.WAYBILL_APPROVAL]: {
    expInfo: {
      eventCode: 'exp_homepage_waybill_approval_todo_v1',
      region_code: 'waybill_approval_todo',
    },
  },
}

// 曝光待办事项
export const expTodoItems = (tabVal: TodoTabEnum) => {
  window.$umpOtherReport(
    'EXP',
    {
      eventCode: maps[tabVal].expInfo.eventCode,
    },
    {
      region_code: maps[tabVal].expInfo.region_code,
    }
  )
}

export const getTodoExpConfig = (tab: TodoTabEnum) => {
  console.log(tab)
  return maps[tab]?.expInfo || {}
}
