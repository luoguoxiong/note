import { ref } from 'vue'

/**
 * 挪包以后 下单需要子包主包公用的hooks
 */
// 点击 一键清理里面的详情按钮，跳转到列表页面
// 再点击返回按钮的时候，需要区分 是通过返回按钮还是通过router.back
export const routerBackIsHidePop = ref(true)
