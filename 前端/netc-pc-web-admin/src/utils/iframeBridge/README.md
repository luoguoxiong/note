# iframeBridge 通信桥接层

从 `netc-pc-web` 迁移至 `netc-pc-web-admin` 的 iframe 通信桥接模块。

## 文件说明

| 文件 | 说明 |
|------|------|
| `index.ts` | 主入口，IframeBridge 类，管理 iframe 生命周期及通信 |
| `constants.ts` | 事件类型和动作类型常量定义 |
| `business.ts` | 业务数据获取（用户信息、token、客户编码、实名信息） |
| `actionPageApi.ts` | 页面交互能力调度 |
| `interaction.ts` | 交互事件处理（退出登录、弹窗确认） |
| `originalMessage.ts` | 原始 postMessage 通信，用于未接入 iframeBridge 的场景 |
| `build/postmate.es.ts` | Postmate 库（TypeScript 版本） |

## 使用方式

```typescript
import IframeBridge from '@/utils/iframeBridge'

const bridge = new IframeBridge()
bridge.loadIframe({
  vm: this,
  container: document.getElementById('iframe-container'),
  url: 'https://example.com/child-app',
  model: { someData: 'value' },
  name: 'my-iframe',
})
```

## 迁移说明

- 原 `netc-pc-web` 项目为 JS 版本，迁移后改为 TS 版本
- `business.ts` 中的接口调用改用 admin 项目的 API（`@/apis/user`）
- `interaction.ts` 的弹窗改用 `element-plus` 的 `ElMessageBox`
- `actionPageApi.ts` 中的消息中心相关功能为占位实现，需根据实际项目补充
- `postmate.es.ts` 保留原 Postmate v1.5.2 逻辑，增加 TypeScript 类型
