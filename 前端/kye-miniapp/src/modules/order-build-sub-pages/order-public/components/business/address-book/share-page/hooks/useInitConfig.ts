import { computed } from 'vue'
import useFormat from '@order-public-sub-public/hooks/address/receive/useFormat'
import { getData } from './useUpdateData'
import { Address } from '@order-public-sub-public/constants'

export const useInitConfig = () => {
  const addressProps = computed(() => {
    return {
      iconColor: '#B236F5',
      iconText: '收',
      title: '收件人信息',
      source: Address.RECEIVE_ADDRESS_BOOK_PAGE, // 来源
      personConfig: {
        visible: true,
        editable: true,
        required: true,
        dataValidate: 'receive.person',
        format: useFormat().formatPerson,
        maxlength: 40,
      },
      mobileConfig: {
        visible: true,
        editable: true,
        required: getData.value.telephone || getData.value.mobile ? false : true,
        dataValidate: 'receive.mobile',
        format: useFormat().formatMobile,
        maxlength: 18,
      },
      telephoneConfig: {
        visible: true,
        editable: true,
        required: getData.value.mobile || getData.value.telephone ? false : true,
        dataValidate: 'receive.telephone',
      },
      companyNameConfig: {
        visible: true,
        editable: true,
        required: false,
        dataValidate: 'receive.companyName',
        format: useFormat().formatCompanyName,
        maxlength: 32,
      },
      extensionConfig: {
        format: useFormat().formatExtension,
        maxlength: 8,
      },
      addressConfig: {
        visible: true,
        editable: true,
        required: true,
        dataValidate: 'receive.address',
        detailAddressDataValidate: 'receive.detailAddress',
      },
      addressDetailLocation: true,
    }
  })

  return { addressProps }
}
