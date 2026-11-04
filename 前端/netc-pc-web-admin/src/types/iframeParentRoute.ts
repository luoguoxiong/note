/**
 * @Desc: iframeParentRoute
 * @Author: wu xingtao
 * @Date: 2024/4/28
 */

export enum IframeParentRoutePath {
  '首页' = '/admin/home',
  '查件列表' = '/admin/waybill-v3',
}

export type IframeRoutePath = (typeof IframeParentRoutePath)[keyof typeof IframeParentRoutePath]
