// import store from '@store'
// 导入 智慧名片 的store
import Taro from '@tarojs/taro'
import { useIdCardStore } from '../store/idcard'

interface RichTextInfo {
  title?: string
  content?: string
}

export const richText = {
  content: '',
  title: '',
  setContent(info: RichTextInfo) {
    this.title = info.title || '跨越速运'
    this.content = info.content || ''
  },
}

export const toRichTextPage = (info: RichTextInfo) => {
  const { updateFresh } = useIdCardStore()

  richText.setContent(info)

  // 替换 store 的 调用方法
  // const ts = useContext(store.IdCardStore)
  // ts.updateFresh(false)

  updateFresh(false)

  Taro.navigateTo({
    url: '/packages/idcard/rich/index',
  })
}

export default {}
