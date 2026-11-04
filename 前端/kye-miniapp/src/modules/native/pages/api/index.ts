import { http } from '@public/utils/request'

interface NavtiveSave {
  key: string
  value: string
}

interface NavtiveGet {
  key: string
}

// web.basic.biz.native.store
// web.native.store
// web.basic.biz.native.store.get
// web.native.store.get
export const nativeSave = (parmas: NavtiveSave) => {
  return http('web.native.store', parmas)
}

export const nativeGet = (parmas: NavtiveGet) => {
  return http('web.native.store.get', parmas)
}
