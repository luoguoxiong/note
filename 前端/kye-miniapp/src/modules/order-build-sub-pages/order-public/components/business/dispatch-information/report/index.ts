import { DispatchInformation } from '@order-public-sub-public/types'
import { fileType, pickupConfig } from '@order-public-sub-public/apis/pickup/type'
import { FileError } from '../types/types'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
const eventMap = {
  appointNumber: 'express_dispatch_appoint_v1',
  purchaseNumber: 'express_dispatch_purchase_v1',
  appointWareHouse: 'express_dispatch_warehouse_v1',
}

const keyMap = {
  appointNumber: 'reservation_number',
  purchaseNumber: 'purchase_number',
  appointWareHouse: 'warehouse',
}

/**
 * @description 派货资料表单点击、失焦上报
 * @param params
 */
export const reportDispatchFormField = (type: 'CLK' | 'OTHER', params: { item: pickupConfig; value: string }) => {
  const { item, value } = params

  const extraParams = { button_name: item.optionName }
  const key = Reflect.get(keyMap, item.fieldName)
  if (key) {
    Reflect.set(extraParams, key, value)
  }

  const eventCode = `${type.toLowerCase()}_${Reflect.get(eventMap, item.fieldName)}`
  umpOtherReport(type, { eventCode }, extraParams)
}

export const reportClickOcr = (
  formData: DispatchInformation,
  options: { request_status: 'success' | 'failure'; request_result: string },
) => {
  const otherParams = { ...options }

  if (options.request_status === 'success') {
    for (const key in formData) {
      const realKey = Reflect.get(keyMap, key)
      if (realKey) {
        Reflect.set(otherParams, realKey, Reflect.get(formData, key))
      }
    }
  }

  umpOtherReport('OTHER', { eventCode: 'other_express_dispatch_intellect_v1' }, otherParams)
}

export const reportAddFile = () => {
  umpOtherReport('CLK', { eventCode: 'clk_express_dispatch_file_v1' }, { button_name: '添加文件' })
}

export const reportAddImage = () => {
  umpOtherReport('CLK', { eventCode: 'clk_express_dispatch_picture_v1' }, { button_name: '添加图片' })
}

export const reportDispatchSubmit = (
  form: {
    formData: DispatchInformation
    fileList: fileType[]
  },
  result: boolean,
  err?: any,
) => {
  const fileList = form.fileList || []
  const {
    appointNumber: reservation_number,
    purchaseNumber: purchase_number,
    appointWareHouse: warehouse,
  } = form.formData
  const picNumber = fileList.filter((i) => i.type === 'img').length
  const fileNumber = fileList.length - picNumber
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_single_delivery_information_v1',
      regionCode: '',
    },
    {
      reservation_number,
      purchase_number,
      file_number: fileNumber,
      pic_number: picNumber,
      appointment_time: '',
      request_result: result ? '成功' : '失败',
      failure_reason: err?.content,
      warehouse,
    },
  )
}

export const reportClickDeleteFile = (fileItem: fileType) => {
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_dispatch_delete_v1' },
    {
      button_name: '删除文件',
      file_name: fileItem.fileName,
      file_type: fileItem.type,
      file_size: fileItem?.size || fileItem.fileSize,
    },
  )
}

export const reportReadFileFail = (params: FileError) => {
  const { file, request_result } = params
  umpOtherReport(
    'EXP',
    { eventCode: 'exp_express_dispatch_addfalse_v1' },
    {
      request_status: 'failure',
      request_result,
      file_name: file.fileName,
      file_type: file.fileType,
      file_size: file?.size || file.fileSize,
    },
  )
}

export const reportLeavePage = () => {
  umpOtherReport('CLK', { eventCode: 'clk_express_dispatch_back_v1' }, { button_name: '返回' })
}

export const reportLeaveDialog = () => {
  umpOtherReport('EXP', { eventCode: 'exp_express_dispatch_back_v1' })
}

export const reportClickLeaveDialog = (type: 'confirm' | 'cancel') => {
  const text = type === 'confirm' ? '确定' : '取消'
  umpOtherReport('CLK', { eventCode: `clk_express_dispatch_back_${type}_v1` }, { button_name: `${text}离开` })
}

export const clk_express_Delivery_v1 = () => {
  umpOtherReport('CLK', { eventCode: 'clk_express_Delivery_v1' }, { button_name: '派货资料' })
}

export const exp_express_dispatch_topbanner_v1 = (content) => {
  umpOtherReport('EXP', { eventCode: 'exp_express_dispatch_topbanner_v1' }, { content })
}

export const exp_express_dispatch_topbanner_view_v1 = () => {
  umpOtherReport('EXP', { eventCode: 'exp_express_dispatch_topbanner_view_v1' })
}
/**
 * 上传失败曝光
 */
export const exp_express_dispatch_upflash_v1 = (file) => {
  umpOtherReport(
    'EXP',
    { eventCode: 'exp_express_dispatch_upflash_v1' },
    {
      file_name: file?.name || file?.fileName,
      file_type: file?.type || file?.fileType,
      file_size: file?.size || file?.fileSize,
    },
  )
}
