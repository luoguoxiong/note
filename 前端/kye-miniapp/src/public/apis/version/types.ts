export interface CheckVersionResponse {
  upgradeConfigId?: number // 升级配置id
  versionNo?: string // 版本号
  versionLink?: string // 版本链接
  modifyContent?: string // 	更新内容
  releaseTime?: number // 发布时间
  channel?: number // 更新渠道 10-内部渠道，20-苹果商店
  upgradeLocation?: string // 升级位置 10-首页，20-设置页
  upgradeMode?: number // 升级方式 10-强制升级，20-提示升级，30-检测更新
  upgradeRange?: string | number // 获取方式 10-手机号，20-客户编码，30-组件id，40-全部用户，50-版本号
  sandboxLink?: string // 	沙盒版本链接
  fileSize?: number // 安装包大小 字节
  fileMd5?: string // fileMd5
}
