## Why

将 H5 项目（netc-h5-modules）中的"申请绑定其他公司"页面迁移到 Taro 多端小程序项目（kye-miniapp），实现原生小程序体验。当前该功能仅在 H5 端可用，需要扩展到微信/支付宝小程序平台，提升用户在小程序端的绑码体验。

**业务价值：**
- 用户可在小程序端直接申请绑定多家公司，无需跳转 H5
- 统一多端体验，降低维护成本
- 支持客户编码联想推荐、批量校验、风控验证等完整功能

## What Changes

### 核心功能迁移
1. **页面组件转换** - 将 H5 Vue 组件转换为 Taro + Vue3 + TypeScript 格式
2. **组件库替换** - Vant UI → kye-miniUI（ky-field、ky-button、ky-popup 等）
3. **API 接口对接** - 复用现有 customerCode API 模块，新增缺失接口
4. **样式适配** - SCSS 适配小程序环境（px 单位、BEM 命名、scoped 样式）

### 功能特性
- 动态表单：支持 1-9 个客户编码输入框
- 联想推荐：输入时展示推荐公司列表
- 实时校验：失焦时校验客户编码有效性
- 批量检查：提交前黑名单批量校验
- 风控支持：图形验证码集成
- 页面守卫：未提交离开确认提示

## Capabilities

### New Capabilities
- `apply-bind-other-company`: 申请绑定其他公司功能模块，包含表单填写、校验、提交全流程

### Modified Capabilities
- `customer-code-api`: 新增 `getFrontRecommendCustomer`、`applyBindOtherCustomerCheck`、`bindOtherCustomerList`、`batchCheckBlackCustomerCode` 接口定义

## Impact

### 影响范围
- **新增文件**：
  - `src/modules/user/pages/customer-code/apply/index.vue` - 主页面组件
  - `src/modules/user/pages/customer-code/apply/index.scss` - 页面样式
  - `src/modules/user/pages/customer-code/apply/index.config.ts` - 页面配置
  - `src/modules/user/pages/customer-code/apply/assets/` - 图片资源（required_icon.png）

- **修改文件**：
  - `src/modules/user/apis/customerCode/index.ts` - 新增 4 个 API 接口
  - `src/modules/user/apis/customerCode/types.ts` - 新增相关类型定义
  - `src/wx.config.ts` / `src/alipay.config.ts` - 注册新页面路由（可选）

- **依赖组件**：
  - `@kye-netc/kye-miniui` - ky-field、ky-button、ky-popup
  - `@public/components/base/captcha` - 图形验证码
  - `customer-code/components/shared/Alert.vue` - 确认弹窗

### 技术约束
- 必须使用 TypeScript，类型定义明确
- 遵循项目代码规范（kye-miniui 组件、px 单位、BEM 命名）
- 兼容微信/支付宝/H5 三端
- 表单使用 ky-form + ky-field 实现统一校验

### 风险评估
- **低风险**：纯新增功能，不影响现有模块
- **兼容性**：需测试三端表现一致性
- **性能**：联想列表数据量可控（< 20 条），无性能问题
