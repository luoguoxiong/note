import { computed } from 'vue'
// 方法
import useCommon from '@order-public-sub-public/hooks/address/useCommon'
import useFormat from '@order-public-sub-public/hooks/address/receive/useFormat'
// 类型
import { Module } from '@order-public-sub-public/types'
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
      return configAddressProps(ModuleType['收方信息'])
    }
    return piniaStore.schema.moduleConfigData(ModuleType['收方信息'], true) || {}
  })

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
  const addressVisibleType = computed(() => props.value.config?.['addressVisibleType'])

  // 未选或未填写静默文案
  const headerPlaceholder = computed(() => {
    let actionText = `<span style="color: #8365F6">点击</span><span>此处填写，支持智能填写、图片识别</span>`

    if (addressEdit.value) {
      if (!fieldsConfigType.value) {
        actionText = `<span style="color: #8365F6">点击</span><span>此处选择</span>`
      }
    }

    return actionText
  })

  // 需要传入组件
  const addressProps = computed(() => {
    return {
      iconColor: '#B236F5',
      iconText: '收',
      title: '收件人信息',
      headerPlaceholder: headerPlaceholder.value,
      required: moduleStyle === Address.RECEIVE ? props.value.required : false,
      moduleStyle: props.value.moduleStyle,
      source: moduleStyle, // 来源
      personConfig: {
        ...getConfig(props.value.config, 'person'),
        dataValidate: 'receive.person',
        format: useFormat().formatPerson,
        maxlength: 40,
      },
      mobileConfig: {
        ...getConfig(props.value.config, 'mobile'),
        dataValidate: 'receive.mobile',
        format: useFormat().formatMobile,
        maxlength: 18,
      },
      telephoneConfig: {
        ...getConfig(props.value.config, 'telephone'),
        dataValidate: 'receive.telephone',
      },
      companyNameConfig: {
        ...getConfig(props.value.config, 'companyName'),
        dataValidate: 'receive.companyName',
        format: useFormat().formatCompanyName,
        maxlength: 32,
      },
      extensionConfig: {
        format: useFormat().formatExtension,
        maxlength: 8,
      },
      addressConfig: {
        ...getConfig(props.value.config, 'address'),
        dataValidate: 'receive.address',
        detailAddressDataValidate: 'receive.detailAddress',
        specifyAddressDataValidate: 'receive.specifyAddress',
      },
      addressEdit: addressEdit.value, // 地址是否可以编辑
      fieldsConfigType: fieldsConfigType.value, // 是否是分字段维护
      recentPickupVisible: props.value.config.functionConfig['recentPickupVisible'] && fieldsConfigType.value, // 是否显示最近寄/收地址
      addressOcrVisible: props.value.config.functionConfig['addressOcrVisible'] && fieldsConfigType.value, // 是否显示智能识别
      addressVisible: props.value.config.functionConfig['addressVisible'] && fieldsConfigType.value, // 是否显示地址簿
      addressDetailLocation: props.value.config.functionConfig['addressDetailLocation'], // 是否展示定位
      saveAddress: props.value.config.functionConfig['saveAddress'] && fieldsConfigType.value, // 是否显示保存到地址簿
      recommendByUserLocation: props.value.config['recommendByUserLocation'], // 指定地址弹窗是否显示按最近距离排序
    }
  })

  return { addressProps, addressVisibleType, visible, moduleStyleType, config }
}

export default useInitConfig
