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

export interface FsFile {
  path?: string
  tempFilePath: string
  size: number
  type?: string //文件类型。可能值有 image（图片）、video（视频）。
  duration?: number
  width?: number
  height?: number
}

export interface FsFileReadParams {
  filePath: string | undefined
  encoding: string
  position?: number
  length?: number
  name?: string
}

export interface ChooseImageRes {
  imgList: ChooseImageFile[]
}

export interface ChooseImageFile {
  // fileName: string
  // fileSize: string | number
  base64: string
  name?: string
  size?: string | number
  tempFilePath?: string
  type?: string
  data?: string
}
