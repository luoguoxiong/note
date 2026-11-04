# Knowledge Delta

## 是否需要更新知识库

需要，已更新。

## 影响代码范围

- `src/modules/tools/delivery-area/**`

## 需要更新的知识页

- `knowledge/libraries.md`
- `knowledge/changelog.md`

## 本次应沉淀的长期知识

- 本次仅在配送范围页内新增一次性的留资卡片、内联表单转场和结果页跳转，不改变模块职责、公共能力、请求层、状态管理、路由、WebView/Native 桥接或子仓库边界。
- 优惠券字段 `couponStatus`、`couponNumber` 是本次实现预留字段，接口确认后再接入，不作为长期知识沉淀。
- MiniUI `ky-input` 的 Attributes 和使用注意事项已沉淀到 `knowledge/libraries.md`，后续输入框样式应优先使用组件 API，例如 `border="all"`、`:is-error`、`clearable`。
- 账号切换后的留资入口兜底刷新限定在配送范围页内部：页面使用本地状态控制入口展示，支持配送时复用现有新客活动接口校准资格；该实现不改变长期公共状态管理约定。

## 不更新知识库的原因

页面功能变更仍限定在 `src/modules/tools/delivery-area` 内部；但本次实现暴露了 MiniUI `ky-input` 使用约定，已按用户要求补充到依赖库知识页。

## 归档前检查

- [x] 已根据本文件更新对应知识页，或已说明无需更新。
- [x] 已追加 `knowledge/changelog.md`，或已说明无需追加。
- [x] 涉及长期决策时，已更新 `knowledge/decisions/index.md`。
- [x] 涉及路径映射变化时，已更新 `knowledge/manifest.json`。
