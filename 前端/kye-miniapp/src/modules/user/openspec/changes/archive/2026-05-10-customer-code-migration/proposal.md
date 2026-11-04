## Why

目前跨越寄件外部应用各端已完成【多端原生化】优化，但客户编码绑定/更换/切换功能仍通过 H5 WebView 加载，导致**响应时间超过 200ms**，严重影响用户绑码效率和体验。本次迁移将 H5 项目 (`netc-customer-code`) 的客户编码功能完整迁移至小程序原生项目 (`kye-miniapp-new`) 的 `src/modules/user` 模块，采用 **Vue 3 + TypeScript + Pinia** 技术栈重构，实现**性能提升、代码规范、可维护性增强**三大目标。

## What Changes

### 核心功能迁移（3大模块）

- **绑定客户编码 (BindCode)**
  - 完整迁移绑定表单：客户编码输入、密码输入（含忘记密码）、姓名输入
  - 集成图形验证码校验（复用当前项目 `captcha` 组件）
  - 支持申请专属商务（点击提示"暂不支持"）
  - 包含错误提示气泡、黑名单限制绑码等异常处理

- **更换客户编码 (ChangeCode)**
  - 展示当前绑定公司信息卡片
  - 保留"切换下单部门"功能（快速寄件页场景）
  - 申请绑定其他公司入口

- **切换客户编码 (SwitchCode)**
  - 已绑定公司列表展示
  - 单个解绑/一键解绑操作
  - 切换当前绑定公司
  - 冻结解绑异常处理

### 技术架构升级

- **状态管理**: MobX → **Pinia Store**（符合项目规范）
- **语言规范**: JavaScript → **TypeScript**（完善类型定义）
- **组件模式**: React JSX → **Vue 3 Composition API**
- **代码复用**: 提取公共 **Hooks**（表单逻辑、API调用、校验规则）
- **双模式支持**: 弹窗(Popup)/页面(Page)**共用核心组件，避免重复代码**
- **枚举规范**: 使用 **Enum** 清晰表达状态、类型、角色等变量含义
- **埋点系统**: 完整迁移埋点上报（参考实名认证模块实现）

### 组件复用策略

- ✅ 复用现有 `@/public/components/business/contact-business` 联系商务组件（暂不启用）
- ✅ 复用现有 `@/public/components/base/captcha` 图形验证码组件
- ✅ 复用 `@kye-netc/kye-miniui` UI 组件库（ky-popup, ky-button 等）
- ✅ 复用 `@/public/utils/reportUtil` 埋点工具函数

## Capabilities

### New Capabilities

- **bind-customer-code**: 客户编码绑定功能模块，包含表单填写、校验、提交、图形验证码集成、异常处理（黑名单、重复绑定确认）
- **change-customer-code**: 更换客户编码功能模块，包含当前绑定信息展示、部门切换、申请绑定其他公司
- **switch-customer-code**: 切换客户编码功能模块，包含公司列表管理、解绑操作、切换绑定、冻结处理
- **customer-code-store**: 客户编码 Pinia 状态管理，包含绑定数据、公司列表、UI状态管理
- **customer-code-hooks**: 客户编码公共 Hooks 集合，包含表单逻辑、API封装、校验规则提取
- **customer-code-report**: 客户编码埋点上报模块，完整迁移 H5 埋点事件

### Modified Capabilities

- _(无现有能力需要修改，这是全新功能迁移)_

## Impact

### 影响范围

#### 受影响的代码/模块

- **新增目录**: `src/modules/user/customer-code/`
  - `components/` - 绑定/更换/切换核心组件及共享子组件
  - `pages/` - 页面入口（bind/change/switch）
  - `store/` - Pinia Store（数据+业务逻辑）
  - `hooks/` - 公共 Hooks（与 store 无关的纯逻辑）
  - `api/` - API 接口层
  - `constants/` - 枚举常量定义
  - `types/` - TypeScript 类型定义
  - `report/` - 埋点上报

- **复用现有组件**:
  - `src/public/components/base/captcha/` - 图形验证码
  - `src/public/components/business/contact-business/` - 联系商务（暂不启用）
  - `src/public/utils/reportUtil.ts` - 埋点工具函数

- **参考现有实现**:
  - `src/modules/user/pages/realname/` - 实名认证模块（Store/Hooks/Report 模式）
  - `src/store/user.ts` - 用户全局 Store（customerCode getter）

#### 外部依赖

- **后端 API**: 18个接口完整迁移（无变更）
  - 绑定客户编码: `web.uam.webUam.uamAppUser.bindCustomerCodeFromClient`
  - 校验客户编码: `web.uam.customer.checkCustomerCode`
  - 解绑: `web.uam.uamAppUser.unbindByCustomerCode`
  - 一键解绑: `web.uam.webUam.uamAppUser.unbindRelationCustomerCode`
  - 公司列表: `web.uamAppUser.getUserBindableCompanyList`
  - 部门相关: `getMoreDepartment`, `changeCurrentDepartment`
  - 其他辅助接口...

- **无跨团队影响**: 仅影响 user 模块内部

### 性能目标

- ⚡ **响应时间**: 所有页面跳转及提交 **< 200ms**（相比 H5 WebView 显著提升）
- 📱 **兼容性**: 各类机型及小程序电脑桌面端正常展示
- 🔒 **安全性**: 保留原有安全校验逻辑（图形验证码、黑名单检测）

### 风险评估

| 风险项                  | 等级 | 应对策略                                   |
| ----------------------- | ---- | ------------------------------------------ |
| MobX → Pinia 迁移复杂度 | 中   | 参考 realName Store 模式，逐步转换         |
| React → Vue 语法差异    | 低   | 核心逻辑保持一致，仅转换语法               |
| 双模式（弹窗/页面）复用 | 中   | 抽离核心组件为纯逻辑组件，容器组件处理布局 |
| 埋点完整性              | 低   | 严格对照 H5 埋点清单逐一迁移               |
| 图形验证码集成          | 低   | 直接复用现有 captcha 组件                  |
