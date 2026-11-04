import { useMobile, useTelephone, usePerson } from '@order-public-sub-public/hooks/address/sender/useFields'
import { ComputedRef } from 'vue'
import { getContactData } from '@order-public-sub-public/components/business/receive/hooks/selectContact'
import { closeTippy, removeErrClassByDataValidate } from '@order-public-sub-public/validate/effect/effectBubble'
import useValidate from '@order-public-sub-public/hooks/address/sender/useValidate'
import { getData } from '@order-public-sub-public/hooks/address/sender/useUpdateData'
const { checkValidate } = useValidate()

export const useSelectContact = ({ moduleStyle }: { moduleStyle: string }, clearStatus?: ComputedRef<boolean>) => {
  const selectContact = async () => {
    const { onInputMobile } = useMobile({ moduleStyle, clearStatus })
    const { onInputTelephone, onInputExtension } = useTelephone({ moduleStyle })
    const { onInputPerson } = usePerson({ moduleStyle })
    const { isMobile, phone, person } = await getContactData()
    closeTippy()
    if (person) {
      onInputPerson(person)
      removeErrClassByDataValidate('sender.person')
      checkValidate({
        required: true,
        fieldKey: 'person',
        value: person,
        originalData: getData(),
      })
    }
    if (!phone) {
      return
    }
    if (isMobile) {
      onInputMobile(phone)
      removeErrClassByDataValidate('sender.mobile')
      return
    }
    onInputTelephone(phone)
    onInputExtension('')
    removeErrClassByDataValidate('sender.telephone')
    console.log('获取的通讯录数据', phone)
  }
  return {
    selectContact,
  }
}
