interface RecoverDefaultDutyRequest {
  /** 员工工号 */
  employeeNumber: string
}

interface RecoverDefaultDutyResponse {
  /** 状态码 */
  code: number
  /** 错误描述 */
  msg: string
  /** 数据对象 */
  data: RecoverDefaultDutyResponseData
}

interface RecoverDefaultDutyResponseData {
  /** 默认岗位 */
  defaultDuty: string
}
