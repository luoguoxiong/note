import { AddressType } from '@order-public-sub-public/constants'
import { addressID, ListReactiveType, EAddressPermissionTab } from '../../types'
import { computed, ComputedRef } from 'vue'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
let recognition_type: ComputedRef<string> // 寄件|收件
let addressType: ComputedRef<string>

export function recognition_type_init(state: ListReactiveType, tabs: { title: string }[], type: string) {
  recognition_type = computed(() => {
    if (tabs[state.active].title === '寄件地址') {
      return '寄件'
    } else {
      return '收件'
    }
  })
  addressType = computed(() => {
    if (tabs[state.active].title === '寄件地址') {
      return '10'
    } else {
      return '20'
    }
  })
  console.log(type)
}

// 地址簿控件点击
export function clk_express_single_choise_v1(recognition_type: string, reportType: 'bind' | 'methods' = 'methods') {
  const type = recognition_type === 'receive.receive' ? '收件' : '寄件'
  if (reportType === 'methods') {
    umpOtherReport(
      'CLK',
      {
        eventCode: 'clk_express_single_choise_v1',
      },
      { button_name: `${type}地址簿`, recognition_type: type },
    )
  } else {
    umpOtherReport(
      'CLK',
      {
        eventCode: 'clk_express_single_choise_v1',
        regionCode: 'address',
      },
      { button_name: `${type}地址簿`, recognition_type: type },
    )
  }
}
// 寄件地址簿
export function clk_express_single_address_book_v1(button_name: string) {
  const isSender = recognition_type?.value === '寄件' || window.location.href.includes('sender-page')
  umpOtherReport(
    'CLK',
    {
      eventCode: isSender ? 'clk_express_single_send_address_book_v1' : 'clk_express_single_received_address_book_v1',
      regionCode: 'address',
    },
    { button_name, recognition_type: isSender ? '寄件' : '收件' },
  )
}
// 寄件地址簿_地址选择成功
export function other_express_single_address_book_v1(err?: unknown) {
  if (err) {
    umpOtherReport(
      'OTHER',
      {
        eventCode:
          addressType.value === '10'
            ? 'other_express_single_send_address_book_v1'
            : 'other_express_single_received_address_book_v1',
        regionCode: 'address',
      },
      {
        recognition_type: recognition_type.value,
        request_result: '失败',
        failure_reason: err,
      },
    )
  } else {
    umpOtherReport(
      'OTHER',
      {
        eventCode:
          addressType.value === '10'
            ? 'other_express_single_send_address_book_v1'
            : 'other_express_single_received_address_book_v1',
        regionCode: 'address',
      },
      {
        recognition_type: recognition_type.value,
        request_result: '成功',
        failure_reason: '',
      },
    )
  }
}

export const clk_express_single_sender_address_book_send_button_v1 = (addressType: AddressType) => {
  const eventCode = {
    [AddressType.SENDER]: 'clk_express_single_sender_address_book_send_button_v1',
    [AddressType.RECEIVE]: 'clk_express_single_receive_address_book_send_button_v1',
  }
  const curEventCode = eventCode[addressType]

  if (!eventCode) return
  umpOtherReport(
    'CLK',
    {
      eventCode: curEventCode,
    },
    {
      button_name: '去寄件',
    },
  )
}

// 寄件_快速寄件页_填写寄件人信息页_控件名称_点击保存
export const clk_express_sender_control_v1 = (addressType: AddressType, button_name = '保存') => {
  const eventCode = {
    [AddressType.SENDER]: 'clk_express_sender_control_v1',
    [AddressType.RECEIVE]: 'clk_express_receive_control_v1',
  }
  const curEventCode = eventCode[addressType]

  if (!eventCode) return
  umpOtherReport(
    'CLK',
    {
      eventCode: curEventCode,
    },
    {
      button_name,
    },
  )
}

export const clk_express_sender_information_control_v1 = (type: 'sender' | 'receive', name: string) => {
  const eventCodeMap = {
    sender: 'clk_express_sender_information_control_v1',
    receive: 'clk_express_receiver_information_control_v1',
  }
  const eventCode = eventCodeMap[type]
  if (!eventCode) return
  umpOtherReport(
    'CLK',
    {
      eventCode: eventCode,
    },
    {
      button_name: name,
    },
  )
}

