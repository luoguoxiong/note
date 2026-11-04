import Taro from '@tarojs/taro'

interface RichInfo {
  content: string
  title: string
}

export const richText = {
  content: '',
  title: '',
  setContent(info: RichInfo) {
    this.title = info.title || '跨越速运'
    this.content = info.content || ''
  },
}

export const toRichTextPage = (info: RichInfo) => {
  richText.setContent(info)
  Taro.navigateTo({
    url: '/modules/rich/pages/index/index',
  })
}
