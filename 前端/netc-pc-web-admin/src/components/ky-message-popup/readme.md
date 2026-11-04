# ky-message-popup

PC 端广告/通知弹窗组件，按 pageCode 拉取广告配置，根据 `areaStyleCode` 弹出对应弹窗。

## 来源

迁移自 `netc-pc-web/src/components/ky-message-popup/`，原 10 个文件合并重新设计为：

| 旧文件 | 新文件 | 变更 |
|---|---|---|
| `index.vue` + `message-popup.js` | `index.vue` | 合并为 Vue 3 `<script setup>` SFC，对外暴露 `loadNotice` |
| `activity-popup.vue` | `activity-popup.vue` | Vue 3 重写，复用 `usePopupActions` composable |
| `text-image-popup.vue` | `text-image-popup.vue` | Vue 3 重写，移除已注释的 `AdjustPriceNotice` 子组件 |
| `animation.js` | `animation.ts` | 类名 `.v-modal` → `.el-overlay`；移除 `activeMenuHandle` 外部菜单回调 |
| `instance.js` | （废弃） | Vue 2 命令式 plugin 已被 ref 调用替代 |
| `h5-popup.vue` | 不在此处 | 已单独迁到 `src/views/admin/components/header/message-center/h5-popup.vue` |

## 用法

### 1. 模板挂载

在需要弹窗的页面（如 `src/views-iframe/tools/site-query.vue`）挂载组件：

```vue
<template>
  <div>
    <Iframe :message-code="messageCode" @message="getMessage" />
    <MessagePopup ref="messagePopupRef" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import MessagePopup from '@/components/ky-message-popup/index.vue'

const messagePopupRef = ref<InstanceType<typeof MessagePopup> | null>(null)

function getMessage({ type, data }: { type: string; data: string }) {
  if (type === 'loadNotice') {
    messagePopupRef.value?.loadNotice(data)
  }
}
</script>
```

### 2. `loadNotice(pageCode): Promise<boolean>`

- 入参 `pageCode`：业务页 code（如 `pcBranchQuery`、`pcSearch`、`statistical_analysis`），由 iframe 子应用通过 `postMessage({ type: 'loadNotice', data: pageCode })` 通知
- 返回：是否成功弹出（true=已弹出，false=配置为空或 areaStyleCode 不识别）

### 3. `areaStyleCode` 分发表

| areaStyleCode | 弹窗类型 | 子组件 |
|---|---|---|
| `PC_POPUP_004` | 纯图活动弹窗 | `activity-popup.vue` |
| `PC_POPUP_005` | 图文弹窗 | `text-image-popup.vue` |
| `PC_POPUP_006` | 图文弹窗 | `text-image-popup.vue` |
| `PC_POPUP_MODIFY_PRICE_006` | 图文弹窗（调价通知，原走 AdjustPriceNotice，本次未实现，仍走图文兜底） | `text-image-popup.vue` |

## 文件结构

```
src/components/ky-message-popup/
├── index.vue              # 入口：整合两个子弹窗，对外暴露 loadNotice
├── activity-popup.vue     # 纯图弹窗（PC_POPUP_004）
├── text-image-popup.vue   # 图文弹窗（PC_POPUP_005/006/MODIFY_PRICE_006）
├── use-popup-actions.ts   # 公共 composable：跳转/二次确认/上报/不再提醒
├── animation.ts           # 退场缩放动画（适配 element-plus .el-overlay）
├── types.ts               # 内部类型 + AREA_STYLE_CODE 分发判断
├── index.scss             # 全局样式占位（入口无视觉元素）
├── readme.md              # 本文件
└── imgs/
    ├── selected-icon.svg     # 不再提醒勾选态
    └── unselected-icon.svg   # 不再提醒未勾选态
```

## 依赖

- `vue` / `vue-router` / `element-plus` / `@element-plus/icons-vue` / `dayjs`
- `@/utils/native`：`isClientMode` / `getVersion` / `nativeOpenUrl`
- `@/utils/micro-utils` 的 `urlContact`：URL 参数拼接
- `@/views/admin/components/header/eventBus`：替代旧 `$bus.emit('selfTabName')` 与 `store.commit('notice/setCurrentPageGroupCode')`
- `@/views/admin/components/header/utils/compareVersions`：壳版本比较
- `@/views/admin/components/header/message-center/hooks/useMessageCenter` 的 `isCRMInformVideoInKuashengClient`
- `@/apis/home`：`getAdvertisementDetails` / `advertisementConfirmByUser` / `eventReport`
- `@/assets/image/little-monkey.png`：图文弹窗默认头部小猴图（从旧项目复制）

## 行为差异说明（相对旧实现）

1. **`eventReport({ eventType: 3 })` 在新项目内被禁用**（`src/apis/home/index.ts` 中 eventReport 直接 return），曝光上报不再生效，但调用点保留以保持代码一致性
2. **`store.commit('notice/setCurrentPageGroupCode')` 改为 `eventBus.emit(EE_EVENT.SELF_TAB_NAME, code)`**，不再依赖 Vuex store（仅 text-image 弹窗的 jumpMode=2 会触发，与旧实现一致）
3. **付款授权曝光埋点** `window.report.sendExpEvent` 改为 `window.$umpOtherReport?.('EXP', { eventCode }, params)`
4. **`AdjustPriceNotice` 子组件不迁**：旧代码相关逻辑已注释，本次保持不实现
5. **`activeMenuHandle` 外部菜单展开回调删除**：未在新项目其他地方接入；如未来需要用 provide/inject 注入
6. **`instance.js` 命令式 plugin 废弃**：统一用 ref + `defineExpose` 调用
7. **`advertisementConfirmByUser` 的 `hideErrMsg` 参数**：新项目 API 封装不再支持第二参数，等价于旧的 `hideErrMsg=false` 行为
8. **富文本 `<a>` 拦截**：旧实现用全局 `document.querySelectorAll('#container a')`，新实现改为 `containerRef` 作用域内查询（更严谨，行为一致）

## 与旧实现保持一致的关键细节

- **h5Link 拼接方向两种弹窗相反**：activity 在 `pushToStyle` 时拼 `kystyle` 参数；text-image 在非 `pushToStyle` 时拼，且 inform-uat / inform / function-feedback 白名单链接不拼
- **二次确认交互**：先隐藏弹窗 → 200ms 后弹确认框；取消后 200ms 恢复弹窗
- **function-feedback 链接**（仅 text-image）：解析 query 参数后跳站内路由 `/admin/function-feedback`
- **buttonIndex 取值**：confirmByUser 上报用后端定义的 `button.buttonIndex`；eventReport 的 buttonName 按数组下标取
- **关闭弹窗上报**：activity 的 buttonIndex 硬编码取 `buttonList[0].buttonIndex`；text-image 不传
- **富文本链接跳转后关闭弹窗**
- **CRM 视频壳版本兼容**：3.0~3.1.0 壳内走 `nativeOpenUrl`，≥V3.1.0 走 message-center
