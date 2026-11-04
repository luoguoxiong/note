// import { getApplicationByCode } from '@order-public-sub-public/utils/applicationUtil'

interface IcGrayHeader {
  [key: string]: string | number
}

// 获取灰度头header对象数据{}
export const getGrayHeaderLists = (ICList = []) => {
  let result = {}
  if (ICList) {
    try {
      if (ICList && ICList.length > 0) {
        result = ICList.reduce((pev: IcGrayHeader, cur: IcGrayHeader) => {
          pev[cur.key] = cur.value
          return pev
        }, {})
      }
    } catch (error) {
      console.error('路由ICGray解析失败', error)
    }
  }
  console.log('result---', result)
  return result
}

class GrayHeaderStore {
  // 原生灰度头菜单信息
  grayMenuInfo = {}
  // 原生灰度头信息 {key: value}
  nativeGrayHeader = {
    'X-framework-UserCenterGray': '0924',
  }

  // 更新灰度头信息
  updateNativeGrayHeader() {
    // TODO 暂不启用-无需拉取接口灰度头, 使用固定的nativeGrayHeader
    return
    // const grayMenuInfo = getApplicationByCode('A2009', 'M2089') || {}
    // this.grayMenuInfo = grayMenuInfo
    // const { grayHeader } = grayMenuInfo
    // this.nativeGrayHeader = getGrayHeaderLists(grayHeader) || {}
    // console.log('this.nativeGrayHeader', this.nativeGrayHeader)
  }
}

const grayHeaderStore = new GrayHeaderStore()
export default grayHeaderStore
