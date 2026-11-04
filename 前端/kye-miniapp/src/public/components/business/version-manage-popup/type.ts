/**
 * @Desc: type
 * @Date: 2025/8/26
 */
export interface PropsType {
  touchLocation: '10' | '20' // '10':首页 | '20': 设置页
}

export interface AndroidDownProgressType {
  fileMd5: string //下载传进来的md5
  versionNo: string //下载传进来的versionNo
  total: number //下载总进度条
  progress: number //下载当前进度
  filePath: string //下载完成文件路径
}
