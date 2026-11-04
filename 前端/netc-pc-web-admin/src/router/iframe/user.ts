import { defineAsyncComponent } from 'vue'
import { ExtendedRouteRecordRaw } from '../types'
import { usePcWebRootStore } from '@/stores/pc-web/root'

/* 个人中心路由 enter(对齐老基座 micro/user.js UserRouterBeforeEnter):
   每次进入 /admin/user 都拉取最新用户信息, 保证子应用经桥接读取的 customCode 实时
   (客户编码列表 item.customerCode === customCode 的"当前绑定"标记判断依赖它);
   必须等待刷新完成再放行: iframe 子应用通过 ACTIONS_GET_USER_INFO 取数时父级优先返回
   pcWebRootStore.userInfo 缓存, 若不等待会拿到上一个账号的缓存(换号场景回显错乱);
   刷新失败不阻断导航(缓存仍可用, 由 iframeBridge 缓存空判断兜底实时拉取) */
const UserRouterBeforeEnter = async () => {
  try {
    await usePcWebRootStore().updateUserInfoAction()
  } catch (e) {
    console.log(e)
  }
}

export const userCenterRoutes: ExtendedRouteRecordRaw[] = [
  {
    name: 'user',
    path: '/admin/user',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-user-center' */ '@/views-iframe/user/index.vue')
    ),
    beforeEnter: UserRouterBeforeEnter,
  },
]
