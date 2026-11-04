export interface ImageInterface {
  src: string
}

export type ImagePreviewProps = Partial<{
  show: boolean
  images: ImageInterface[]
  autoplay: string | number
  isLoop: boolean
  showIndex: boolean
  closeable: boolean
  contentClose: boolean
  activeIndex: number
  closeOnClickOverlay: boolean
  showPagination: boolean // 是否展示分页
  showMenuByLongpress: boolean // 长按图片显示菜单
}>
