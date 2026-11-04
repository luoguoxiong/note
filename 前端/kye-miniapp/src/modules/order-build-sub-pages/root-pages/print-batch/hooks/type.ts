

export interface ListReactiveType {
  refreshing: boolean
  loading: boolean
  switchLoading: boolean
  initLoading: boolean
  finished: boolean
  list: ListItem[]
  page: number
  keyword: string
  pageSize: number
  pageTotal: number
  departmentFilterNameList: departmentFilterNameType[]
}

export interface ListItem {
  waybillNumber: string
  deliveryCity: string
  deliveryPerson: string
  deliveryCustomerName: string
  serviceModeDesc: string
  pickupCity: string
  pickupPerson: string
  pickupCustomerName: string
  waybillStatusDesc: string
  routeDescription: string
  goodsTime: string
  printNumber: string
  deliveryCustomerCode: string
  newExteriorRouteInfo: any
  applyStatus: number
}

export interface departmentFilterNameType {
  departmentType: number
  departmentName: string
}

export interface inputAssociateItem {
  id: number
  name: string
}

export interface creationTime {
  startDate: string
  endDate: string
}

export interface screenDataType {
  creationStartDate: string
  creationEndDate: string
  printStatus: number
  pickupPerson: string
  pickupMobile: string
  pickupCustomerName: string
  pickupAddress: string
  pickupCity: string
  deliveryPerson: string
  deliveryMobile: string
  deliveryCustomerName: string
  deliveryAddress: string
  deliveryCity: string
  orderMobile: string
  goodsType: string
  pickupDepartmentId: inputAssociateItem
  deliveryDepartmentId: inputAssociateItem
  orderDepartmentId: inputAssociateItem
  creationRecentDays?: string
  waybillCustomerSource: number
  customValue: inputAssociateItem
}

export interface screenOtherDataType {
  creationStartDate: string
  creationEndDate: string
  printStatus: number
  pickupPerson: string
  pickupMobile: string
  pickupCustomerName: string
  pickupAddress: string
  pickupCity: string
  deliveryPerson: string
  deliveryMobile: string
  deliveryCustomerName: string
  deliveryAddress: string
  deliveryCity: string
  orderMobile: string
  goodsType: string
  pickupDepartmentId: any
  deliveryDepartmentId: any
  orderDepartmentId: any
  creationRecentDays?: string
  waybillCustomerSource?: number
  customValue?: any
  customerWaybillNumber?: string
}

// export type screenDataAllType = screenOtherDataType & screenDataType
