# 寄收地址数据流快照

> 记录于拉取协作者代码前。以下文件都可能被覆盖。

---

## 1. `components/sendAndReceive/hooks/useState.ts`

```ts
import { ref } from 'vue'

// 图标映射
export const ICON_MAP = { ... }

// 寄件地址
const sendAddress = ref('')
export const getSendAddress = () => sendAddress
export const setSendAddress = (val: string) => {
  sendAddress.value = val
}

// 收件地址
const receiveAddress = ref('')
export const getReceiveAddress = () => receiveAddress
export const setReceiveAddress = (val: string) => {
  receiveAddress.value = val
}
```

**关键**: 地址是模块级 `ref<string>`，不是结构化 `{province, city, county, detailAddress}`

---

## 2. `store/index.ts` 关键状态

```ts
interface FreightTimeState {
  // ❌ 已移除 sender / receive
  productInfo: ProductInfo
  goodsTime: GoodsTime
  addedService: AddedService
  queryResult: ServiceType[]
  queryLoading: boolean
  bindCustomerStatus: string
  restrictResult: RestrictResult | null
  onlineCustomerInfo: OnlineCustomerInfo | null
  sendCouponResult: Record<string, any>
  isNewCustomer: boolean
  resourceFlag: boolean
  couponList: Array<{ receiveSource: string; activityId: string; couponCount: string }>
  showSearchBtnBadge: boolean
  showContactPopup: boolean
  contactPhone: string
}

// reset() 通过 setSendAddress('') / setReceiveAddress('') 清空地址
import { setSendAddress, setReceiveAddress } from '../components/sendAndReceive/hooks/useState'
```

---

## 3. `pages/index/hooks/useFreightTimeQuery.ts` 地址读写方式

```ts
import { getSendAddress, getReceiveAddress } from '../../../components/sendAndReceive/hooks/useState'

const sendAddress = getSendAddress()
const receiveAddress = getReceiveAddress()

// 校验
if (!sendAddress.value) { /* Toast */ }
if (!receiveAddress.value) { /* Toast */ }

// 参数组装（当前 mock）
sender: {
  province: '广东省', city: '深圳市', county: '宝安区',
  detailAddress: sendAddress.value || '沙井新沙路510号沙井镇人民政府',
}
receive: {
  province: '江苏省', city: '南京市', county: '雨花台区',
  detailAddress: receiveAddress.value || '雨花街道玉兰路98号南京南站',
}
// goodsTime 也 mock: '2026-06-03 14:00:00'
```

---

## 协作者代码拉取后需要对齐的点

1. 如果协作者**把地址写入 Store** → 恢复 Store 的 `sender`/`receive`，改用 Store 读写
2. 如果协作者**继续用 hooks** → 保持当前方式，但要确认 store 中的 import 路径没断
3. 如果协作者**改了 useState 的结构**（如 province/city 拆分） → 需同步更新 buildServiceTimeParams
