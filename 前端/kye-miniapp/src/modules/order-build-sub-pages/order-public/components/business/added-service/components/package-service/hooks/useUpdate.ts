import { woodenFrameInfoListType } from '@order-public-sub-public/types'
import { otherPackageInageMap, packageInageMap } from './status'

/**
 * 组装包装服务选项的图片
 * @param list 包装服务列表
 * @param type 常规/其他
 */
export const packageServiceListC = (list: woodenFrameInfoListType[] = [], type: 'normal' | 'other') => {
  if (!list?.length) return []
  const imgMap = type === 'normal' ? packageInageMap : otherPackageInageMap
  const arr = list.map((v) => {
    if (v.value) {
      v.img = imgMap[v.value as keyof typeof imgMap]
    }
    return v
  })
  return arr
}
