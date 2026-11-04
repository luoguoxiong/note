import { OrderSuccessPageConfig } from '@order-public-sub-public/types'
// import { Popup, Button, ImagePreview, Icon } from 'vant'

// 注意：不要在此处顶层 import virtual-mode/index.vue —— 它依赖 @order-public-sub-public/validate，
// 而 validate/limit 又引用本文件 contactPopup，会形成循环依赖导致模块初始化时 useContactBusiness 为 undefined。
// virtual-mode 当前无挂载点（弹框由 page-common 中的 global-contact 渲染），createApp 逻辑已废弃。
import { localStorage } from '@order-public-sub-public/utils/storage'
import { useContactBusiness } from '@order-public-sub-public/components/business/contact-business/hooks/useState'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
// 注意：不要在模块顶层调用 useContactBusiness() —— useState 的依赖链
// (types/apis/configs 桶 → validate/limit → 本文件) 存在循环依赖，
// 顶层调用时 useState 可能尚未初始化完成（useContactBusiness is not a function）。
// 在函数内惰性调用即可（hook 返回的是模块级 refs 单例，多次调用等价）。
let contactApp: any = null
interface PopupParams {
  phone?: string // 电话
  title?: string // 显示的名称 默认商务
  hideWeChat?: boolean // 是否隐藏企业微信 默认不隐藏
  approvedBy?: boolean
  scene?: string // 联系商务的场景
}
export const contactPopup = (params = {} as PopupParams) => {
  let phone = ''
  console.log('params', params)
  try {
    phone = piniaStore.root.getUserInfo?.phone
  } catch (e) {
    console.log(e)
  }
  // 惰性调用，规避模块循环依赖下的初始化顺序问题
  const { openContactBusiness } = useContactBusiness()
  openContactBusiness(phone, params.title)
  // contactApp = createApp(ContactBusiness, {
  //   close: () => {
  //     // 关闭时销毁实例
  //     destroy()
  //   },
  //   showTel: params.phone || piniaStore.root.getUserInfo?.phone || phone,
  //   title: params.title || '商务',
  //   hideWeChat: params.hideWeChat || false,
  //   approvedBy: params.approvedBy || false,
  //   scene: params?.scene || '',
  // })
  // contactApp.use(Popup).use(Button).use(ImagePreview).use(Icon)
  //
  // // 定义一个元素节点
  // let kyContactBusinessDiv: HTMLElement
  //
  // // 检查页面上是否存在 id 为 "kyContactBusiness" 的元素
  // const kyContactNode = document.getElementById('kyContactBusiness')
  //
  // if (kyContactNode) {
  //   // 如果存在，则使用该元素
  //   kyContactBusinessDiv = kyContactNode
  // } else {
  //   // 如果不存在，则创建一个新的 div 元素
  //   kyContactBusinessDiv = document.createElement('div')
  //   kyContactBusinessDiv.id = 'kyContactBusiness'
  // }
  //
  // // 挂载到body上
  // document.body.appendChild(kyContactBusinessDiv)
  //
  // // 销毁方法
  // const destroy = () => {
  //   contactApp.unmount()
  // }
  // contactApp.destroy = destroy
  //
  // nextTick(() => {
  //   contactApp.mount(kyContactBusinessDiv)
  // })
  // return destroy
}

export const destroyContact = () => {
  if (contactApp) {
    if (contactApp.destroy) {
      contactApp.destroy()
    }
  }
}
