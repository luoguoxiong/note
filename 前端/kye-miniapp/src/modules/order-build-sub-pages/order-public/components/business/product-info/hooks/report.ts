import { HistorySizeList } from '@order-public-sub-public/apis/product-info/types'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

/**
 * @description: 调用api结果上报
 */
export const apiResultReport = (success: boolean, eventCode: string, err?: any) => {
  let params = {}
  if (success) {
    params = {
      request_result: '成功',
    }
  } else {
    params = {
      request_result: '失败',
      failure_reason: err,
    }
  }
  umpOtherReport(
    'OTHER',
    {
      eventCode: eventCode,
    },
    {
      ...params,
    },
  )
}

export const curEditNameReport = (type: string, item: HistorySizeList) => {
  const params = {
    batch_id: item.batchId,
    goodsName: item.goodsName,
    button_name: type,
  }
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_select_size_history_size_edit_popup_v1',
    },
    {
      ...params,
    },
  )
}

/** 批量操作进入/退出 */
export const clk_select_size_batch_toggle_v1 = (type: 'enter' | 'exit') => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_select_size_batch_toggle_v1',
    },
    {
      type,
    },
  )
}

/** 批量全选/取消全选 */
export const clk_select_size_batch_selectall_v1 = (type: 'all' | 'cancel') => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_select_size_batch_selectall_v1',
    },
    {
      type,
    },
  )
}

/** 批量确定回填 */
export const clk_select_size_batch_confirm_v1 = (count: number) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_select_size_batch_confirm_v1',
    },
    {
      number_size: count,
    },
  )
}

/** 进入新增尺寸页 */
export const clk_select_size_addsize_v1 = () => {
  umpOtherReport('CLK', {
    eventCode: 'clk_express_select_size_addsize_v1',
  })
}

/** 新增尺寸保存 */
export const clk_add_size_save_v1 = (count: number) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_add_size_save_v1',
    },
    {
      number_size: count,
    },
  )
}

/** 删除尺寸（我的尺寸/历史尺寸） */
export const clk_select_size_delete_v1 = (type: 'mySize' | 'historySize') => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_select_size_delete_v1',
    },
    {
      type,
    },
  )
}
export const clk_express_goods_v1 = (button_name: string) => {
  const params = {
    button_name: button_name,
  }
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_goods_v1',
      regionCode: 'send_info',
    },
    {
      ...params,
    },
  )
}

export const clk_express_single_consignment_v1 = () => {
  umpOtherReport('CLK', {
    eventCode: 'clk_express_single_consignment_v1',
    regionCode: 'send_info',
  })
}

// 下单_寄件页_货物信息_弹窗消失
let flag = false
export const goodsPopupClosedReport = () => {
  if (flag) return
  umpOtherReport('OTHER', {
    eventCode: 'other_express_goods_popup_disappear_v1',
  })
  flag = true
  setTimeout(() => {
    flag = false
  }, 800)
}

export const clk_express_goods_desc_v1 = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_goods_desc_v1',
    },
    {
      button_name: '违禁品查询',
    },
  )
}

export const clk_express_goods_assoc_v1 = (item) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_goods_assoc_v1',
    },
    {
      goods_name: item.goodsType,
      goods_nature: item.nature,
      goods_firstcat: item.firstCategory,
    },
  )
}

export const clk_express_single_consignment_num_v1 = () => {
  umpOtherReport('CLK', {
    eventCode: 'clk_express_single_consignment_num_v1',
  })
}
export const clk_express_single_consignment_weight_v1 = () => {
  umpOtherReport('CLK', {
    eventCode: 'clk_express_single_consignment_weight_v1',
  })
}
export const clk_express_single_consignment_vol_v1 = () => {
  umpOtherReport('CLK', {
    eventCode: 'clk_express_single_consignment_vol_v1',
  })
}
export const clk_consignmet_size_add_v1 = () => {
  umpOtherReport('CLK', {
    eventCode: 'clk_consignmet_size_add_v1',
  })
}
export const clk_consignmet_size_reduce_v1 = () => {
  umpOtherReport('CLK', {
    eventCode: 'clk_consignmet_size_reduce_v1',
  })
}
export const clk_express_goods_specsdesc_v1 = () => {
  umpOtherReport('CLK', {
    eventCode: 'clk_express_goods_specsdesc_v1',
  })
}
export const clk_express_single_consignment_size_v1 = (type) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_consignment_size_v1',
    },
    {
      type,
    },
  )
}

export const other_express_single_goods_v1 = (data, type = 'success') => {
  let other =
    type === 'success'
      ? {
          fill_goodsname: data.goodsType,
          fill_VIPreceiptno: data.productCode,
          number_quantity: data.count,
          number_weight: data.actualWeight,
          number_volume: data.volumeSize,
          request_result: data.request_result,
        }
      : {
          fill_goodsname: data.goodsType,
          request_result: data.request_result,
          failure_reason: data.failure_reason,
        }
  if (data.preWaybillGoodsSizeList) {
    const list = data.preWaybillGoodsSizeList.filter((item) => item.width && item.height && item.length && item.count)
    if (list.length) {
      other.number_size = list.map((item) => `${item.length}, ${item.width}, ${item.height}, ${item.count}`).join(';')
    }
  }
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_single_goods_v1',
    },
    {
      ...other,
    },
  )
}

// 推荐卡片曝光
export const exp_ai_pack = (packaging_services, ai_strategy) => {
  umpOtherReport(
    'EXP',
    {
      eventCode: 'exp_express_goods_ai_packaging_v1',
    },
    {
      packaging_services,
      ai_strategy,
    },
  )
}

// 卡片内部包装服务点击
export const clk_ai_pack = (button_name) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_goods_ai_packaging_v1',
    },
    {
      button_name,
    },
  )
}

// 更多包装服务点击
export const clk_more_ai_pack = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_more_choice_package_v1',
    },
    {
      button_name: '更多包装服务',
    },
  )
}

// 选择包装服务点击
export const clk_choice_ai_pack = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_choice_package_v1',
    },
    {
      button_name: '包装服务',
    },
  )
}

// 包装服务弹窗关闭和确认
export const clk_pack_pop_report = (button_name) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_more_choice_packaging_control_v1',
    },
    {
      button_name,
    },
  )
}
