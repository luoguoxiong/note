/**
 * 客户编码校验(TS 版)
 * 来源: customer-code/validate-customer-code.js
 *  - element-ui -> element-plus(校验器签名不变)
 *  - 请求层: 老项目 code!==0 默认 resolve, 新请求层 reject(reject 值携带 code/data/msg)
 */
import { showVerifyCodeDialog } from './verify-code'
import { ErrorResultCode, VerifyDialogType } from '../consts'
import { checkCustomerCode } from '../api'

/**
 * 客户编码风控校验(滑块场景自动重试)
 * @param customerCode 客户编码
 */
export async function validateCustomerCode(customerCode: string) {
  try {
    await checkCustomerCode({ customerCode })
  } catch (err: any) {
    if (err.code !== ErrorResultCode.VERIFY_CODE || err.data?.type !== VerifyDialogType.SLIDE_BLOCK) {
      throw err
    }
    const result = await showVerifyCodeDialog(err.data, { type: VerifyDialogType.SLIDE_BLOCK })

    if (!(result as any)?.safeVerifyId) {
      throw err
    }

    await checkCustomerCode({ customerCode, safeVerifyId: (result as any).safeVerifyId })
  }
}

/**
 * element-plus 表单校验器: 客户编码(风控滑块场景自动重试)
 * 校验器签名需同步返回 void, 异步逻辑在 validateCustomerCode 内部完成
 */
export function customerCodeRule(_rule: unknown, value: string, callback: (error?: Error | string) => void) {
  if (!value) {
    return callback('请输入客户编码')
  }
  validateCustomerCode(value)
    .then(() => {
      callback()
    })
    .catch((err: any) => {
      console.error(err)
      callback(err.msg)
    })
}
