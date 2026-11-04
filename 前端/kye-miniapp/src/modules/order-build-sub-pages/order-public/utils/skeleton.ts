/**
 * @description 获取配置初始化结束之后关闭默认遮罩层
 */
export const closeSkeleton = () => {
  if (getSkeleton() !== 'none') {
    // window.visibleSkeleton('none')
  }
}

/**
 * @description 显示遮罩层
 */
export const showSkeleton = () => {
  if (getSkeleton() === 'none') {
    // window.visibleSkeleton('block')
  }
}

/**
 * @description 获取遮罩层状态
 */
export const getSkeleton = () => {
  const skeletonElement = document.getElementsByClassName('skeleton')
  if (skeletonElement && skeletonElement.length > 0) {
    return (skeletonElement[0] as HTMLElement).style.display
  } else {
    return 'none'
  }
}
