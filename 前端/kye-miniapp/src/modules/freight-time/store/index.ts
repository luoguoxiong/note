import { defineStore } from 'pinia'
import {
  Delivery,
  PickUp,
  ProductInfo,
  GoodsTime,
  AddedService,
  GoodsTimeFlag,
  ServiceType,
  RestrictResult,
  OnlineCustomerInfo,
  GoodsSize,
} from '../types'
import { setSendAddress, setReceiveAddress } from '../components/sendAndReceive/hooks/useState'
import type { CouponItem } from '../types'
import { CustomerStatus, CouponReceiveSource } from '../constants'
import { getSendAddress, getReceiveAddress } from '@freight-time/components/sendAndReceive/hooks/useState'
import { getCurrentTimeOption } from '../utils'

interface FreightTimeState {
  sender: Delivery
  receive: PickUp
  productInfo: ProductInfo
  goodsTime: GoodsTime
  addedService: AddedService
  // 服务方式查询结果
  queryResult: ServiceType[]
  hasSearched: boolean
  queryLoading: boolean
  bindCustomerStatus: string
  restrictResult: RestrictResult | null
  onlineCustomerInfo: OnlineCustomerInfo | null
  // 优惠券
  sendCouponResult: Record<string, any>
  // 新客活动
  isNewCustomer: boolean
  resourceFlag: boolean
  couponList: CouponItem[]
  showSearchBtnBadge: boolean
  // 联系商务
  showContactPopup: boolean
  contactPhone: string
  // 管控数据
  checkResultList: any[]
  // 去寄件 loading
  goSendLoading: boolean
}

