/**
 * @Desc: pageActivited
 * @Author: wu xingtao
 * @Date: 2024/4/28
 */
import { appInitPage } from '@/hooks/init'
import { IframeParentRoutePath, IframeRoutePath } from '@/types/iframeParentRoute'
import EE from '@/utils/eventemitter'

export enum pageActivatedAction {
  '首页更新' = 'ON_ACTIVATED_HOME_PAGE_TRIGGER',
}

export const pageActivatedEmit = (activatedPath: IframeRoutePath) => {
  let action = ''
  switch (activatedPath) {
    case IframeParentRoutePath['首页']:
      action = pageActivatedAction['首页更新']
      break
  }
  // 发送页面onActivated通知
  if (action) {
    EE.emit(action)
  }

  pageActivatedEffect(action)
}

// 页面激活副作用处理
export const pageActivatedEffect = (action: string) => {
  if (action) {
    if (action === pageActivatedAction['首页更新']) {
      // 刷新用户信息（原 iframe 桥接获取父容器 userInfo 的本地替代）
      appInitPage()
    }
  }
}
