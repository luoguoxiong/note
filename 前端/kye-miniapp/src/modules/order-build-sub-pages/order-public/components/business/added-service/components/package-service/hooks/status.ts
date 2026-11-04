import { OtherPackageServiceEnum, PackageServiceEnum } from '../../../types'
const packageService1 = 'https://ic-img.ky-express.com/netc/20250619_56839_!!1750305292257_404_404.png'
const packageService2 = 'https://ic-img.ky-express.com/netc/20250619_38741_!!1750305296743_404_404.png'
const packageService3 = 'https://ic-img.ky-express.com/netc/20250619_973_!!1750305299976_404_404.png'
const packageService4 = 'https://ic-img.ky-express.com/netc/20250619_16055_!!1750305303259_376_376.png'
const packageService5 = 'https://ic-img.ky-express.com/netc/20250619_3926_!!1750305307673_400_400.png'

const packageServiceDbd = 'https://ic-img.ky-express.com/netc/20250619_44479_!!1750305310749_376_376.png'
const packageServiceDhj = 'https://ic-img.ky-express.com/netc/20250619_13264_!!1750305313857_376_376.png'
const packageServiceDzx = 'https://ic-img.ky-express.com/netc/20250719_16212_!!1752906944400_380_380.png'
const packageServiceFwb = 'https://ic-img.ky-express.com/netc/20250619_77784_!!1750305321632_376_376.png'
const packageServiceLsm = 'https://ic-img.ky-express.com/netc/20250719_1055_!!1752906961428_380_380.png'
const packageServiceQpm = 'https://ic-img.ky-express.com/netc/20250619_60831_!!1750305423101_376_376.png'
const packageServiceQpz = 'https://ic-img.ky-express.com/netc/20250619_76866_!!1750305431692_376_376.png'
const packageServiceZzm = 'https://ic-img.ky-express.com/netc/20250619_55712_!!1750305440274_376_376.png'
const packageServiceFzd = 'https://ic-img.ky-express.com/netc/20250719_85643_!!1752906844337_380_380.png'
const packageServiceFqx = 'https://ic-img.ky-express.com/netc/20250719_313_!!1752906884368_380_380.png'

export const packageInageMap = {
  [PackageServiceEnum['打卡板']]: packageService3,
  [PackageServiceEnum['打木架']]: packageService1,
  [PackageServiceEnum['打木箱']]: packageService2,
  [PackageServiceEnum['打木箱(国际)']]: packageService4,
  [PackageServiceEnum['打木托(国际)']]: packageService5,
}

export const otherPackageInageMap = {
  [OtherPackageServiceEnum['打绷带']]: packageServiceDbd,
  [OtherPackageServiceEnum['打护角']]: packageServiceDhj,
  [OtherPackageServiceEnum['蜂窝板']]: packageServiceFwb,
  [OtherPackageServiceEnum['气泡膜']]: packageServiceQpm,
  [OtherPackageServiceEnum['气泡柱']]: packageServiceQpz,
  [OtherPackageServiceEnum['珍珠棉']]: packageServiceZzm,
  [OtherPackageServiceEnum['拉伸膜']]: packageServiceLsm,
  [OtherPackageServiceEnum['打纸箱']]: packageServiceDzx,
  [OtherPackageServiceEnum['防震动']]: packageServiceFzd,
  [OtherPackageServiceEnum['防倾斜']]: packageServiceFqx,
}
