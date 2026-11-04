# netc-agreement

# 协议公共组件

**配合 `netc-form` 使用**

```html
<netc-form>
  <netc-agreement
    v-model="isAgreement"
    title="《电子运单契约条款》"
    help-id="4"
    prop="order-agreement"
    popover-message="请先阅读并勾选协议"
  />
</netc-form>
```

### Props

| 参数           | 说明               | 类型   | 默认值             |
| -------------- | ------------------ | ------ | ------------------ |
| popoverMessage | 提示框文字         | String | 请先阅读并勾选协议 |
| placement      | 提示框位置         | String | top-start          |
| prop           | 类似于 name 的作用 | String | agreement          |
| helpId         | 协议 id            | String | --                 |

## 配置

请在 `@order-public-sub-public/configs/agreement` 文件内维护相关协议，方便统一管理

```js
export const waybill = {
  title: '《电子运单契约条款》',
  id: '4',
}
```

使用方式

```html
<netc-form>
  <netc-agreement v-model="isAgreement" type="waybill" prop="order-agreement" popover-message="请先阅读并勾选协议" />
</netc-form>
```
