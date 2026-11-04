import { computed } from 'vue'
import useFormat from '@order-public-sub-public/hooks/address/receive/useFormat'
import { getData } from './useUpdateData'
import { Address } from '@order-public-sub-public/constants'
import { AddressUnfoldFrom } from '../../types'

export const useInitConfig = () => {
  const addressProps = computed(() => {
    return {
      iconColor: '#B236F5',
      iconText: '返',
      title: '返单人信息',
      source: Address.RECEIVE_ADDRESS_BOOK_PAGE, // 来源
      personConfig: {
        visible: true,
        editable: true,
        required: true,
        dataValidate: 'addedService.receipter.person',
        format: useFormat().formatPerson,
        maxlength: 40,
      },
      mobileConfig: {
        visible: true,
        editable: true,
        required: true,
        dataValidate: 'addedService.receipter.mobile',
        format: useFormat().formatMobile,
        maxlength: 18,
        from: AddressUnfoldFrom.返单,
      },
      telephoneConfig: {
        visible: true,
        editable: true,
        required: getData.value.mobile || getData.value.telephone ? false : true,
        dataValidate: 'addedService.receipter.telephone',
      },
      companyNameConfig: {
        visible: true,
        editable: true,
        required: false,
        dataValidate: 'addedService.receipter.companyName',
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
        dataValidate: 'addedService.receipter.address',
        detailAddressDataValidate: 'addedService.receipter.detailAddress',
      },
      addressDetailLocation: true,
    }
  })

  return { addressProps }
}
