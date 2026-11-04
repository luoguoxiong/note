interface getDetailForEmployeeRequest {
  /** 名片code */
  code: string
  /** 来源，编辑传edit */
  origin: string
}

interface getDetailForEmployeeResponse {
  /** 状态码 */
  code: number
  /** 错误描述 */
  msg: string
  /** 数据对象 */
  data: getDetailForEmployeeResponseData
}

/** 注意: 前端无(long类型), 有丢失精度风险*/
interface getDetailForEmployeeResponseData {
  /** 名片Id */
  id: number | string
  /** 名片变更工单记录表Id */
  lastModifyWorkOrderId: number | string
  /** 名片变更工单状态：1.待审批 2.同意 3.拒绝 */
  lastModifyWorkOrderStatus: number
  /** 拒绝原因 */
  rejectReason: string
  /** 工单审核提示 */
  approveTips: string
  /** 名片基本信息 */
  baseInfo: BaseInfo
  /** 名片内容信息（个人展示） */
  personMaterialList: PersonMaterial[]
  /** 名片内容信息（全量数据，包括不展示的数据，编辑时使用） */
  materialList: Material[]
}

/** 注意: 前端无(long类型), 有丢失精度风险*/
interface BaseInfo {
  /** 名片code，每条名片数据唯一 */
  code: string
  /** 员工工号 */
  employeeNum: string
  /** 员工姓名 */
  employeeName: string
  /** 公司名称 */
  companyName: string
  /** 个人介绍视频 */
  profileVideo: ProfileVideo
  /** 名片背景 */
  themeBackground: string
  /** 分享推荐语 */
  shareRecommend: string
  /** 头像 */
  avatar: string
  /** 岗位名称 */
  situation: string
  /** 是否展示邮箱 */
  showEmail: boolean
  /** 邮箱 */
  email: string
  /** 是否展示公司地址 */
  showAddress: boolean
  /** 公司地址 */
  address: string
  /** 名片二维码 */
  qrCode: string
  /** 在职状态，数据字典：hr_employee_in_office */
  inOffice: number
  /** 是否实名，true-已实名，false-未实名 */
  isRealname: boolean
  /** 视频点赞数 */
  videoLikeAmount: number | string
  /** 是否点赞过 */
  isVideoLike: boolean
  /** 默认岗位 */
  defaultDuty: string
  /** 部门路由 */
  departmentRoute: string
}

interface ProfileVideo {
  /** 视频文件id */
  fileId: string
  /** mp4播放链接 */
  mp4Link: string
  /** 工单状态 名片变更工单状态：1.待审批 2.同意 3.拒绝 */
  workOrderStatus: number
  /** 拒绝原因 */
  rejectReason: string
  /** 视频MD5 */
  md5: string
}

/** 注意: 前端无(long类型), 有丢失精度风险*/
interface PersonMaterial {
  /** cms栏目Id */
  menuId: number | string
  /** 栏目标题 */
  title: string
  /** 是否展示 */
  showSwitch: boolean
  /** 栏目模板编码 */
  templateCode: string
  /** 栏目内容链接 */
  link: string
  /** 内容排序 */
  contentList: Content[]
}

/** 注意: 前端无(long类型), 有丢失精度风险*/
interface Content {
  /** cms内容Id */
  contentId: number | string
  /** 内容标题 */
  title: string
  /** 是否展示 */
  showSwitch: boolean
  /** 排序 */
  sort: number
}

/** 注意: 前端无(long类型), 有丢失精度风险*/
interface Material {
  /** cms栏目Id */
  menuId: number | string
  /** 栏目标题 */
  title: string
  /** 是否展示 */
  showSwitch: boolean
  /** 栏目模板编码 */
  templateCode: string
  /** 栏目内容链接 */
  link: string
  /** 内容排序 */
  contentList: Content[]
}

/** 注意: 前端无(long类型), 有丢失精度风险*/
interface Content {
  /** cms内容Id */
  contentId: number | string
  /** 内容标题 */
  title: string
  /** 是否展示 */
  showSwitch: boolean
  /** 排序 */
  sort: number
}
