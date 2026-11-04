import { fileType } from '@order-public-sub-public/apis/pickup/type'
import { FileError } from '../../dispatch-information/types/types'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import { isWxPcAppletEnv } from '@/public/utils'
export const buttonReport = (button: string) => {
  return {
    eventCode: 'clk_express_entrust_control_v1',
    otherParams: () => {
      return { button_name: button }
    },
  }
}
export const dialogReport = (button: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_entrust_control_v1',
    },
    {
      button_name: button,
    },
  )
}

const eventMap = {
  person: 'express_pickup_person_v1',
  mobile: 'express_pickup_mobile_v1',
  telephone: 'express_pickup_telephone_v1',
}

const keyMap = {
  person: 'trust_name',
  mobile: 'trust_number',
  telephone: 'trust_tel',
}

/**
 * @description 取货资料表单点击、失焦上报
 * @param params
 */
export const reportPickupFormField = (type: 'CLK' | 'OTHER', params: { fieldName: string; value: string }) => {
  const { fieldName, value } = params

  const extraParams = {}
  const key = Reflect.get(keyMap, fieldName)
  if (key) {
    Reflect.set(extraParams, key, value)
  }

  const eventCode = `${type.toLowerCase()}_${Reflect.get(eventMap, fieldName)}`
  umpOtherReport(type, { eventCode }, extraParams)
}

export const reportAddFile = () => {
  umpOtherReport('CLK', { eventCode: 'clk_express_pickup_file_v1' }, { button_name: '添加文件' })
}

export const reportAddImage = () => {
  umpOtherReport('CLK', { eventCode: 'clk_express_pickup_picture_v1' }, { button_name: '添加图片' })
}

export const reportClickDeleteFile = (fileItem: fileType) => {
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_pickup_delete_v1' },
    {
      button_name: '删除文件',
      file_name: fileItem.fileName,
      file_type: fileItem.type,
      file_size: fileItem.size || fileItem.fileSize,
    },
  )
}

export const reportReadFileFail = (params: FileError) => {
  const { file, request_result } = params
  umpOtherReport(
    'EXP',
    { eventCode: 'exp_express_pickup_addfalse_v1' },
    {
      request_status: 'failure',
      request_result,
      file_name: file?.fileName,
      file_type: file?.fileType,
      file_size: file?.size || file?.fileSize,
    },
  )
}

export const reportLeavePage = () => {
  umpOtherReport('CLK', { eventCode: 'clk_express_pickup_back_v1' }, { button_name: '返回' })
}

export const reportLeaveDialog = () => {
  umpOtherReport('EXP', { eventCode: 'exp_express_pickup_back_v1' })
}

export const reportClickLeaveDialog = (type: 'confirm' | 'cancel') => {
  const text = type === 'confirm' ? '确定' : '取消'
  umpOtherReport('CLK', { eventCode: `clk_express_pickup_back_${type}_v1` }, { button_name: `${text}离开` })
}
export const reportSubmit = (params: Record<string, string | number>) => {
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_single_entrusted_pickup_v1',
    },
    params,
  )
}

export const clk_express_entrust_v1 = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_entrust_v1',
    },
    { button_name: '取货资料' },
  )
}

export const clk_express_pickup_person_v1 = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_pickup_person_v1',
    },
    { button_name: '取货联系人' },
  )
}
export const clk_express_pickup_mobile_v1 = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_pickup_mobile_v1',
    },
    { button_name: '取货联系人手机' },
  )
}
export const clk_express_pickup_telephone_v1 = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_pickup_telephone_v1',
    },
    { button_name: '取货联系人电话' },
  )
}
export const clk_express_single_entrusted_pickup_ai_pickup_recommend_v1 = (item) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_entrusted_pickup_ai_pickup_recommend_v1',
    },
    {
      button_name: '点击推荐使用成功',
      ai_strategy_code: item.strategyId,
    },
  )
}

/**
 * 上传失败曝光
 */
export const exp_express_pickup_upflash_v1 = (file) => {
  umpOtherReport(
    'EXP',
    { eventCode: 'exp_express_pickup_upflash_v1' },
    {
      file_name: file?.name || file?.fileName,
      file_type: file?.type || file?.fileType,
      file_size: file?.size || file?.fileSize,
    },
  )
}

// 下单_资料_上传方式_微信_点击
export const uploadToWXListClickReport = () => {
  umpOtherReport('CLK', {
    eventCode: 'clk_express_file_uploadtype_wechat_v1',
  })
}

// 下单_资料_上传方式_手机_点击 or 手机_点击
export const uploadToPhoneOrPcClickReport = () => {
  const eventCode = isWxPcAppletEnv ? 'clk_express_file_uploadtype_computer_v1' : 'clk_express_file_uploadtype_phone_v1'
  umpOtherReport('CLK', {
    eventCode,
  })
}

// 下单_资料_上传方式_页面浏览
export const uploadPageExpressReport = () => {
  umpOtherReport('EXP', {
    eventCode: 'page_express_file_uploadtype_v1',
  })
}

// 货物照片曝光
export const cargoImgShowReport = () => {
  umpOtherReport('EXP', {
    eventCode: 'exp_express_goodsphoto_v1',
  })
}

// 添加和删除货物照片
export const optCargoImgReport = (type: 'add' | 'del') => {
  const eventMap = {
    add: 'clk_express_goodsphoto_add_v1',
    del: 'clk_express_goodsphoto_delete_v1',
  }
  umpOtherReport('CLK', {
    eventCode: eventMap[type],
  })
}
