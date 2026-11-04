import Taro from '@tarojs/taro'
import { showDialog } from '@packages/ky-miniui-lib'
import { isAliMiniApp, isWechatEnv } from '@/public/utils/device'

export function copyText(copyText: any) {
  copyText &&
    Taro.setClipboardData({
      data: String(copyText),
      success: () => Taro.showToast({ title: '复制成功', icon: 'none', duration: 2000 }),
      fail: () => {
        Taro.showModal({
          title: '温馨提示',
          content: '复制失败，请前往系统-找到APP-剪切板权限选择始终开启',
          confirmText: '我知道了',
          showCancel: false,
        })
      },
    })
}

const cliBoardKey = 'clipboard-permission'
/**
 * 获取粘贴板权限
 * @param parentClassName 弹框父级类
 * @param userClick 是用户点击操作，优先级最高
 * @param apiWXPermissions 微信是否有调用Taro.getClipboardData方法的权限，调用的时候会有系统的toast。
 * @param apiAPPPermissions APP是否有调用Taro.getClipboardData方法的权限，调用的时候会有系统没有的toast。
 * @returns
 */
export const getClipboardPermission = ({
  parentClassName = '',
  apiWXPermissions = false,
  apiAPPPermissions = true,
  userClick = false,
}) =>
  new Promise(async (resolve) => {
    const cliBoardValue = Taro.getStorageSync(cliBoardKey)
    // 只有不是用户主动触发场景（进入下单首页，查件列表页）才会去看是否有权限
    // 非用户点击时：微信环境无API权限 或 曾拒绝授权 → 拦截

    // 用户主动触发，优先级最高，不受是否有权限限制
    if (!userClick) {
      if (isWechatEnv && !apiWXPermissions) {
        return resolve('')
      }
      if (!isWechatEnv && !apiAPPPermissions) {
        return resolve('')
      }
    }

    //支付宝小程序不用自定义弹框，需求561170
    if (cliBoardValue === '' && !isAliMiniApp) {
      showDialog({
        parentClassName: parentClassName || 'order-page-container',
        zIndex: 1000,
        title: `"跨越速运" 需要剪贴板权限`,
        message: '需要获取您的剪贴板权限，用于智能填写寄件人、收件人、联系电话及地址信息，方便您快捷下单',
        confirmButtonText: '好',
        cancelButtonText: '不允许',
        showCancelButton: true,
      })
        .then(async () => {
          const _cliBoardContent = (await Taro.getClipboardData())?.data || ''
          Taro.setStorage({ key: cliBoardKey, data: true })
          resolve(_cliBoardContent)
        })
        .catch(() => {
          Taro.setStorage({ key: cliBoardKey, data: false })
          resolve('')
        })
      return
    }

    try {
      const _cliBoardContent = (await Taro.getClipboardData())?.data || ''
      resolve(_cliBoardContent)
    } catch (e) {
      if (e?.errMsg?.indexOf('empty content') > -1) {
        resolve('')
      }
    }
  })
