import { ref } from 'vue'
import router from '@order-public-sub-public/router'
import { InitPageName, ModuleType } from '@order-public-sub-public/constants'
import { getQueryObject, isEmptyText } from '@order-public-sub-public/utils'
import { getCurrentPageName } from '@order-public-sub-public/validate/utils'
import Taro from '@tarojs/taro'
import { useRoute } from '@order-public-sub-public/vue-router/index'

/**
 * @description: 地址薄单独打开时 没有获取静态配置，此处做兜底数据
 * @return {*}
 */
export const configAddressProps = (type: ModuleType) => {
  return {
    moduleStyle: 'page',
    config: {
      container: 'page',
      fieldsConfigType: 'fields',
      addressVisibleType: 'name',
      functionConfig: {
        addressVisible: true,
        addressOcrVisible: true,
        saveAddress: true,
        addressDetailLocation: true,
        recentPickupVisible: true,
      },
      exhibitionVisible: true,
      recommendByUserLocation: true,
      fieldsConfig: [
        {
          name: 'person',
          visible: true,
          required: true,
          editable: true,
          total: '',
        },
        {
          name: 'mobile',
          visible: true,
          required: true,
          editable: true,
          total: '',
        },
        {
          name: 'telephone',
          visible: true,
          required: false,
          editable: true,
          total: '',
        },
        {
          name: 'companyName',
          visible: true,
          required: false,
          editable: true,
          total: '',
        },
        {
          name: 'address',
          visible: true,
          required: true,
          editable: true,
          total: false,
        },
      ],
    },
    required: true,
    visible: true,
    type: type,
  }
}

/**
 * @description: 初始化地址簿标识
 * @return {*}
 */
export const isInitAddressFlag = ref(false)
/**
 * @description: 网点查询-进入地址簿标识
 * @return {*}
 */
export const isNetworkQueryAddress = ref(false)

export const addressGlobalVariable = () => {
  const { pageFromNative } = getQueryObject()
  const pageName = getCurrentPageName()
  const currentRoute = router.currentRoute.value
  isInitAddressFlag.value = !isEmptyText(pageFromNative) && pageName === InitPageName.地址簿
  // 网点查询入口标识
  isNetworkQueryAddress.value = currentRoute.query?.pageFrom === InitPageName.网点查询
}

/**
 * 公共跳转地址薄标识
 * @returns
 */
export const selectAddressBookJumpFlag = () => {
  const route = useRoute()
  return route.query?.pageFrom === 'selectAddress'
}

/**
 * 选择地址簿数据
 */
export const setSelectAddressBookJumpData = (data: any) => {
  if (selectAddressBookJumpFlag()) {
    Taro.getApp().selectAddressBookJumpData = data
  }
}
