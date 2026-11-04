import { getValueOrEmpty, joinAt } from '@order-public-sub-public/utils'
import { computed, ref, h } from 'vue'

import { filterAllSpace } from '@order-public-sub-public/utils/index'

import { AddressConfig } from '@order-public-sub-public/types'
import { Address, AddressType, AddressValue, ResolutionOcr } from '@order-public-sub-public/constants/address'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { batchSaveAddress, getAddressBookList, putAddressSaveFlag } from '@order-public-sub-public/apis/address'
import { MatchType, ModuleType } from '@order-public-sub-public/constants'
import { AiAddrAnalysis, PagedQueryAddressRow } from '@order-public-sub-public/apis/address/types'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { useUpdateData as receiveUpdateData } from '@order-public-sub-public/hooks/address/receive/useUpdateData'
import { useUpdateData as senderUpdateData } from '@order-public-sub-public/hooks/address/sender/useUpdateData'
import { getUserSettingInfoByKey } from '@order-public-sub-root-pages/order-single/hooks/useInit'
import { ReportType, ReportTypeEnum } from '@order-public-sub-public/reportUmp/type/types'
import { AddressScene } from '@order-public-sub-public/components/business/address-book/types'
import { useStore } from '@order-public-sub-public/store'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

const piniaStore = useStore()
// import { getChannel } from '@order-public-sub-public/configs'

/**
 * 获取配置数据转换成子组件需要的数据渲染
 * @param config 配置数据
 * @param type 类型
 * @returns object
 */
const getConfig = (config: AddressConfig, type: string) => {
  const { fieldsConfig } = config || {}

  if (!fieldsConfig) {
    // throw new Error('fieldsConfig undefined')
  }

  const field = fieldsConfig?.find((field: Record<string, any>) => field?.name === type)

  if (!field) {
    throw new Error(`Field with type '${type}' not found`)
  }

  return field || {}
}

// 详情地址切换弹窗
const detailAddressDialog = async (newVal: AddressValue, oldVal: AddressValue) => {
  let message = ''
  if (newVal.province !== oldVal?.province) {
    // 省不同
    message = `您选择的地址可能属于<text style="color: #8365f6">${newVal.province}${newVal?.city}</text>，是否需要切换到${newVal.province}？`
  } else if (newVal.city !== oldVal?.city) {
    // 市不同
    message = `您选择的地址可能属于<text style="color: #8365f6">${newVal.province}${newVal?.city}</text>，是否需要切换到${newVal.city}？`
  } else if (newVal.county !== oldVal?.county) {
    // 区县不同
    message = `您选择的地址可能属于<text style="color: #8365f6">${newVal.city}${newVal?.county}</text>，是否需要切换到${newVal.county}？`
  }

  if (message) {
    const showKyDialogParams = {
      message,
      title: '温馨提示',
      allowHtml: true,
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: '不切换',
      confirmButtonText: '切换',
      zIndex: 1000,
    }
    try {
      await showKyDialog(showKyDialogParams)
      return true
    } catch (error) {
      return false
    }
  }
}
const fullAddress = (v: AiAddrAnalysis, i?: number) => {
  return `地址${i || i === 0 ? i + 1 : ''}：${joinAt(v, [
    'telephone',
    'telPhone',
    'mobile',
    'mobilePhone',
    'name',
    'province',
    'city',
    'district',
    'address',
    'company',
  ])}`
}
const addressSelect = (data: AddressValue[] = [], recognitionType: string) => {
  // 智能识别弹框埋点
  const clickReport = (type: ReportTypeEnum, eventCode: string, data: AiAddrAnalysis[]) => {
    umpOtherReport(
      type,
      {
        eventCode,
        regionCode: 'sender_box',
      },
      {
        recognition_type: recognitionType,
        recognition_msg: data.map((v, i) => fullAddress(v, i)).join(','),
      },
    )
  }
  const promise: Promise<AiAddrAnalysis> = new Promise<AiAddrAnalysis>((resolve) => {
    // 先调用一次allowHtml为false,主要解决dialog，h函数传入message，偶现不渲染
    showKyDialog({
      zIndex: 1000,
      allowHtml: false,
    }).catch((e) => {
      console.error(e)
    })
    setTimeout(() => {
      clickReport(ReportType.曝光, 'exp_express_single_fill_Multiple_open_button_v1', data)
      showKyDialog({
        zIndex: 1000,
        title: '温馨提示',
        showConfirmButton: false,
        showCancelButton: false,
        allowHtml: true,
        className: 'ky-address-multiple-dialog',
        closeable: true,
        extraDataValue: {
          list: data,
          recognitionType,
          onSelectAddress: async (value: AiAddrAnalysis) => {
            try {
              resolve(value)
            } catch (e) {
              console.warn(e)
            }
          },
        },
        beforeClose: () => {
          const index = data.findIndex((x) => x?.source === ResolutionOcr.AI地址推荐)
          let value = {}
          if (index > -1) {
            value = data[index]
          } else {
            value = data[0]
          }
          resolve(value)
          clickReport(ReportType.点击, 'clk_express_single_fill_Multiple_off_v1', [value])
          return true
        },
      }).catch((e) => {
        console.warn('addressSelect', e)
      })
    })
  })
  return promise
}

