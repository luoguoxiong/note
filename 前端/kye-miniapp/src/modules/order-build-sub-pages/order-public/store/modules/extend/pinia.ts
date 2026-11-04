import { defineStore } from 'pinia'
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { AddressBook, SenderPage } from '@order-public-sub-public/apis/address/types'
// import { kaCustomerMapItem } from '@order-public-sub-public/types'
import { useOrderRootStore } from '../../pinia'
import { effectByPageType, ExtendCommonState, ExtendOrderCustomer, HotZoneStore } from '../../types'
import { kaCustomerMapItem } from '@order-public-sub-public/types'

export const useExtendStore = defineStore('extend', {
  state: () => ({
    [OrderPageType.单票]: {
      waybillNumberVisiable: false,
      isShowBindCode: false,
      isShowNoticeBar: false,
      contactBusinessVsisable: false,
      kaCustomerMapStatus: false,
      // 寄方
      sender: {
        // 是否可以编辑
        visible: false,
        // 填单页
        page: {
          person: '',
          mobile: '',
          telephone: '',
          extension: '',
          companyName: '',
          province: '',
          city: '',
          county: '',
          detailAddress: '',
          locationName: '',
          saveAddressFlag: false,
          selectSpecifyAddressId: '',
          locationId: '',
          exhibition: {
            exhibitionCode: '',
            exhibitionNumber: '',
          },
        },
        // 定位
        mapPosition: {
          province: '',
          city: '',
          county: '',
          area: [],
          detailAddress: '',
          isSelectItem: false,
        },
        // 地址簿
        addressBook: {
          justAddedFlagId: '', // 刚刚新增标识
          id: '',
          person: '',
          mobile: '',
          telephone: '',
          extension: '',
          companyName: '',
          province: '',
          city: '',
          county: '',
          area: [],
          detailAddress: '',
          addressType: '',
          isSelectItem: false,
        },
        addressBookMapPosition: {
          province: '',
          city: '',
          county: '',
          area: [],
          detailAddress: '',
          isSelectItem: false,
        },
      },
      // 收方
      receive: {
        // 是否可以编辑
        visible: false,
        // 填单页
        page: {
          person: '',
          mobile: '',
          telephone: '',
          extension: '',
          companyName: '',
          province: '',
          city: '',
          county: '',
          detailAddress: '',
          locationName: '',
          locationId: '',
          saveAddressFlag: false,
          aiAddressRecommend: false,
        },
        // 定位
        mapPosition: {
          province: '',
          city: '',
          county: '',
          area: [],
          detailAddress: '',
          isSelectItem: false,
        },
        // 地址簿
        addressBook: {
          justAddedFlagId: '', // 刚刚新增标识
          id: '',
          person: '',
          mobile: '',
          telephone: '',
          extension: '',
          companyName: '',
          province: '',
          city: '',
          county: '',
          area: [],
          detailAddress: '',
          addressType: '',
          isSelectItem: false,
        },
        addressBookMapPosition: {
          province: '',
          city: '',
          county: '',
          area: [],
          detailAddress: '',
          isSelectItem: false,
        },
        receipterMapPosition: {
          province: '',
          city: '',
          county: '',
          area: [],
          detailAddress: '',
          isSelectItem: false,
        },
      },
      // 遮罩层
      hotZoneStore: {
        [ModuleType['寄方信息']]: false,
        [ModuleType['收方信息']]: false,
        [ModuleType['货好时间']]: false,
        [ModuleType['付款方式']]: false,
        [ModuleType['超区派送']]: false,
        [ModuleType['货物信息']]: false,
        [ModuleType['服务方式']]: false,
        [ModuleType['物品保价']]: false,
      },
      kaCustomerMap: [],
      orderCustomer: {
        needBindCustomerCode: false, // 是否需要显示绑码弹窗
        bindCustomerCodeBar: false, // 是否需要显示绑码提示条
        bindCustomerCodeFlag: true, // 下单公司是否显示
      },
      effectByPage: [],
      batchIdsMap: {},
    },
    [OrderPageType.预览]: {} as ExtendCommonState,
    [OrderPageType.批量寄单票]: {} as ExtendCommonState,
    [OrderPageType.批量寄]: {} as ExtendCommonState,
    [OrderPageType.返程单]: {} as ExtendCommonState,
  }),

  actions: {
    setExtendData(payload: { data: ExtendCommonState; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType] = { ...this[orderPageType], ...data }
    },

    updateOrderCustomer(payload: { orderCustomer: Partial<ExtendOrderCustomer>; orderPageType?: OrderPageType }) {
      const { orderCustomer } = payload

      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      console.log('updateOrderCustomer', payload, orderPageType, this[orderPageType].orderCustomer)

      for (const key in orderCustomer) {
        if (!this[orderPageType]?.orderCustomer || typeof this[orderPageType].orderCustomer === 'string') {
          Reflect.set(this, 'orderCustomer', {})
        }
        const target = this[orderPageType].orderCustomer
        if (target && typeof target === 'object' && target !== null) {
          Reflect.set(target, key, Reflect.get(orderCustomer, key))
        }
      }
    },

    updateShowbillType(payload: { value: boolean; orderPageType?: OrderPageType }) {
      const { value } = payload

      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].waybillNumberVisiable = value
    },

    updateIsShowBind(payload: { value: boolean; orderPageType?: OrderPageType }) {
      const { value } = payload

      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].isShowBindCode = value
    },

    updateIsShowNoticeBar(payload: { value: boolean; orderPageType?: OrderPageType }) {
      const { value } = payload

      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].isShowNoticeBar = value
    },

    updateContactVisiable(payload: { value: boolean; orderPageType?: OrderPageType }) {
      const { value } = payload

      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].contactBusinessVsisable = value
    },

    updateSenderAddressBook(payload: { data: AddressBook; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].sender.addressBook = data
    },

    updateSenderAddressBookJustAddedFlag(payload: { data: string; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].sender.addressBook.justAddedFlagId = data
    },
    /**
     * @description 寄方填单页
     * @param context
     * @param payload
     */
    updateSenderPage(payload: { data: SenderPage; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].sender.page = data
    },
    /**
     * @description 寄方选中指定地址的Id
     * @param context
     * @param payload
     */
    updateSenderSpecifyAddressId(payload: { data: string; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].sender.page.selectSpecifyAddressId = data
    },
    /**
     * @description 寄方是否保存到地址簿
     * @param context
     * @param payload
     */
    updateSenderPageSaveAddressFlag(payload: { data: boolean; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].sender.page.saveAddressFlag = data
    },
    /**
     * @description 寄方定位
     * @param context
     * @param payload
     */
    updateSenderMapPosition(payload: { data: AddressBook; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].sender.mapPosition = data
    },
    /**
     * @description 寄方地址簿定位
     * @param context
     * @param payload
     */
    updateSenderAddressBookMapPosition(payload: { data: AddressBook; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].sender.addressBookMapPosition = data
    },
    /**
     * @description 寄方是否可以编辑
     * @param context
     * @param payload
     */
    updateSenderVisible(payload: { data: boolean; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].sender.visible = data
    },
    /**
     * @description 寄方地址簿刚刚新增
     * @param context
     * @param payload
     */
    updateReceiveAddressBookJustAddedFlag(payload: { data: string; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].receive.addressBook.justAddedFlagId = data
    },
    /**
     * @description 收方地址簿
     * @param context
     * @param payload
     */
    updateReceiveAddressBook(payload: { data: AddressBook; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].receive.addressBook = data
    },
    /**
     * @description 收方是否保存到地址簿
     * @param context
     * @param payload
     */
    updateReceivePageSaveAddressFlag(payload: { data: boolean; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].receive.page.saveAddressFlag = data
    },
    /**
     * @description 收方填单页
     * @param context
     * @param payload
     */
    updateReceivePage(payload: { data: SenderPage; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].receive.page = data
    },
    /**
     * @description 收方定位
     * @param context
     * @param payload
     */
    updateReceiveMapPosition(payload: { data: AddressBook; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].receive.mapPosition = data
    },
    /**
     * @description 收方地址簿定位
     * @param context
     * @param payload
     */
    updateReceiveAddressBookMapPosition(payload: { data: AddressBook; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].receive.addressBookMapPosition = data
    },
    /**
     * @description 回单原件返单信息
     * @param context
     * @param payload
     */
    updateReceipterMapPosition(payload: { data: AddressBook; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].receive.receipterMapPosition = data
    },
    /**
     * @description 收方地址是否选择或者关闭
     * @param context
     * @param payload
     */
    updateReceiveAiAddressRecommend(payload: { data: boolean; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].receive.page.aiAddressRecommend = data
    },
    /**
     * @description 收是否可以编辑
     * @param context
     * @param payload
     */
    updateReceiveVisible(payload: { data: boolean; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].receive.visible = data
    },
    /**
     * @description 更新热区
     */
    updateHotZoneStore(payload: { data: HotZoneStore; orderPageType: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].hotZoneStore = { ...this[orderPageType].hotZoneStore, ...data }
    },
    /**
     * @description 更新自定义编码
     * @param context
     * @param payload
     */
    updateKaCustomerMap(payload: { data: []; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].kaCustomerMap = data
    },
    /**
     * @description 更新单个自定义编码
     * @param context
     * @param payload
     */
    updateKaCustomerById(payload: { data: Partial<kaCustomerMapItem>; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      for (let index = 0; index < this[orderPageType].kaCustomerMap.length; index++) {
        const curInfo = this[orderPageType].kaCustomerMap[index]
        if (curInfo.kyField === data.kyField) {
          curInfo.customerFieldValue = data.customerFieldValue || ''
        }
      }
    },
    /**
     * @description 更新单个自定义编码
     * @param context
     * @param payload
     */
    updateKaCustomerMapById(payload: { data: Partial<kaCustomerMapItem>; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      for (let index = 0; index < this[orderPageType].kaCustomerMap.length; index++) {
        const curInfo = this[orderPageType].kaCustomerMap[index]
        if (curInfo.kyField === data.kyField) {
          curInfo.customerFieldValue = data.customerFieldValue || ''
        }
      }
    },
    updateKaStatus(payload: { data: boolean; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].kaCustomerMapStatus = data
    },
    updateEffectPage(payload: { data: effectByPageType; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].effectByPage.push(data)
    },
    setEffectPage(payload: { data: effectByPageType[]; orderPageType?: OrderPageType }) {
      const { data } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].effectByPage = data
    },
    setBatchId(payload: { batchId: string; orderPageType?: OrderPageType }) {
      const { batchId } = payload
      const rootStore = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootStore.getOrderPageType
      this[orderPageType].batchIdsMap = { ...this[orderPageType].batchIdsMap, batchId: batchId }
    },
  },

  getters: {
    effectByPage: (state) => (orderPageType) => {
      const rootState = useOrderRootStore()
      return state[orderPageType || rootState.getOrderPageType].effectByPage
    },

    senderSaveAddressFlag: (state) => (orderPageType) => {
      const rootState = useOrderRootStore()
      return state[orderPageType || rootState.getOrderPageType].sender?.page.saveAddressFlag
    },

    receiveSaveAddressFlag: (state) => (orderPageType) => {
      const rootState = useOrderRootStore()
      return state[orderPageType || rootState.getOrderPageType].receive?.page.saveAddressFlag
    },

    saveAddressFlag: (state) => (orderPageType) => {
      const rootState = useOrderRootStore()
      const senderFlag = state[orderPageType || rootState.getOrderPageType].sender?.page.saveAddressFlag
      const receiveFlag = state[orderPageType || rootState.getOrderPageType].receive?.page.saveAddressFlag
      if (senderFlag && receiveFlag) {
        return '同时保存寄收人信息'
      } else if (senderFlag) {
        return '保存寄件人信息'
      } else if (receiveFlag) {
        return '保存收件人信息'
      } else {
        return '不保存'
      }
    },

    customList: (state) => (orderPageType) => {
      const rootState = useOrderRootStore()
      return state[orderPageType || rootState.getOrderPageType].kaCustomerMap
    },

    senderMapPosition: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].sender?.mapPosition
    },

    receiveMapPosition: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].receive?.mapPosition
    },
    receipterMapPosition: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].receive?.receipterMapPosition
    },

    senderAddressBook: (state) => (orderPageType?) => {
      const rootState = useOrderRootStore()
      return state[orderPageType || rootState.getOrderPageType].sender?.addressBook
    },
    receiveAddressBook: (state) => (orderPageType?) => {
      const rootState = useOrderRootStore()
      return state[orderPageType || rootState.getOrderPageType].receive?.addressBook
    },
    hotZoneStore: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].hotZoneStore
    },
    kaCustomerMapStatus: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].kaCustomerMapStatus
    },
    kaCustomerMap: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].kaCustomerMap
    },
    batchIdsMap: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].batchIdsMap
    },
    senderAddressBookMapPosition: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].sender.addressBookMapPosition
    },
    receiveAddressBookMapPosition: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].receive.addressBookMapPosition
    },
    orderCustomer: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].orderCustomer
    },
    isShowBindCode: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].isShowBindCode
    },
    getExtendData: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType]
    },
    getExtendBatchIDsData: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].batchIdsMap
    },
  },
})
