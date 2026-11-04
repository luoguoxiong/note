interface uploadImgDataResponse {
  /** 状态码 */
  code: number
  /** 错误描述 */
  msg: string
  /** 数据对象 */
  data: uploadImgData
}

interface uploadImgData {
  /** 头像图片链接 */
  headImgUrl: string
}
