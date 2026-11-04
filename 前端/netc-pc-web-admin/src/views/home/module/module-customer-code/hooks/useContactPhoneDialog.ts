/**
 * 联系电话弹窗(编程式调用, TS 版)
 * 来源: customer-code 流程引用的 @/views/setting/user/hooks/useContactPhoneDialog (netc-pc-web)
 *  - Vue.extend 动态实例 -> Vue3 createApp 挂载本目录 components/contact-phone-dialog.vue
 *  - 实例方法 checkVirtualPhone 内联为本 hook 的 checkVirtualPhone(获取虚拟号 + 实名跳转)
 *  - 挂载实例通过 app.use(router) 注入路由上下文, 保证弹窗内部 useRouter 可用
 */
import { createApp } from 'vue'
import type { Router } from 'vue-router'
import { getVirtualNum } from '../api'
import { formatMobliePhone } from '../utils/format'
import useCustomerCodeStore from './useCustomerCodeStore'
import ContactPhoneDialog from '../components/contact-phone-dialog.vue'

type ContactPhoneDialogInstance = {
  checkVirtualPhone?: (customerCode: string) => Promise<any>
  showDialog: (data: Record<string, any>) => Promise<any>
}

let app: ReturnType<typeof createApp> | null = null
let instance: ContactPhoneDialogInstance | null = null

function install(router?: Router) {
  if (!instance) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    app = createApp(ContactPhoneDialog)
    if (router) {
      // 编程式挂载无路由上下文, 注入以支持弹窗内实名认证跳转
      app.use(router)
    }
    instance = app.mount(container) as unknown as ContactPhoneDialogInstance
  }
  return instance
}

/** 用当前登录手机号获取该客户编码的虚拟号, 需要实名时跳转实名页(对齐老 checkVirtualPhone) */
async function checkVirtualPhone(customerCode: string, router?: Router) {
  try {
    const { phone } = useCustomerCodeStore()
    const contactPhone = formatMobliePhone(phone.value)
    const outPhone = contactPhone?.replace(/\s/g, '')
    const res = await getVirtualNum({
      customer: customerCode,
      outPhone,
      from: '10',
      needVerifyAuthName: true,
    })
    if (res.code === 0 && res.data) {
      if (res.data?.needRealName) {
        router?.push({
          path: '/admin/realname',
          query: {
            microForceUpdate: '10',
            needQuerySave: 'false',
            phone: outPhone,
            targetRoute: '/admin/user',
          } as any,
        })
        return false
      }
      return res.data
    }
    return false
  } catch (e) {
    console.log(e)
    return false
  }
}

/**
 * 打开联系电话弹窗
 * @param payload { role, customerCode, trackName, changeTrackName, ... }
 * @returns 是否成功唤起弹窗
 */
export async function showContactPhoneDialog(payload: Record<string, any>, router?: Router) {
  const instance = install(router)
  const result = await checkVirtualPhone(payload.customerCode, router)
  if (!result) return false
  instance.showDialog({ virtualNum: result?.virtualNum, ...payload })
  return true
}
