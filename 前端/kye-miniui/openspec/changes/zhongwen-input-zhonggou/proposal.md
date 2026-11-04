## Why

现有 input 组件存在以下问题：代码复用性差（input.vue 和 input-h5.vue 存在大量重复逻辑）、逻辑分散（平台适配、格式化、焦点管理等逻辑交织在一起）、功能不完整（缺少前缀/后缀插槽、字数统计显示等常用功能）、性能有待优化（多个 debounce 调用、频繁的 nextTick/setTimeout）。这些问题影响了开发效率、维护成本和用户体验，需要进行系统性重构优化。

## What Changes

- 重构组件架构，提取通用逻辑到 composables，提升代码复用性
- 简化平台适配逻辑，统一处理各端差异
- 增强功能完整性：添加前缀/后缀插槽、字数统计显示、内置表单验证
- 优化性能：合并重复计算、减少不必要的生命周期调用
- 统一代码风格和命名规范，提升可维护性

## Capabilities

### New Capabilities
- `qianzhui-houzhui-chacao`: 支持前缀和后缀插槽功能
- `zishu-tongji`: 增强字数统计显示功能
- `biaodan-yanzheng`: 内置表单验证能力

### Modified Capabilities
- `xin-shuru-luoji`: 重构核心输入逻辑，提升复用性和可维护性
- `pingtai-guapei`: 优化平台适配逻辑

## Impact

- **packages/__components/input/src/** - 核心组件文件
- **packages/__components/input/src/hooks/** - 自定义 hooks
- **packages/__components/input/src/types.ts** - 类型定义
- **docs/components/input.md** - 组件文档