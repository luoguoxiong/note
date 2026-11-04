import { useId } from './useFields'
import { setStoreValue } from './useUpdateData'
import { queryCompanyInfo, getRequireConfig } from '@order-public-sub-public/apis/address'

import { companyName, companyNameModifyShipperFlag, senderMobileRequire, voiceAiDiscernVisible } from './state'

/**
 * 初始化公司名
 */
async function initCompanyName() {
  const { id } = useId()
  // if (id.value) return

  try {
    const { data } = await queryCompanyInfo()

    // 缓存值
    companyName.value = data.customerCode
    companyNameModifyShipperFlag.value = data.modifyShipperFlag

    // 新增地址簿时，使用后台返回的值
    if (!id.value) {
      // 设置公司名
      setStoreValue({ companyName: companyName.value })
    } else {
      // 编辑地址簿时，公司名不可编辑，使用后台返回的值
      if (!companyNameModifyShipperFlag.value) {
        setStoreValue({ companyName: companyName.value })
      }
    }
  } catch (e) {
    setStoreValue({ companyName: '' })
  }
}

/**
 * 初始化公司名
 */
async function initRequireConfig(addressType: string) {
  try {
    const { data } = await getRequireConfig({ addressType })
    senderMobileRequire.value = data.senderMobileRequire || false
    voiceAiDiscernVisible.value = data.voiceAiDiscernVisible
  } catch (e) {
    senderMobileRequire.value = false
    setStoreValue({ companyName: '' })
  }
}

export function useInit(addressType: string) {
  initCompanyName()
  initRequireConfig(addressType)
}