/**
姓名，手机，固话，分机号，省市区，详细地址，定位，保存到地址簿，清空，最近寄件地址 *
 */
export const other_express_sender_information_control_v1 = (type: 'sender' | 'receive', name: string) => {
  const eventCodeMap = {
    sender: 'other_express_sender_information_control_v1',
    receive: 'other_express_receiver_information_control_v1',
  }
  const eventCode = eventCodeMap[type]
  if (!eventCode) return
  umpOtherReport(
    'OTHER',
    {
      eventCode: eventCode,
    },
    {
      button_name: name,
    },
  )
}

export const exp_express_single_sender_address_book_send_button_v1 = (addressType: AddressType) => {
  const eventCode = {
    [AddressType.SENDER]: 'exp_express_single_sender_address_book_send_button_v1',
    [AddressType.RECEIVE]: 'exp_express_single_receive_address_book_send_button_v1',
  }
  const curEventCode = eventCode[addressType]
  return {
    eventCode: curEventCode,
  }
}

export const other_express_single_address_book_select_v1 = (
  addressType: AddressType | 'order-batch',
  addressId: addressID,
) => {
  const eventCode = {
    [AddressType.SENDER]: 'other_express_single_send_address_book_v1',
    [AddressType.RECEIVE]: 'other_express_single_received_address_book_v1',
    'order-batch': 'other_express_address_book_sub_v1',
  }
  const curEventCode = eventCode[addressType]
  if (!curEventCode) return
  umpOtherReport(
    'OTHER',
    {
      eventCode: curEventCode,
      regionCode: 'address',
    },
    {
      ...addressId,
    },
  )
}
export const clk_express_single_send_address_book_label_v1 = (type: 'sender' | 'receive', name: string) => {
  const eventCodeMap = {
    sender: 'clk_express_single_send_address_book_label_v1',
    receive: 'clk_express_single_received_address_book_label_v1',
  }
  const eventCode = eventCodeMap[type]
  if (!eventCode) return
  umpOtherReport(
    'CLK',
    {
      eventCode: eventCode,
    },
    {
      button_name: name,
    },
  )
}

export const clk_express_book_address_tab_v1 = (name: string, recognition_type: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_book_address_tab_v1',
    },
    {
      button_name: name,
      recognition_type,
    },
  )
}

export const clk_express_book_address_tag_add_v1 = (name: string, recognition_type: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_book_address_tag_add_v1',
    },
    {
      button_name: name,
      recognition_type,
    },
  )
}

export const clk_express_book_address_tag_management_v1 = (name: string, recognition_type: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_book_address_tag_management_v1',
    },
    {
      button_name: name,
      recognition_type,
    },
  )
}

// export const clk_express_sender_control_v1 = (type: 'sender' | 'receive', name: string) => {
//   const eventCodeMap = {
//     sender: 'clk_express_sender_control_v1',
//     receive: 'clk_express_receive_control_v1',
//   }
//   const eventCode = eventCodeMap[type]
//   if (!eventCode) return
//   umpOtherReport(
//     'CLK',
//     {
//       eventCode: eventCode,
//     },
//     {
//       button_name: name,
//     }
//   )
// }

export const clk_express_book_address_settag_v1 = (name: string, recognition_type: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_book_address_settag_v1',
    },
    {
      button_name: name,
      recognition_type,
    },
  )
}

// 邀请寄件按钮埋点
export const inviteReport = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_receiver_address_invite_v1',
    },
    {
      button_name: '邀请他人填写',
    },
  )
}

// 邀请寄提示pop
export const invitePopReport = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_receiver_address_invite_popup_v1',
    },
    {},
  )
}
// 埋点
export const reportTabShow = (tab: string, recognition_type: string) => {
  // 埋点触发
  try {
    let EAddValueMap: Record<string, string> = {
      [EAddressPermissionTab.全部地址]: '全部地址',
      [EAddressPermissionTab.我的地址]: '我的地址',
      [EAddressPermissionTab.共享地址]: '共享地址',
    }
    umpOtherReport(
      'OTHER',
      {
        eventCode: 'other_express_book_perception_v1',
      },
      { page_type: EAddValueMap[tab], recognition_type },
    )
  } catch (error) {
    console.log('error ', error)
  }
}