// 姓名手机号联想
const getPagePreciseQuery = async ({
  contact = '',
  contactPhone = '',
  addressType = '',
}: {
  contact?: string
  contactPhone?: string
  addressType: string
}) => {
  try {
    const params = {
      page: 1,
      pageSize: 20,
      keyword: contact.trim() || filterAllSpace(contactPhone),
      addressType,
      contact: contact.trim(),
      contactPhone: filterAllSpace(contactPhone),
      queryScene: AddressScene.移动端,
    }
    const { data } = await getAddressBookList(params)
    return (data?.rows || []).map((item: PagedQueryAddressRow) => ({
      id: item.id,
      person: getValueOrEmpty(item.person),
      mobile: getValueOrEmpty(item.mobile),
      companyName: getValueOrEmpty(item.companyName),
      telephone: getValueOrEmpty(item.telephone),
      extension: getValueOrEmpty(item.extension),
      province: getValueOrEmpty(item.province),
      city: getValueOrEmpty(item.city),
      county: getValueOrEmpty(item.county),
      detailAddress: getValueOrEmpty(item.detailAddress),
      fullAddress: `${getValueOrEmpty(item.province)}${getValueOrEmpty(item.city)}${getValueOrEmpty(
        item.county,
      )}${getValueOrEmpty(item.detailAddress)}`,
    }))
  } catch (error) {
    console.log('error', error)
    return []
  }
}

const useCommon = () => {
  return {
    getConfig,
    detailAddressDialog,
    addressSelect,
    getPagePreciseQuery,
  }
}

export default useCommon

/**
 * 是否保存到地址地址簿radio
 * @param addressType addressType: '10'；'20' 收方
 * @returns
 */
export const useSaveAddress = (addressType: string) => {
  const saveAddressFlag = ref(false)

  const updateStore = (flag: boolean) => {
    // 寄方
    if (addressType === Address.SENDER_ADDRESS_TYPE) {
      piniaStore.extend.updateSenderPageSaveAddressFlag({ data: flag })
    } else {
      piniaStore.extend.updateReceivePageSaveAddressFlag({ data: flag })
    }
  }

  // 获取
  const getSaveAddressValue = async () => {
    try {
      const data = await getUserSettingInfoByKey(
        addressType === Address.SENDER_ADDRESS_TYPE ? 'senderSelectFlag' : 'receiveSelectFlag',
      )
      // const { data } = await getAddressSaveFlag({ addressType: Number(addressType) })
      saveAddressFlag.value = data as boolean
      updateStore(saveAddressFlag.value)
    } catch (error) {
      console.log('error===>', error)
    }
  }

  // 保存
  const saveAddressValue = async ({ enable }: { enable: boolean }) => {
    try {
      const params = {
        addressType: Number(addressType),
        enable,
      }
      const { data } = await putAddressSaveFlag(params)
      saveAddressFlag.value = data
      updateStore(saveAddressFlag.value)
    } catch (error) {
      console.log('error', error)
    }
  }

  return { saveAddressFlag, getSaveAddressValue, saveAddressValue }
}