export const useFreightTimeStore = defineStore('freightTime', {
  state: (): FreightTimeState => ({
    sender: {
      city: '',
      county: '',
      detailAddress: '',
      province: '',
    },
    receive: {
      city: '',
      county: '',
      detailAddress: '',
      province: '',
    },
    productInfo: {
      goodsType: '',
      actualWeight: 0,
      volumeSize: 0,
      preWaybillGoodsSizeList: [
        {
          id: Math.floor(100000 + Math.random() * 900000),
          width: '',
          height: '',
          length: '',
          count: 1,
          singleWeight: '',
        },
      ],
    },
    goodsTime: {
      goodsTime: '',
      goodsTimeFlag: GoodsTimeFlag.NONE,
      selfSignFlag: false,
    },
    addedService: {
      woodenFrame: '',
    },
    // 服务方式查询结果
    queryResult: [],
    hasSearched: false,
    queryLoading: false,
    bindCustomerStatus: '',
    restrictResult: null,
    onlineCustomerInfo: null,
    // 优惠券
    sendCouponResult: {},
    // 新客活动
    isNewCustomer: false,
    resourceFlag: false,
    couponList: [],
    showSearchBtnBadge: true,
    // 联系商务
    showContactPopup: false,
    contactPhone: '',
    // 管控数据
    checkResultList: [],
    // 去寄件 loading
    goSendLoading: false,
  }),

  getters: {
    getSender: (state): Delivery => state.sender,
    getReceive: (state): PickUp => state.receive,
    getProductInfo: (state): ProductInfo => state.productInfo,
    getGoodsTime: (state): GoodsTime => state.goodsTime,
    getAddedService: (state): AddedService => state.addedService,
    getGoodsType: (state): string => state.productInfo.goodsType,
    getWoodenFrame: (state): string | undefined => state.addedService.woodenFrame,
    getActualWeight: (state): number => state.productInfo.actualWeight,
    getVolumeSize: (state): number => state.productInfo.volumeSize,
    // 服务方式查询
    getQueryResult: (state): ServiceType[] => state.queryResult,
    getHasSearched: (state): boolean => state.hasSearched,
    getQueryLoading: (state): boolean => state.queryLoading,
    getBindCustomerStatus: (state): string => state.bindCustomerStatus,
    getRestrictResult: (state): RestrictResult | null => state.restrictResult,
    getOnlineCustomerInfo: (state): OnlineCustomerInfo | null => state.onlineCustomerInfo,
    /** 是否有费用查看权限 */
    hasFeePermission: (state): boolean =>
      [String(CustomerStatus.APPROVED), String(CustomerStatus.SHIPPED)].includes(state.bindCustomerStatus),
    /** 优惠券结果 */
    getSendCouponResult: (state) => state.sendCouponResult,
    /** 新客活动 */
    getIsNewCustomer: (state): boolean => state.isNewCustomer,
    getResourceFlag: (state): boolean => state.resourceFlag,
    getCouponList: (state) => state.couponList,
    getShowSearchBtnBadge: (state): boolean => state.showSearchBtnBadge,
    /** 运费时效优惠券 (receiveSource=32) */
    serviceFeeCoupon: (state) =>
      state.couponList.find((item) => item.receiveSource === CouponReceiveSource.新客查询时效送券) || null,
    /** 留资优惠券 (receiveSource=31) */
    authCoupon: (state) =>
      state.couponList.find((item) => item.receiveSource === CouponReceiveSource.新客留资送券) || null,
    /** 联系商务弹窗 */
    getShowContactPopup: (state): boolean => state.showContactPopup,
    getContactPhone: (state): string => state.contactPhone,
    /** 管控数据 */
    getCheckResultList: (state) => state.checkResultList,
    /** 去寄件 loading */
    getGoSendLoading: (state) => state.goSendLoading,
    getOrderInfo: (state) => ({
      sender: getSendAddress().value,
      receive: getReceiveAddress().value,
      goodsTime: state.goodsTime,
      productInfo: state.productInfo,
      addedService: state.addedService,
    }),
  },

  actions: {
    setSender(data: Delivery) {
      this.sender = data
    },
    setReceive(data: PickUp) {
      this.receive = data
    },
    setProductInfo(data: ProductInfo) {
      this.productInfo = data
    },
    setGoodsTime(data: GoodsTime) {
      this.goodsTime = data
    },
    updateGoodsTimeType(selfSignFlag: boolean) {
      this.goodsTime = {
        ...this.goodsTime,
        selfSignFlag: selfSignFlag,
      }
    },
    setAddedService(data: AddedService) {
      this.addedService = data
    },
    setGoodsType(goodsType: string) {
      this.productInfo.goodsType = goodsType
    },
    setWoodenFrame(woodenFrame: string) {
      this.addedService.woodenFrame = woodenFrame
    },
    setActualWeight(actualWeight: number) {
      this.productInfo.actualWeight = actualWeight
    },
    setPreWaybillGoodsSizeList(preWaybillGoodsSizeList: GoodsSize[]) {
      this.productInfo.preWaybillGoodsSizeList = preWaybillGoodsSizeList.map((item) => ({
        ...item,
        id: item.id || Math.floor(100000 + Math.random() * 900000),
      }))
    },
    setVolumeSize(volumeSize: number) {
      this.productInfo.volumeSize = volumeSize
    },
    setHasSearched(val: boolean) {
      this.hasSearched = val
    },
    // 服务方式查询
    setQueryResult(data: ServiceType[]) {
      this.queryResult = data
    },
    setQueryLoading(loading: boolean) {
      this.queryLoading = loading
    },
    setBindCustomerStatus(status: string) {
      this.bindCustomerStatus = status
    },
    setRestrictResult(data: RestrictResult | null) {
      this.restrictResult = data
    },
    setOnlineCustomerInfo(data: OnlineCustomerInfo | null) {
      this.onlineCustomerInfo = data
    },
    resetQueryResult() {
      this.queryResult = []
      this.hasSearched = false
      this.bindCustomerStatus = ''
      this.restrictResult = null
      this.onlineCustomerInfo = null
      this.sendCouponResult = {}
      this.checkResultList = []
    },
    // 优惠券
    setSendCouponResult(data: Record<string, any>) {
      this.sendCouponResult = data
    },
    // 新客活动
    setIsNewCustomer(val: boolean) {
      this.isNewCustomer = val
    },
    setResourceFlag(val: boolean) {
      this.resourceFlag = val
    },
    setCouponList(data: Array<{ receiveSource: string; activityId: string; couponCount: string }>) {
      this.couponList = data
    },
    setShowSearchBtnBadge(val: boolean) {
      this.showSearchBtnBadge = val
    },
    // 联系商务
    setShowContactPopup(show: boolean) {
      this.showContactPopup = show
    },
    setContactPhone(phone: string) {
      this.contactPhone = phone
    },
    setCheckResultList(data: any[]) {
      this.checkResultList = data
    },
    setGoSendLoading(loading: boolean) {
      this.goSendLoading = loading
    },
    reset() {
      setSendAddress('')
      setReceiveAddress('')
      this.sender = { city: '', county: '', detailAddress: '', province: '' }
      this.receive = { city: '', county: '', detailAddress: '', province: '' }
      this.productInfo = {
        goodsType: '',
        preWaybillGoodsSizeList: [
          {
            id: Math.floor(100000 + Math.random() * 900000),
            width: '',
            height: '',
            length: '',
            count: 1,
            singleWeight: '',
          },
        ],
        actualWeight: 0,
        volumeSize: 0,
      }
      this.goodsTime = { goodsTime: getCurrentTimeOption({ interval: 15, intervalMinuteOffset: 15 }), goodsTimeFlag: GoodsTimeFlag.NONE }
      this.addedService = { woodenFrame: '' }
      this.resetQueryResult()
    },
    resetOrderInfo() {
      this.sender = { city: '', county: '', detailAddress: '', province: '' }
      this.receive = { city: '', county: '', detailAddress: '', province: '' }
      this.productInfo = {
        goodsType: '',
        preWaybillGoodsSizeList: [
          {
            id: Math.floor(100000 + Math.random() * 900000),
            width: '',
            height: '',
            length: '',
            count: 1,
            singleWeight: '',
          },
        ],
        actualWeight: 0,
        volumeSize: 0,
      }
      this.goodsTime = { goodsTime: '', goodsTimeFlag: GoodsTimeFlag.NONE }
      this.addedService = { woodenFrame: '' }
    },
  },
})
