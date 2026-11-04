import { filterAllSpace } from '@order-public-sub-public/utils'
import { lessTwoCharacters, mobileRule, symbolNumber, telephoneRule } from '@order-public-sub-public/utils/pattern'
import { useMobile, useTelephone, usePerson } from '@order-public-sub-public/hooks/address/receive/useFields'
import { ComputedRef } from 'vue'
import useValidate from '@order-public-sub-public/hooks/address/receive/useValidate'
import { closeTippy, removeErrClassByDataValidate } from '@order-public-sub-public/validate/effect/effectBubble'
import { getData } from '@order-public-sub-public/hooks/address/receive/useUpdateData'
import Taro from '@tarojs/taro'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import getCityTelephoneCodes from '@order-public-sub-public/utils/cityTelephoneCodes'
import { areaCodeMatch } from '@order-public-sub-public/utils'
const { checkValidate } = useValidate()

const chooseContact = (): Promise<{
  phoneNumber: string
  displayName: string
}> => {
  return new Promise((resolve, reject) => {
    Taro.chooseContact({
      success: (res) => {
        resolve(res)
        console.log('通讯录获取成功', res)
      },
      fail: (err) => {
        console.log('通讯录获取失败', err)
        if (err?.errMsg?.indexOf('permission') > -1) {
          setTimeout(() => {
            showToast('打开通讯录失败，请检查权限')
          }, 200)
        }
        reject(err)
      },
      complete: (res) => {
        console.log('通讯录获取完成', res)
      },
    })
  })
}

export const getContactData = async () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_mobilebook_v1',
    },
    {
      button_name: '通讯录',
    },
  )
  const { phoneNumber, displayName } = await chooseContact()
  let phone = phoneNumber
  phone = phone?.split(',')[0]
  if (!phone) {
    return {}
  }
  const person = lessTwoCharacters.test(displayName) && symbolNumber.test(displayName) ? displayName : ''
  phone = filterAllSpace(phone)?.replace('(', '')?.replace(')', '')
  const isMobile = mobileRule.test(phone)
  if (!isMobile && !telephoneRule.test(phone)) {
    phone = ''
  }
  // 固定电话无 - 时，参考寄收地址逻辑：命中区号库后格式化为带 - 的形式，如 075528689956 -> 0755-28689956
  if (
    !isMobile &&
    phone &&
    !phone.includes('-') &&
    (phone.startsWith('0') || phone.startsWith('400') || phone.startsWith('800'))
  ) {
    const code = getCityTelephoneCodes()
    // 区号库未加载完成时跳过区号匹配，保持原值，避免空区号匹配产生 '-' 前缀脏数据
    if (code) {
      phone = areaCodeMatch(phone, code)
    }
  }
  return {
    phone,
    isMobile,
    person,
  }
}

export const useSelectContact = ({ moduleStyle }: { moduleStyle: string }, clearStatus?: ComputedRef<boolean>) => {
  const selectContact = async () => {
    const { onInputMobile } = useMobile({ moduleStyle, clearStatus })
    const { onInputTelephone, onInputExtension } = useTelephone({ moduleStyle })
    const { onInputPerson } = usePerson({ moduleStyle })
    const { isMobile, phone, person } = await getContactData()
    closeTippy()
    if (person) {
      onInputPerson(person)
      removeErrClassByDataValidate('receive.person')
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
      removeErrClassByDataValidate('receive.mobile')
      return
    }
    onInputTelephone(phone)
    onInputExtension('')
    removeErrClassByDataValidate('receive.telephone')
  }
  return {
    selectContact,
  }
}
