import { Ref } from 'vue'

// 组件数据
export interface BranchSelfPickupData {
  selfPickBranchesList: SelfPickBranche[] // 自提网点列表
}

interface SelfPickBranche {
  branchId: string //	自提网点点部id
  branchName: string //	自提网点点部
  branchLatLng: string //	自提网点经纬度
  branchAddress: string //	自提网点地址
  receiptAddressDistance: number //	距离收件地址距离
}

// 提交数据
export interface BranchSelfPickUp {
  selfPickupMobile?: string //自提手机
  selfPickBranchId?: string //自提网点id
  selfPickBranchName?: string // 自提网点名称
}

export interface IOption {
  label: string
  desc?: string
  id: string
  checked: Ref<boolean>
}
