import { setDefaultScrollTopOffset } from '@order-public-sub-root-pages/order-single/hooks/useScrollTop'
import { ref } from 'vue'

export const expandFlag = ref(false)
//设置不常用功能的收缩
// const switchModuleStyle = () => {
//   const moduleDom = document.querySelector('.template-nused')
//   if (!moduleDom) {
//     return
//   }
//   moduleDom.classList[expandFlag.value ? 'add' : 'remove']('template-nused-expand')
//   const singeScrollContainer = document.querySelector('#orderContent')
//   singeScrollContainer?.scrollTo({
//     top: 2000,
//   })
// }

export const useToggleExpand = () => {
  const toggleExpand = (flag?: boolean) => {
    if (flag !== undefined) {
      expandFlag.value = Boolean(flag)
    } else {
      expandFlag.value = !expandFlag.value
    }
    if (expandFlag.value) {
      setDefaultScrollTopOffset(400)
    }
  }
  return { expandFlag, toggleExpand }
}
