import { useState } from '@tarojs/taro'

// 定义状态枚举
export const statusMap = {
  isUpLoadWaiting: 1, // 等待上传
  isUploading: 2, // 上传中
  isUploadFail: 3, // 上传失败
  isVideo: 4, // 视频状态
} as const

// 定义视频信息类型
interface VideoInfo {
  status: (typeof statusMap)[keyof typeof statusMap] // 使用枚举值作为类型
  progress: number // 上传进度(0-100)
  fileId: string // 文件ID
  rejectReason: string | null // 拒绝原因
  workOrderStatus: 1 | 2 | 3 | null // 工单状态: 1.待审批 2.同意 3.拒绝
  videoLikeAmount: number // 视频点赞数
  isVideoLike: boolean // 是否已点赞
}

// 点赞数据参数类型
interface StarData {
  isVideoLike: boolean
  videoLikeAmount: number
}

export const useVideo = () => {
  // 初始化视频信息状态
  const [videoInfo, setVideoInfo] = useState<VideoInfo>({
    status: statusMap.isVideo,
    progress: 0,
    fileId: '',
    rejectReason: null,
    workOrderStatus: null,
    videoLikeAmount: 0,
    isVideoLike: true,
  })

  // 更新点赞状态
  const updateStar = (starData: StarData): void => {
    setVideoInfo({
      ...videoInfo,
      isVideoLike: starData.isVideoLike,
      videoLikeAmount: starData.videoLikeAmount,
    })
  }

  // 更新上传进度
  const updateProgress = (progress: number): void => {
    setVideoInfo({
      ...videoInfo,
      progress,
    })
  }

  // 更新视频状态
  const updateVideoStatus = (status: (typeof statusMap)[keyof typeof statusMap]): void => {
    setVideoInfo({
      ...videoInfo,
      status,
    })
  }

  return {
    videoInfo,
    updateStar,
    updateProgress,
    updateVideoStatus,
    setVideoInfo,
  }
}