/**
 * 新增地址簿
 * @param addressType 类型 10 寄方；20 收方
 * @param params 入参
 * @param toast 是否需要toast提示
 * @returns
 */
export const addressBookAdd = async ({
  addressType,
  params,
  toast = false,
  isFirst = false,
}: {
  addressType: string
  params: AddressValue
  toast?: boolean
  isFirst?: boolean
}) => {
  try {
    const obj = {
      addressType,
      addressList: [
        {
          person: getValueOrEmpty(params.person),
          mobile: filterAllSpace(getValueOrEmpty(params.mobile)),
          telephone: filterAllSpace(getValueOrEmpty(params.telephone)),
          extension: getValueOrEmpty(params.extension),
          companyName: getValueOrEmpty(params.companyName),
          province: getValueOrEmpty(params.province),
          city: getValueOrEmpty(params.city),
          county: getValueOrEmpty(params.county),
          detailAddress: getValueOrEmpty(params.detailAddress),
          labelCode: params.addressLabelCode || undefined,
          onlyMdRepeatValue: params.onlyMdRepeatValue,
          defaultFlag: params.defaultFlag,
        },
      ],
    }
    const { data } = await batchSaveAddress(obj)
    if (toast && !(data?.[0]?.onlyMdRepeatFlag && isFirst)) {
      showToast('新增成功')
    }
    return data?.[0] || { id: '' }
  } catch (error: any) {
    if (toast) {
      showToast(error?.msg || '新增失败，请稍后重试')
    }
    return { id: '' }
  }
}

/**
 * 判断完整的地址长度是否满足11位数
 * @param address string 完整地址
 * @returns boolean
 */
export const allAddressCheckLength = ({ address }: { address: string }) => {
  const strAddressLength = address?.length || 0
  if (strAddressLength < 11) {
    showToast('请输入准确的详细地址')
    return false
  } else {
    return true
  }
}

// 获取取派限制数据（创可贴）
export const useRestrict = ({ moduleStyle }: { moduleStyle: string }) => {
  const limitRemindBarData = computed(() => {
    let res = {
      show: false,
      showClose: false,
      limitReason: 0,
      customerPlainTips: '',
    }
    const {
      matchType = '',
      limitReason = 0,
      restrictedType = 0,
      senderAddressPlainBar = '',
      receiverAddressPlainBar = '',
    } = piniaStore.globalData.restrictData?.addressRestrict || {}

    const stairFeeTips = piniaStore.schema.moduleDimensionData(ModuleType['收方信息'])?.stairFeeTips || ''
    // 寄
    if (moduleStyle === Address.SENDER && matchType === MatchType['寄件']) {
      res = {
        limitReason,
        showClose: restrictedType === 20,
        show: Boolean(senderAddressPlainBar),
        customerPlainTips: senderAddressPlainBar,
      }
    }

    // 收
    const isMatchReceiveType = matchType && matchType !== MatchType['寄件']
    if (moduleStyle === Address.RECEIVE && (isMatchReceiveType || stairFeeTips)) {
      res = {
        limitReason,
        showClose: restrictedType === 20,
        show: Boolean(receiverAddressPlainBar),
        customerPlainTips: receiverAddressPlainBar,
      }
      if (!isMatchReceiveType) {
        res = {
          limitReason: -1,
          showClose: false,
          show: Boolean(stairFeeTips),
          customerPlainTips: stairFeeTips,
        }
      }
    }

    return res
  })

  return { limitRemindBarData }
}

