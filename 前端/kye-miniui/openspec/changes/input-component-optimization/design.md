## Context

### 现有架构分析

当前 input 组件采用三层架构：
- `index.vue` - 入口组件，负责平台分发
- `input.vue` - 小程序端实现
- `input-h5.vue` - H5端实现

**现有问题：**

1. **代码复用性差**：`input.vue` 和 `input-h5.vue` 约 60% 逻辑重复（状态管理、格式化、清空逻辑等）

2. **逻辑分散**：平台适配、格式化、焦点管理、maxlength 适配等逻辑交织在组件内部

3. **hooks 职责不清晰**：现有 hooks（`useCustomInput`, `useInputFocus`, `useInputMaxLength`, `useInputPlatForm`, `usePcInputHooks`）职责边界模糊

4. **功能缺失**：缺少前缀/后缀插槽、字数统计显示等常用功能

5. **性能问题**：多个独立的 debounce 调用、频繁的 nextTick/setTimeout

### 约束条件

- 兼容现有 API，不做破坏性变更
- 支持微信小程序、支付宝小程序、H5 三端
- 保持与 Taro 4.x 的兼容性

## Goals / Non-Goals

**Goals:**
- 提取通用逻辑到可复用的 composables
- 统一平台适配层，简化端差异处理
- 添加前缀/后缀插槽、字数统计等功能
- 优化性能，减少不必要的计算和生命周期调用
- 提升代码可维护性和可测试性

**Non-Goals:**
- 不改变现有公共 API（props/events）
- 不引入新的第三方依赖
- 不重构其他组件

## Decisions

### 决策 1：架构重构 - 采用 Composable 模式

**方案：** 将组件逻辑提取为独立的 composables

| Composable | 职责 |
|------------|------|
| `useInputCore` | 核心输入逻辑（value 管理、input 事件处理） |
| `useInputFocus` | 焦点状态管理、聚焦/失焦处理 |
| `useInputFormatter` | 输入格式化、debounce 处理 |
| `useInputValidation` | 表单验证、错误状态管理 |
| `useInputPlatform` | 平台适配、端能力检测 |
| `useInputClear` | 清空按钮逻辑 |

**理由：**
- 提高代码复用性，各端共享逻辑
- 单一职责，便于测试和维护
- Vue 3 推荐的最佳实践

**替代方案考虑：**
- Mixins：不支持 TypeScript 类型推断，不推荐
- Class 组件：与 Vue 3 Composition API 风格不符

---

### 决策 2：平台适配层设计

**方案：** 在 `index.vue` 中统一处理平台分发，各端组件只负责渲染

```
index.vue (平台分发 + 通用逻辑)
    ├── input.vue (微信/支付宝小程序渲染)
    ├── input-h5.vue (H5 渲染)
    └── inputAlipay.vue (支付宝特殊处理)
```

**理由：**
- 通用逻辑只维护一份
- 渲染层专注于各端差异
- 便于后续扩展新平台

---

### 决策 3：状态管理优化

**方案：** 使用 reactive 替代多个独立 ref，统一管理组件状态

```typescript
const state = reactive({
  focus: false,
  currentValue: '',
  isError: false,
  isClearing: false,
})
```

**理由：**
- 减少 ref 声明数量
- 便于批量状态更新
- 更好的类型推断

---

### 决策 4：Debounce 统一管理

**方案：** 将所有 debounce 函数集中管理，避免重复创建

```typescript
const debounces = {
  input: debounce(handleInput, 200),
  blur: debounce(handleBlur, 100),
  error: debounce(handleError, 400),
}
```

**理由：**
- 统一配置和管理
- 便于统一取消（如清空时）
- 减少内存占用

---

### 决策 5：新增功能设计

#### 前缀/后缀插槽

**设计：**
- `prefix` 插槽：输入框左侧内容
- `suffix` 插槽：输入框右侧内容（在清空按钮之前）
- 保持与 Element Plus、Ant Design Vue 等主流组件库一致

#### 字数统计

**设计：**
- 支持 `showWordLimit` 属性开启
- 自动根据 `maxlength` 计算剩余字数
- 支持自定义显示格式

#### 内置验证

**设计：**
- 支持 `rules` 属性传入验证规则
- 内置常用验证器（required, minLength, maxLength, pattern, email, phone）
- 支持自定义验证函数

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| 重构引入回归问题 | 高 | 编写单元测试覆盖核心逻辑 |
| 性能优化可能引入兼容性问题 | 中 | 保留原有行为的配置开关 |
| 新功能增加学习成本 | 低 | 保持向后兼容，新功能默认关闭 |
| hooks 过多导致管理复杂 | 中 | 明确职责边界，提供清晰的文档 |

## Migration Plan

1. **Phase 1**: 提取通用逻辑到 composables，保持现有 API 不变
2. **Phase 2**: 重构 `input.vue` 和 `input-h5.vue` 使用新的 composables
3. **Phase 3**: 添加新功能（前缀/后缀插槽、字数统计）
4. **Phase 4**: 更新文档和示例

**回滚策略**：每个阶段保持向后兼容，可随时回滚到上一版本