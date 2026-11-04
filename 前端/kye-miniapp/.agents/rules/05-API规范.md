# API 规范

## 请求封装

统一使用 `http()` 函数，来自 `@public/utils/request`。

```typescript
import { http } from '@public/utils/request'
import type { ReqParams, ResData } from './types'

export const getOrderDetail = (params: ReqParams) => {
  return http<ResData>({ url: '/api/order/detail', data: params })
}
```

## 规范要求

- **禁止直接使用 axios**，统一通过 http() 调用
- API 文件放置在模块的 `apis/` 目录下
- 每个 API 文件对应一个 types 文件定义请求/响应类型
- 接口 URL 使用相对路径，不硬编码环境地址
- 使用环境变量管理不同环境的 API 地址

## 接口类型定义

```typescript
// apis/types.ts
export interface ReqParams {
  id: string
  page?: number
}

export interface ResData {
  list: Item[]
  total: number
}

export interface Item {
  id: string
  name: string
}
```

## 公共 API 模块

`@public/apis/` 下包含 11 个公共 API 子模块：

- aplus（阿里云埋点）
- application（应用信息）
- fs-api（飞书 API）
- home（首页）
- order（下单）
- pop（弹窗）
- push（推送）
- report（上报）
- theme（主题）
- user（用户）
- version（版本）
