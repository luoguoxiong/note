import Taro from '@tarojs/taro'

/* 组件预览数据存储 */
export const usePreviewComponent = () => {
  /* 设置当前预览组件 */
  const setPreviewComponent = (component: any) => {
    Taro.setStorageSync('previewComponent', component)
  }
  const getCurrentPreviewComponent = () => {
    return Taro.getStorageSync('previewComponent')
  }

  /* 设置列表组件选中 */
  const setListSelectComponent = (component: any) => {
    Taro.setStorageSync('listSelectComponent', component)
  }
  const getListSelectComponent = () => {
    return Taro.getStorageSync('listSelectComponent')
  }

  return {
    setPreviewComponent,
    getCurrentPreviewComponent,
    setListSelectComponent,
    getListSelectComponent,
  }
}
