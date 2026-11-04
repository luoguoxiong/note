import {
  BatchOrderInfo,
  CommonProcessWaybillInfo,
  DynamicConfig,
  InitResponse,
} from '@order-public-sub-public/apis/types'
import { GetEstimateFeeByTaskIdResponse } from '@order-public-sub-public/apis/waybill/estimated-cost'
import { ModuleType, OrderPageType, ReturnWaybillBackType } from '@order-public-sub-public/constants'
import { OrderInfo, RelationMap, RestrictData } from '@order-public-sub-public/types'

export const DEFAULT_BATCH_ORDER: BatchOrderInfo = {
  commonWaybillInfo: {} as CommonProcessWaybillInfo,
  waybillInfoList: [],
}

export const DEFAULT_GLOBAL_DATA = {
  eventsMap: {} as RelationMap, // 实际渲染的跨组件依赖关系表
  componentList: [], // 实际渲染的组件数组
  existComponentMap: {}, // 实际渲染的组件map
  userInfo: {
    //用户信息
    phone: '',
    nickName: '',
    name: '',
  },
  processLoading: false, // 过程中loading，标识过程中接口正在调用中
  initDataPromise: null, // initCheckData的promise
  processPromise: null, // initCheckData的promise
  restrictData: {} as RestrictData, //管控数据
  dynamicConfig: {} as DynamicConfig,
  checkResultList: [],
  preConfig: {
    //保存上一个的ID，用于切换配置取消场景记录用户行为
    preConfigId: '',
    preVersionId: '',
    preThemeName: '',
  },
  currentConfig: {
    configId: '',
    versionId: '',
    themeName: '',
    currentThemeName: '',
  },
  initConfig: {} as InitResponse, // 批量寄场景 保存原initConfig数据
  // batchWaybillInfo: {} as OrderInfo,
  // batchWaybillInfoList: [] as InitDataResponse[],
  estimatedCost: {} as GetEstimateFeeByTaskIdResponse, // 存储预估费用 和 优惠券信息
  // batchModuleDimension: {} as ModuleDimension,
  // batchDynamicConfig: {} as DynamicConfig,
  // batchRestrictData: {} as RestrictData,
  orderPageType: OrderPageType.单票,
  currentWaybillNumber: '', //当前运单号
  returnWaybillNumber: '', // 返程单运单号
  restrictWaybillNumber: '', // 批量场景当前管控的运单号
  goWaybillNumber: '', //去程单运单号
  staticConfigAndWaybillInfo: {}, // 保存静态配置数据和运单数据的对象，key为运单号
  isEditAndReturnWaybill: false, // 是否修改运单且是返程单
  returnWaybillBackType: ReturnWaybillBackType.返回,
  tempWaybillInfo: {} as Pick<OrderInfo, 'addedService'>,
}

// export const DEFAULT_GLOBAL_DATA = {}

export const DEFAULT_EXTEND_DATA = {
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
}
