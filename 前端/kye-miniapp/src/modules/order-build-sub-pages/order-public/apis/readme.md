# api

所有的接口在该目录维护，接口按业务分目录保存，接口统一在 index.ts 导出，类型统一在 type.d.ts 导出，这样引用的时候就可以统一从入口引入，而不是从文件夹中引入。

## 入口 index.ts

```ts
/**
 * 统一导出接口
 */

// hello world
export * from './helloWorld'

// sdk
export * from './sdk'

// user
export * from './user'
```

## 入口 types.d.ts

```ts
/**
 * 统一导出类型
 */

// sdk
export * from './sdk/types'

// user
export * from './user/types'
```

## 分类

每个目录都有自己的 index.ts 和 types.d.ts

### 内部 index.ts

具体的接口在此维护，每个接口函数必须有入参类型和返回类型

```ts
import { http } from '@order-public-sub-public/utils/request'
import { SDK_TYPE, SdkSign } from './types'

/**
 * @description 获取微信jssdk签名
 * @param params
 * @returns
 */
export const getJsSdkSign = (params: { url: string; type?: SDK_TYPE }) => {
  return http<SdkSign>('web.ssoWeChatTool.getJsSdkSign', params)
}
```

### 内部 types.d.ts

接口使用的特定类型在此定义，index.ts 导入使用

```ts
import { SDK_TYPE as SDK_TYPE_ENUM } from '@order-public-sub-public/constants'

export type SDK_TYPE = keyof typeof SDK_TYPE_ENUM

export interface SdkSign {
  noncestr: string
  timestamp: string
  signature: string
  appid: string
}
```
