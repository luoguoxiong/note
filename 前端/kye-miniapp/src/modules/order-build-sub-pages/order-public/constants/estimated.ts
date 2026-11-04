/**
 * @description 申请状态标识
 */
export const PersonnelContactType = {
  主授权人: '10',
  管理员: '20',
  商务: '30',
}

/**
 * @description: 权限申请标识
 * @return {*}
 */
export const FeeAuthApplyStatus = {
  申请查看: 0,
  申请中: 1,
  申请失败: 2,
}

/**
 * @description: 批次费提示类型
 * @return {*}
 */
export enum AddedValueTipsType {
  最低批次费 = 10,
  最低收费 = 20,
  取派专车费 = 30,
}

// 转app端 高度减滚动的高度 计算会有误差
export const DynamicNumericalValuesMap = {
  popupT: 50,
}
