export interface CardVideoIntroduceProps {
  isFirst: boolean
  isLast: boolean
  data: {
    videoInfo: {
      fileId: string
      rejectReason?: string
      workOrderStatus: string
      videoLikeAmount: number
      isVideoLike: boolean
      status: number
      mp4Link?: string
      md5?: string
    }
    code: string
    idCardId: string
    isLogin: boolean
  }
  employeeId: string
  isEdit: boolean
  title: string
  isOpen: boolean
  progress: number
}