// 切换寄收地址
export const switchAddress = () => {
  const sender = piniaStore.order.moduleFormData(ModuleType['寄方信息']) || {}
  const receive = piniaStore.order.moduleFormData(ModuleType['收方信息']) || {}

  const virtualPhoneOnly = /^1[3|4|5|6|7|8|9][0-9]\d{8}(-\d{1,4})+$/
  if (receive?.mobile && virtualPhoneOnly.test(receive.mobile)) {
    receive.mobile = receive.mobile.split('-')[0]
  }

  const { setEditValue: setSenderEditValue } = senderUpdateData({
    moduleStyle: Address.SENDER,
    needRemoteCheck: false,
  })
  const { setEditValue: setReceiveEditValue } = receiveUpdateData({
    moduleStyle: Address.RECEIVE,
    remoteCheckKey: 'sender.receive.change',
  })
  // setReceiveEditValue({ item: sender, needMerge: false }).finally(() => {
  //   setSenderEditValue({ item: receive, needMerge: false })
  // })

  setSenderEditValue({ item: receive, needMerge: false })
  setReceiveEditValue({ item: sender, needMerge: false })
}

// 点击x清除数据源
export const restrictDataClear = () => {
  const restrictData = piniaStore.globalData.restrictData
  piniaStore.globalData.setRestrictData({
    ...restrictData,
    addressRestrict: {} as any,
  })
}

export const sameAddressNotice = () => {
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      title: '温馨提示',
      message: '编辑失败，地址簿已存在相同地址（您可通过搜索查到此地址）',
      cancelButtonText: '使用该地址下单',
      showCancelButton: true,
      confirmButtonText: '我知道了',
    })
      .then(() => {
        reject(false)
      })
      .catch(() => {
        resolve(true)
      })
  })
}

/**
 * @description 根据addressType获取指定的更新数据函数、moduleStyle、remoteCheckKey
 */
export const useUpdateFunc = (addressType: AddressType) => {
  const func = {
    [AddressType.SENDER]: senderUpdateData,
    [AddressType.RECEIVE]: receiveUpdateData,
  }

  const moduleStyle = {
    [AddressType.SENDER]: Address.SENDER,
    [AddressType.RECEIVE]: Address.RECEIVE,
  }

  const remoteCheckKey = {
    [AddressType.SENDER]: 'sender.addressBook',
    [AddressType.RECEIVE]: 'receive.addressBook',
  }

  return {
    updateFunc: func[addressType],
    moduleStyle: moduleStyle[addressType],
    remoteCheckKey: remoteCheckKey[addressType],
  }
}

/**
 * 判断地址数据是否有任何省市区或详细地址值
 * @param item 地址数据
 * @returns boolean
 */
export const hasAddressValue = (item: AddressValue): boolean => {
  return Boolean(item?.province || item?.city || item?.county || item?.detailAddress)
}

/**
 * @description: 地址识别-原信息
 * @return {*}
 */
export const useOriginalAddress = ref('')

export const reportCloseDropdownMenu = (type: '寄件' | '收件') => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_association_close_v1',
    },
    {
      recognition_type: type,
    },
  )
}

// 禁止穿透滚动样式标识
export const orderCommonPageVhShow = ref(false)

// 关闭弹窗标识
export const updateCommonDisabledScroll = (flag = false) => {
  orderCommonPageVhShow.value = flag
}

// 获取不到位置默认使用总部位置兜底
export const getPositionDefault = () => {
  const defaultLng = 113.82982635498047
  const defaultLat = 22.62952423095703
  return { defaultLng, defaultLat }
}

/**
 * 返回false 遇到未知错误，可继续往下执行
 */
export const systemPermissionToast = (error, text = '') => {
  let flag = false
  if (error?.message) {
    showToast(error.message)
    return true
  }
  const errList = ['system permission denied', 'Photo Authorization']
  const msg = error?.errMsg || ''
  if ((msg && errList.some((item) => msg.includes(item))) || msg.indexOf('auth') > -1) {
    showToast(text || '请开启定位权限')
    return true
  }
  return flag
}
