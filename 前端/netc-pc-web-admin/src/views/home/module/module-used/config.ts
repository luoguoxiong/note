import { LightApplicationInfoListVO, SettingDataVO } from '@/apis/home/types'

const COMMON_FUNCTION_ICON_MAP: Readonly<Record<string, string>> = {
  运费时效查询: 'https://ic-img.ky-express.com/netc/20260824_11396_!!1787539128142_96_96.png',
  整车寄件: 'https://ic-img.ky-express.com/netc/20260824_5044_!!1787552429552_96_96.png',
  账号权限: 'https://ic-img.ky-express.com/netc/20260824_6792_!!1787552413286_96_96.png',
  下单审核: 'https://ic-img.ky-express.com/netc/20260824_2230_!!1787539128143_96_96.png',
  客户服务: 'https://ic-img.ky-express.com/netc/20260824_16826_!!1787552405690_96_96.png',
  功能反馈: 'https://ic-img.ky-express.com/netc/20260824_6418_!!1787552394687_96_96.png',
  批量导入寄件模板: 'https://ic-img.ky-express.com/netc/20260824_21770_!!1787552326086_96_96.png',
  寄件模板: 'https://ic-img.ky-express.com/netc/20260824_77411_!!1787539128138_96_96.png',
  偏好设置: 'https://ic-img.ky-express.com/netc/20260824_65627_!!1787552311795_96_96.png',
  打印设置: 'https://ic-img.ky-express.com/netc/20260824_94199_!!1787539128145_96_96.png',
  产品服务: 'https://ic-img.ky-express.com/netc/20260824_23999_!!1787552276374_96_96.png',
  电子合同: 'https://ic-img.ky-express.com/netc/20260824_41132_!!1787552276377_96_96.png',
  跨越风貌: 'https://ic-img.ky-express.com/netc/20260824_52843_!!1787539128148_96_96.png',
  理赔中心: 'https://ic-img.ky-express.com/netc/20260824_86784_!!1787552276379_96_96.png',
  违禁品查询: 'https://ic-img.ky-express.com/netc/20260824_5084_!!1787552276376_96_96.png',
  国际寄件: 'https://ic-img.ky-express.com/netc/20260824_68695_!!1787552241039_96_96.png',
  地址簿: 'https://ic-img.ky-express.com/netc/20260824_18648_!!1787552241042_96_96.png',
  支付开票: 'https://ic-img.ky-express.com/netc/20260824_50469_!!1787552241045_96_96.png',
  国际运单: 'https://ic-img.ky-express.com/netc/20260824_56041_!!1787539128146_96_96.png',
  整车运单: 'https://ic-img.ky-express.com/netc/20260824_67049_!!1787552241047_96_96.png',
  运单查询: 'https://ic-img.ky-express.com/netc/20260824_45894_!!1787552241043_96_96.png',
  批量寄件: 'https://ic-img.ky-express.com/netc/20260824_60816_!!1787552241052_96_96.png',
  网点查询: 'https://ic-img.ky-express.com/netc/20260824_77179_!!1787552241050_96_96.png',
  单票寄件: 'https://ic-img.ky-express.com/netc/20260824_72210_!!1787552241049_96_96.png',
}

const COMMON_FUNCTION_SETTING_ORDER = [
  '单票寄件',
  '批量寄件',
  '整车寄件',
  '运单查询',
  '下单审核',
  '整车运单',
  '运费时效查询',
  '网点查询',
  '违禁品查询',
  '支付开票',
  '账号权限',
  '地址簿',
  '付款授权',
  '个人中心',
  '偏好设置',
  '数据看板',
  '汇总看板',
  '明细看板',
  '预存运费',
  '我的优惠券',
] as const

const commonFunctionOrderMap = new Map<string, number>(
  COMMON_FUNCTION_SETTING_ORDER.map((menuName, index) => [menuName, index])
)

export const getCommonFunctionIcon = (item: LightApplicationInfoListVO) => {
  return COMMON_FUNCTION_ICON_MAP[item.menuName] || item.menuIcon
}

export const sortCommonFunctionSettings = (menuList: SettingDataVO[]) => {
  return [...menuList].sort((previous, next) => {
    const previousIndex = commonFunctionOrderMap.get(previous.menuName) ?? Number.MAX_SAFE_INTEGER
    const nextIndex = commonFunctionOrderMap.get(next.menuName) ?? Number.MAX_SAFE_INTEGER
    return previousIndex - nextIndex
  })
}
