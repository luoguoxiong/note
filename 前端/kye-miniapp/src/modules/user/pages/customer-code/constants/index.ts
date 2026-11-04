/**
 * 客户编码模块枚举常量定义
 */

/** 显示模式 */
export enum DisplayMode {
  /** 弹窗模式（内部调用） */
  POPUP = 'popup',
  /** 页面模式（外部跳转） */
  PAGE = 'page',
}

/** 业务模式（基于 getBindableCompanyList API 返回的 type 字段） */
export enum BusinessType {
  /** 绑定 (type=121) */
  BIND = 121,
  /** 猜您绑定 (type=120) */
  GUESS = 120,
  /** 切换 (type=110/111/122) */
  SWITCH = 110,
  /** 更换 (type=10) */
  CHANGE = 10,
}

/** 客户编码显示模式 */
export enum CustomerCodeMode {
  /** 绑定模式 (type=121) */
  BIND = 'bind',
  /** 猜您绑定模式 (type=120) - 近一个月下单过的公司推荐列表 */
  GUESS = 'guess',
  /** 切换模式 (type=110/111/122) */
  SWITCH = 'switch',
  /** 更换模式 (type=10) */
  CHANGE = 'change',
}

/** 绑定状态 */
export enum BindStatus {
  /** 绑定 */
  BIND = '1',
  /** 添加 */
  ADD = '2',
  /** 更换 */
  CHANGE = '3',
}

/** 联系商务角色（黑名单用户） */
export enum ContactRole {
  /** 商务 */
  BUSINESS = '商务',
  /** 主授权号 */
  MAIN_AUTH = '主授权号',
  /** 管理员 */
  ADMIN = '管理员',
}

/** 弹窗提示类型 */
export enum AlertType {
  /** 申请绑定其他公司（无权限时） */
  APPLY_BIND_OTHER = '1',
  /** 一键解绑确认 */
  UNBIND_ALL = '2',
  /** 单个解绑确认 */
  UNBIND_SINGLE = '3',
}

/** 申请场景 */
export enum ApplyScene {
  /** 申请客户编码 */
  APPLY_CUSTOMER_CODE = 'applyCustomerCode',
  /** 忘记密码 */
  FORGET_PASSWORD = 'forgetPassword',
  /** 绑定其他公司 */
  BIND_OTHER_COMPANY = 'bindOtherCustomerCode',
}

/** 联系商务弹窗状态（参考 contact-business 组件） */
export enum ContactBusinessStatus {
  /** 加载中 */
  LOADING = -1,
  /** 无匹配商务 */
  NO_BUSINESS = 0,
  /** 有微信二维码+联系方式 */
  HAS_WX_QRCODE = 1,
  /** 显示微信二维码 */
  SHOW_WX_QRCODE = 2,
}
