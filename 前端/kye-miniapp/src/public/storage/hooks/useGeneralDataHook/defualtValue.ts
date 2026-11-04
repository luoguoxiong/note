export function getDefaultGlobalData() {
  return {
    xcxOpenId: null, // 小程序 xcxOpenId
    isEmployee: null, // 是否内部员工 TODO
    userInfo: {
      id: '', // 用户id
      phone: '', // 用户手机号
      encryptPhone: null, // 加密手机号- TODO 埋点
      userName: null, // 真实姓名
      nickname: null, // 昵称 TODO
      position: '', // 职务
      newRegisterFlag: null, // 是否新注册用户，1:新注册用户 2: 旧注册
      customerCode: '',
      headUrl: '', // 头像地址
      sex: 0, // 性别
      registrationDay: 0,
      registrationTime: '',
      birthday: '',
      isOldCustomer: 0,
    },
    customerInfo: {
      customerId: '', // 客户编码id
      customerType: '', //  绑码类型 客户类型 '10'-新客户 '20'-老客户
      customerCode: '', // 客户编码
      customerShortName: '', // 公司名称
      existedRelationBind: false, // 是否存在关联绑定 // TODO
      bindAuth: false, // TODO
      hasCurBind: false,
    },
    auth: {
      role: null, // 角色 TODO 10:主授权 | 20:管理员 | 30: 普通用户
      departmentManager: false, // 是否部门管理员 // TODO
    },
    real: {
      authFlag: 20,
      customerType: null,
      headImgRealNameTagVO: null,
      authFlagName: '未实名',
      icName: null,
      idCard: null,
      isRealName: false,
      isValidation: null,
      noticeExplain: null,
      noticeTitle: null,
      personalPageRealNameTagVO: null,
      realName: null,
    },
  }
}

export type GeneralData = ReturnType<typeof getDefaultGlobalData>
