export type PermissionApproval = {
  /**
   * ID
   */
  id?: number
  /**
   * 申请人手机号
   */
  applyPhone?: string
  /**
   * 申请人
   */
  applyUser?: string
  /**
   * 申请权限
   */
  applyAuth?: string
  /**
   * 申请原因
   */
  applyReason?: string
  /**
   * 申请时间
   */
  applyTime?: string
  /**
   * 审批状态 10同意，20驳回，30待审, 80流程完成归档, 90撤销
   */
  status?: string
  /**
   * 审批人姓名
   */
  approvalUser?: string
  /**
   * 审批意见
   */
  approvalOpinion?: string
  /**
   * 审批时间
   */
  approvalDate?: string
  /**
   * 申请类型(eam_apply_type)
   */
  type: string
  /**
   * 审批人手机号
   */
  approvalPhone: string
  /**
   * 用户是否已解绑
   */
  isUnbind: boolean
  /**
   * 申请人部门code【新增】
   */
  departmentCode: string
  /**
   * 申请人部门名称【新增】
   */
  departmentName: string
}
