export type EnvType = 'uat' | 'prod'
export type PlatformType = 'wx' | 'apk' | 'ipa' | 'alipay' | 'amap' | 'h5'
export type VersionBumpType = 'major' | 'minor' | 'patch'

export interface PackageJSON {
  version: string
  [key: string]: any
}
