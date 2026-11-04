import Taro from '@tarojs/taro'
export interface OpenMiniProgramParmas {
  /** 小程序原始ID */
  userName: string
  /** 跳转路径 */
  path: string
  /** 0-正式版，1-开发版，2-体验版 */
  miniprogramType: number
  /** 小程序Appid */
  appId: string
  /** develop-开发版，trial-体验版，release-正式版 */
  envVersion: 'develop' | 'trial' | 'release'
}

export interface ChooseMediaParmas {
  /** 最多可以选择的文件个数
   * @default 9
   * @supported weapp, h5
   */
  count?: number
  /** 文件类型
   * @default ['image', 'video']
   * @supported weapp, h5
   */
  mediaType?: Array<'image' | 'video'>
  /** 图片和视频选择的来源
   * @default ['album', 'camera']
   * @supported weapp, h5
   */
  sourceType?: Array<'album' | 'camera'>
  /** 拍摄视频最长拍摄时间，单位秒。时间范围为 3s 至 60s 之间
   * @default 10
   * @supported weapp
   */
  maxDuration?: number
  /** 是否压缩所选文件
   * @default ['original', 'compressed']
   * @supported weapp
   */
  sizeType?: Array<'original' | 'compressed'>
  /** 仅在 sourceType 为 camera 时生效，使用前置或后置摄像头
   * @default "back"
   * @supported weapp, h5
   */
  camera?: string
}
