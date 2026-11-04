import { AddressValue } from '@order-public-sub-public/constants'
import { useUpdateData } from '@order-public-sub-public/hooks/address/receive/useUpdateData'

export function useOcrAddress({ moduleStyle }: { moduleStyle: string }) {
  const { setEditValue } = useUpdateData({ moduleStyle })
  const getAddressOcrData = (item: AddressValue) => setEditValue({ item, needMerge: true })

  return { getAddressOcrData }
}
