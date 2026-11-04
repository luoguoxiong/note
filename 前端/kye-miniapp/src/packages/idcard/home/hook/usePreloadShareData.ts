// 专门用来预加载分享卡片信息的hook
import { ref } from 'vue'
import useCanvas from './usecanvas'

// 共享响应式分享信息 shareInfo，用于缓存分享信息供外部使用
export const shareInfo = ref<{
  title?: string
  path?: string
  imageUrl?: string
}>({})

export const usePreloadShareData = () => {
  // 将useCanvas的初始化移到hook内部，确保每次调用hook时都有新的实例
  const { handleGetImg } = useCanvas()

  // 默认分享图片URL
  const DEFAULT_SHARE_IMAGE = 'https://ic-img.ky-express.com/netc/20250225_11366301190_!!1740465309562_840_672.png'

  // 默认分享标题
  const DEFAULT_SHARE_TITLE = '跨越速运个人名片！'

  /**
   * 预加载分享数据
   * @param info - 包含分享推荐信息的对象
   * @param code - ID编码用于构建路径
   */
  const preloadShareData = async ({ info, code }) => {
    try {
      const resimg = await handleGetImg(info)
      shareInfo.value = {
        title: info.shareRecommend || DEFAULT_SHARE_TITLE,
        path: `/packages/idcard/home/index?id=${code}&type=card`,
        imageUrl: resimg,
      }
    } catch (error) {
      console.error('加载分享图失败:', error)
      shareInfo.value = {
        title: info.shareRecommend || DEFAULT_SHARE_TITLE,
        path: `/packages/idcard/home/index?id=${code}&type=card`,
        imageUrl: DEFAULT_SHARE_IMAGE,
      }
    }

    return shareInfo.value // 返回shareInfo以便链式调用
  }

  return {
    preloadShareData,
    shareInfo, // 同时返回shareInfo以便组件可以直接使用当前hook实例的共享状态
  }
}
