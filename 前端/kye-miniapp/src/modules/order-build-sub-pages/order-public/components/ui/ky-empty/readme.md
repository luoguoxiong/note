# 缺省页

## props

```ts
/**
 * @description 缺省页类型
 */
export interface EmptyProps {
  type: EmptyTypeEnum
}

/**
 * @description 缺省页类型
 */
export enum EmptyTypeEnum {
  'DATA' = 'data', //无数据
  'COUPON' = 'coupon', //无优惠券
  'ADDRESS' = 'address', //无地址
  'SEARCH' = 'search', //无搜索结果
  'WAYBILL' = 'waybill', //无运单
  'NETWORK' = 'network', //无网络
  'CUSTOM' = 'custom', //自定义
}
```

## 使用

### 非自定义类型

```tsx
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import { EmptyTypeEnum } from '@order-public-sub-public/constants'

<KyEmpty :type="emptyType">
    <Button type="primary">一个按钮而已</Button>
</KyEmpty>

const emptyType = EmptyTypeEnum.ADDRESS
```

### 自定义类型

```tsx
<KyEmpty :type="emptyType" :custom-config="{ image: '', description: '666' }">
  <Button type="primary">一个按钮而已</Button>
</KyEmpty>

const emptyType = EmptyTypeEnum.CUSTOM
```

### 自定义图片宽高，覆盖 empty 宽高

```scss
:deep(.empty) .van-empty__image {
  width: 180px;
  height: 280px;
}
```
