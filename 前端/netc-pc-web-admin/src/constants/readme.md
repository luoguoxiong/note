# 常量、枚举说明

代码中不允许出现魔法数字和魔法字符串，常量和枚举必须在此维护。此处按业务分文件，然后在 index.ts 中统一导出。
[图片](https://doc.ky-tech.com.cn/doc-sdk/uploader/f/XaN3Zd7aNphczYI0.png)

```ts
// http 相关
export * from './http'

// 校验相关
export * from './check'
```

## 常量

常量名需要全大写

```ts
export const HELLO_WORLD = 'HELLO WORLD'
```

## 枚举

枚举命名使用 UpperCamelCase，即首字母大写；枚举值使用 CONSTANT_CASE，全大写

```ts
export enum SdkType {
  WECHAT_OFFICAL_ACCOUNTS = 1, //微信公众号
  WECHAT_MINI_PROGRAMS = 2, //微信小程序
  WECOM_COM_SIGN = 3, //企业微信(企业签名)
  WECOM_APP_SIGN = 4, //企业微信(应用签名)
}
```
