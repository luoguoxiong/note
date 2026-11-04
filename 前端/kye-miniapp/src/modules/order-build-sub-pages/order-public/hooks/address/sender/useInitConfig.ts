import { computed } from 'vue'
// 方法
import useCommon from '@order-public-sub-public/hooks/address/useCommon'
import useFormat from '@order-public-sub-public/hooks/address/sender/useFormat'
// 类型
import { FieldsConfig } from '@order-public-sub-public/types'
import { Address, ModuleType } from '@order-public-sub-public/constants'
import { configAddressProps, isInitAddressFlag } from '@order-public-sub-public/hooks/useGlobalVariable'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

/**
 * 初始化配置属性
 * @param props
 * @returns
 */
// eslint-disable-next-line
const useInitConfig = ({ moduleStyle }: { moduleStyle?: string }) => {
  // 配置数据
  const props: any = computed(() => {
    if (isInitAddressFlag.value) {
      return configAddressProps(ModuleType['寄方信息'])
    }
    return piniaStore.schema.moduleConfigData(ModuleType['寄方信息'], true) || {}
  })

  // 格式化
  const format = useFormat()

  // getConfig 转换配置
  const { getConfig } = useCommon()

  // 是否是字段维护
  const fieldsConfigType = computed(() => props.value?.config?.['fieldsConfigType'] === 'fields')

  // 是否存在指定地址，如果存在则展示指定地址场景
  const addressEdit = computed(() => {
    const { total = 0 } = getConfig(props.value?.config, 'address') || {}
    return total > 0
  })

  // 是否显示
  const visible = computed(() => props.value.visible)

  // 模块类型
  const moduleStyleType = computed(() => props.value.moduleStyle || '')

  // 配置数据
  const config = computed(() => props.value.config || {})

  // 字段维护类型
  const addressVisibleType = computed(() => props.value?.config?.['addressVisibleType'])

  const getMobile = (): FieldsConfig => {
    try {
      const returnRequiredInfo = piniaStore.globalData.returnRequiredInfosInfo('senderExtraInfo', 'mobile') || {}
      const mobileConfig = getConfig(props.value?.config, 'mobile')

      if (returnRequiredInfo?.key === 'mobile' && returnRequiredInfo?.required === true) {
        mobileConfig.required = true
      } else if (returnRequiredInfo?.key === 'mobile' && returnRequiredInfo?.required === false) {
        mobileConfig.required = false
      }
      return mobileConfig
    } catch (e) {
      console.log(e)
      return getConfig(props.value?.config, 'mobile')
    }
  }

  // 需要传入组件
  const addressProps = computed(() => {
    let companyNameEditable = true // 公司名称是否可编辑需要从下单配置ERP或者客户后天ERP取值判断
    if (
      !piniaStore.globalData.dynamicConfig('sendInfoVo')?.modifyShipperFlag ||
      (props.value?.config?.fieldsConfig && !getConfig(props.value?.config, 'companyName').editable)
    ) {
      companyNameEditable = false
    } else {
      companyNameEditable = true
    }
    // 未选或未填写静默文案
    const headerPlaceholder = computed(() => {
      let actionText = `<span style="color: #8365F6">点击</span><span>此处填写，请输入真实姓名</span>`

      if (addressEdit.value) {
        if (!fieldsConfigType.value) {
          actionText = `<span style="color: #8365F6">点击</span><span>此处选择</span>`
        }
      }
      return actionText
    })
    const returnEditDisableInfo = piniaStore.globalData.returnEditDisableInfo('senderExtraInfo', 'address') || {}
    const addressVisible =
      props.value?.config?.functionConfig['addressVisible'] && fieldsConfigType.value && !returnEditDisableInfo?.key
    const addressOcrVisible =
      props.value?.config?.functionConfig['addressOcrVisible'] && fieldsConfigType.value && !returnEditDisableInfo?.key
    const recentPickupVisible =
      props.value?.config?.functionConfig['recentPickupVisible'] &&
      fieldsConfigType.value &&
      !returnEditDisableInfo?.key

    return {
      source: moduleStyle,
      headerPlaceholder: headerPlaceholder.value,
      required: moduleStyle === Address.SENDER ? props.value.required : false,
      disabled: props.value.disabled,
      personConfig: {
        ...getConfig(props.value.config, 'person'),
        dataValidate: 'sender.person',
        format: format.formatPerson,
        maxlength: 20,
      },
      mobileConfig: {
        ...getMobile(),
        dataValidate: 'sender.mobile',
        format: format.formatMobile,
        maxlength: 13,
      },
      telephoneConfig: {
        ...getConfig(props.value?.config, 'telephone'),
        dataValidate: 'sender.telephone',
      },
      companyNameConfig: {
        ...getConfig(props.value?.config, 'companyName'),
        // 公司简称是否可编辑，需要从下单配置ERP和客户后台ERP取值
        editable: companyNameEditable,
        dataValidate: 'sender.companyName',
        format: format.formatCompanyName,
        maxlength: 32,
      },
      extensionConfig: {
        format: format.formatExtension,
        maxlength: 8,
      },
      addressConfig: {
        ...getConfig(props.value?.config, 'address'),
        dataValidate: 'sender.address',
        detailAddressDataValidate: 'sender.detailAddress',
        specifyAddressDataValidate: 'sender.specifyAddress',
      },
      addressEdit: addressEdit.value,
      fieldsConfigType: fieldsConfigType.value,
      recentPickupVisible, // 是否显示最近寄件地址
      addressOcrVisible, // 是否显示智能识别
      addressVisible, // 是否显示地址簿
      addressDetailLocation: props.value?.config?.functionConfig['addressDetailLocation'], // 详情地址是否显示定位按钮
      saveAddress: props.value?.config?.functionConfig['saveAddress'] && fieldsConfigType.value, // 是否显示保存到地址簿
      recommendByUserLocation: props.value?.config['recommendByUserLocation'], // 指定地址场景是否显示按就近地址按钮
      disabledAddressItem: returnEditDisableInfo,
    }
  })

  return { addressProps, addressVisibleType, visible, moduleStyleType, config, props }
}
export default useInitConfig
