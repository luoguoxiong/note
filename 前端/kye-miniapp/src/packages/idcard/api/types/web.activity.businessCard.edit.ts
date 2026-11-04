interface BusinessCardEditRequest {
  /** 名片Id */
  id: string
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
}
