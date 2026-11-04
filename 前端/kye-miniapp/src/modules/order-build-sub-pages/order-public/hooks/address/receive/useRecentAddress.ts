import {
  clk_express_sender_information_control_v1,
  other_express_sender_information_control_v1,
} from '@order-public-sub-public/components/business/address-book/page/report'
import { AddressValue } from '@order-public-sub-public/constants'
import { useUpdateData } from '@order-public-sub-public/hooks/address/receive/useUpdateData'

// 最近地址
export function useRecentAddress({ moduleStyle }: { moduleStyle: string }) {
  const { setEditValue } = useUpdateData({ moduleStyle })

  const onSelectRecentAddress = (item: AddressValue) => {
    clk_express_sender_information_control_v1('receive', '最近收件地址')
    setEditValue({ item })
    other_express_sender_information_control_v1('receive', '最近收件地址')
  }

  return { onSelectRecentAddress }
}
