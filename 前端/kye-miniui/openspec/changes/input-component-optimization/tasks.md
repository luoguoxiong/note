## 1. Composables 重构

- [ ] 1.1 创建 `useInputCore` composable - 核心输入逻辑
- [ ] 1.2 创建 `useInputFocus` composable - 焦点状态管理
- [ ] 1.3 创建 `useInputFormatter` composable - 格式化处理
- [ ] 1.4 创建 `useInputValidation` composable - 表单验证
- [ ] 1.5 创建 `useInputPlatform` composable - 平台适配
- [ ] 1.6 创建 `useInputClear` composable - 清空按钮逻辑

## 2. 类型定义更新

- [ ] 2.1 更新 `types.ts` - 添加新 props（prefix/suffix 插槽、rules 验证规则）
- [ ] 2.2 添加验证规则类型定义

## 3. 组件重构

- [ ] 3.1 重构 `input.vue` - 使用新 composables
- [ ] 3.2 重构 `input-h5.vue` - 使用新 composables
- [ ] 3.3 优化 `index.vue` - 统一平台分发逻辑

## 4. 新功能实现

- [ ] 4.1 实现前缀插槽（prefix slot）
- [ ] 4.2 实现后缀插槽（suffix slot）
- [ ] 4.3 实现字数统计显示功能
- [ ] 4.4 实现内置表单验证功能

## 5. 样式更新

- [ ] 5.1 更新 `index.scss` - 添加前缀/后缀插槽样式
- [ ] 5.2 添加字数统计样式
- [ ] 5.3 更新 H5 端样式

## 6. 文档更新

- [ ] 6.1 更新 `docs/components/input.md` - 添加新功能文档
- [ ] 6.2 添加前缀/后缀插槽示例
- [ ] 6.3 添加字数统计示例
- [ ] 6.4 添加表单验证示例

## 7. 测试验证

- [ ] 7.1 验证微信小程序端功能正常
- [ ] 7.2 验证支付宝小程序端功能正常
- [ ] 7.3 验证 H5 端功能正常
- [ ] 7.4 验证新功能（前缀/后缀插槽、字数统计、验证）
- [ ] 7.5 验证向后兼容性