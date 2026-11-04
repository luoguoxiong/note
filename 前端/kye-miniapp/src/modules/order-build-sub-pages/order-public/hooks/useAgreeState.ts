import {
  HelpContent,
  getHelpContentList,
  agreementSaveNew,
  agreementCheckHasReadNew,
} from '@order-public-sub-public/apis/waybill/agreementnew'

export enum AgreementType {
  /**
   * 运单电子协议
   */
  Waybill = 0,
  /**
   * 保费电子协议
   */
  Premium = 1,
  /**
   * 电子回单协议
   */
  Receipt = 2,
  /**
   * 网点自提
   */
  BranchSelf = 3,
  /**
   * 安装服务协议
   */
  Install = 4,
  /**
   * 代收货款协议
   */
  Payment = 5,
}

export interface CheckedState {
  type?: AgreementType
  content?: string
  status?: string // 签署状态：0-未签署，1-已签署
  historyVisible?: boolean
  code?: string
}

export type CheckedStateMap = Record<string | number, HelpContent | null>

const initState: CheckedStateMap = {
  [AgreementType.Waybill]: null,
  [AgreementType.Premium]: null,
  [AgreementType.Receipt]: null,
  [AgreementType.Install]: null,
}

export const getHelpContent = async (params: { types: string; waybillNumber?: string }, needCache = true) => {
  const { types } = params
  if (initState[types] && needCache) {
    return initState[types]
  }
  const { data } = await getHelpContentList({ types: types })
  data?.forEach((item) => {
    const { type } = item
    initState[type] = item
  })
  return initState[types]
}

export const agreementSave = async (params: { type: number; status: number; waybillNumber?: string }) => {
  const { type, status } = params
  const item = await getHelpContent({ types: type.toString() })
  const { version = '' } = item || {}
  const saveParams = {
    type,
    status,
    version,
  }
  await agreementSaveNew(saveParams)
}

export const agreementCheckHasRead = async (params: { type: number }) => {
  const { type } = params
  const item = await getHelpContent({ types: type.toString() })
  const { version = '' } = item || {}
  const saveParams = {
    type,
    version,
  }
  await agreementCheckHasReadNew(saveParams)
}
