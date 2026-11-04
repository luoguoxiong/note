import { computed } from 'vue'
import { Address } from '@order-public-sub-public/constants'
import useFormat from '@order-public-sub-public/hooks/address/sender/useFormat'
// 
import { companyNameModifyShipperFlag, senderMobileRequire } from './state'

export const useInitConfig = () => {
  const addressProps = computed(() => {
    return {
      source: Address.SENDER_ADDRESS_BOOK_PAGE,
      personConfig: {
        visible: true,
        editable: true,
        required: true,
        dataValidate: 'sender.person',
        format: useFormat().formatPerson,
        maxlength: 20,
      },
      mobileConfig: {
        visible: true,
        editable: true,
        required: senderMobileRequire.value ? true : false,
        dataValidate: 'sender.mobile',
        format: useFormat().formatMobile,
        maxlength: 13,
      },
      telephoneConfig: {
        visible: true,
        editable: true,
        required: false,
        dataValidate: 'sender.telephone',
      },
      companyNameConfig: {
        visible: true,
        // 公司名称是否可编辑需要从下单配置ERP或者客户后台ERP取值判断
        // editable: piniaStore.globalData.dynamicConfig('sendInfoVo')?.modifyShipperFlag,
        editable: companyNameModifyShipperFlag.value,
        required: false,
        dataValidate: 'sender.companyName',
        format: useFormat().formatCompanyName,
        maxlength: 32,
      },
      extensionConfig: {
        editable: true,
        required: true,
        format: useFormat().formatExtension,
        maxlength: 8,
      },
      addressConfig: {
        editable: true,
        visible: true,
        required: true,
        dataValidate: 'sender.address',
        detailAddressDataValidate: 'sender.detailAddress',
      },
      addressDetailLocation: true,
    }
  })

  return { addressProps }
}
