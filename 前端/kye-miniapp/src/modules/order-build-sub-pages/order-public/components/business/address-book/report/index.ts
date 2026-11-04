// 点击管理后触发一键清理地址功能曝光
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
export const showOneCleanTipReport = (recognition_type: string) => {
  umpOtherReport(
    'EXP',
    {
      eventCode: 'exp_oneclean_itc',
    },
    {
      recognition_type,
    },
  )
}

// 点击管理后触发一键清理地址功能
export const clickOneCleanTipReport = (recognition_type: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_oneclean_itc',
    },
    {
      recognition_type,
    },
  )
}

export const clickOneCleanPopReport = (button_name: string, recognition_type: string, type: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_onecleanpopup_itc',
    },
    {
      button_name,
      recognition_type,
      type,
    },
  )
}

export const clickOneCleanAddrDetailReport = (button_name: string, recognition_type: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_onecleanpopupdetail_itc',
    },
    {
      button_name,
      recognition_type,
    },
  )
}

// 一键清理二次确认
export const clickOneCleanDoubleConfReport = (button_name: string, recognition_type: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_onecleanconfirm_itc',
    },
    {
      button_name,
      recognition_type,
    },
  )
}

export const clickOneCleanRequestReport = (recognition_type: string, request_result: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'other_onecleanconfirm_itc',
    },
    {
      recognition_type,
      request_result,
    },
  )
}

// 二次确认弹窗曝光
export const addrRepeatPopExpReport = () => {
  umpOtherReport('EXP', {
    eventCode: 'exp_address_book_repeat_v1',
  })
}

// 二次确认弹窗点击
export const addrRepeatPopClickReport = (button_name: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_address_book_repeat_v1',
    },
    {
      button_name,
    }
  )
}

// 新增编辑地址、设置默认寄件地址
export const setDefaultFlagReport = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_send_address_book_v1',
    },
    {
      button_name: '设为默认寄件地址',
    }
  )
}
