import DBFactory from '@order-public-sub-public/utils/db/dbFactory'

import { DBDATABASE } from '@order-public-sub-public/utils/db/constant'

const TableDataStoreName = 'print_batch_filter'

interface PrintBatchFilter {
  print_batch_filter_params: {
    isOperation: boolean
    waybillCustomerSource: number
    creationStartDate: string
    creationEndDate: string
    printStatus: number
    goodsType: string
    customValue: {
      name: string
      id: number
    }

    pickupPerson: string
    pickupMobile: string
    pickupCustomerName: string
    pickupAddress: string
    pickupCity: string
    pickupDepartmentId: {
      name: string
      id: number
    }

    deliveryPerson: string
    deliveryMobile: string
    deliveryCustomerName: string
    deliveryDepartmentId: {
      name: string
      id: number
    }
    deliveryAddress: string
    deliveryCity: string
    orderMobile: string
    orderDepartmentId: {
      name: string
      id: number
    }
  }
  // 后续可能会有其他参数需要跟打印页面同步状态
  sync_print_batch_params: {
    printStatus: number
  }
  print_batch_filter_options: {
    boundCustomCode: boolean
    oneYearWaybillPermission: boolean
    departmentFilterNameList: Array<{
      departmentType: number
      departmentName: string
    }>
  }
}

const PrintBatchFilterDB = new DBFactory<PrintBatchFilter>(DBDATABASE, TableDataStoreName)

export { PrintBatchFilterDB }
