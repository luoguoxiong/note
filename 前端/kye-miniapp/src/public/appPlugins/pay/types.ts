/**
 * @Desc: types
 * @Date: 2025/8/18
 */
export interface PayPlugin {
  payAliOrderAsyncWithCallback: (opt: any) => void // 支付-唤起支付宝支付
  payUnifyAsyncWithCallback: (opt: any) => Promise<void> // 支付-唤起银联支付
  onMiniPluginEvent: (listener: (msg: any) => void) => void //支付-消息监听
  offMiniPluginEvent: (listener: (msg: any) => void) => void //支付-取消消息监听
}
