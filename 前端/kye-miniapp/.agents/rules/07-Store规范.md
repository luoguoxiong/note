# Store 规范

## Pinia 模式

使用 `defineStore` 定义 Store。

```typescript
import { defineStore } from 'pinia'

export const useXxxStore = defineStore('xxx', {
  state: () => ({ data: null as XxxType | null }),
  getters: { hasData: (state) => !!state.data },
  actions: { async fetchData() { /* ... */ } },
})
```

## Store 分层

### 全局 Store（src/store/）

| Store 名 | 文件 | 说明 |
|----------|------|------|
| useUserGlobalStore | user.ts | **核心** - 用户数据（customerInfo/userInfo/token/phone/isNew），含持久化 |
| useOrderStore | order.ts | 下单预加载配置 |
| usePlatformStore | platform.ts | 平台信息（isWxApp/aplusUserData/极光推送） |
| useThemeStore | theme.ts | 主题（灰度/TabBar 图标/背景图），服务端获取 |
| useNetworkStore | useNetworkStore.ts | 网络状态（isConnected/networkType） |

### 页面级 Store

放置在各个模块的 `store/` 目录下，仅在该模块内使用。

## 使用规范

- 全局数据使用全局 Store（单例模式）
- 页面级数据使用页面级 Store
- Store 操作使用 Pinia defineStore 模式，不使用 Vuex
- 持久化数据通过 storage 模块管理
