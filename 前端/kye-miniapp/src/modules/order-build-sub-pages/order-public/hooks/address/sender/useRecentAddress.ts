import {
  clk_express_sender_information_control_v1,
  other_express_sender_information_control_v1,
} from '@order-public-sub-public/components/business/address-book/page/report'
import { AddressValue } from '@order-public-sub-public/constants'
import { useUpdateData } from '@order-public-sub-public/hooks/address/sender/useUpdateData'

// 更新最近地址数据
export function useRecentAddress({ moduleStyle }: { moduleStyle: string }) {
  const { setEditValue } = useUpdateData({ moduleStyle })

  const onSelectRecentAddress = (item: AddressValue) => {
    clk_express_sender_information_control_v1('sender', '最近寄件地址')
    setEditValue({ item })
    other_express_sender_information_control_v1('sender', '最近寄件地址')
  }

  return { onSelectRecentAddress }
}
