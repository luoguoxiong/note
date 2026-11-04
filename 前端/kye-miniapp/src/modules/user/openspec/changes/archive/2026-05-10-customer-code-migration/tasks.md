## 1. 基础设施搭建

- [x] 1.1 创建项目目录结构 `src/modules/user/customer-code/` 及子目录（components, pages, store, hooks, api, constants, types, report）
- [x] 1.2 定义 TypeScript 类型文件 `types/customer-code.ts`（CompanyInfo, BindForm, ConfigData, DepartmentInfo 等业务实体类型）
- [x] 1.3 定义表单相关类型 `types/form.ts`（ValidationRule, FormError, FormState 等类型）
- [x] 1.4 定义枚举常量 `constants/index.ts`（DisplayMode, BindStatus, ContactRole, AlertType, ApplyScene 等枚举）
- [x] 1.5 定义正则常量 `constants/regular.ts`（手机号、客户编码、姓名等正则表达式）
- [x] 1.6 创建 Pinia Store 骨架 `store/customerCode.ts`（定义 state/getters/actions 结构，实现初始状态和重置逻辑）
- [x] 1.7 创建 Store 类型定义 `store/types.ts`（CustomerCodeState, UIState 等 Store 相关类型）
- [x] 1.8 封装 API 接口层 `api/index.ts`（迁移 H5 的 18 个 API 接口，使用 TypeScript 类型约束参数和返回值）
- [x] 1.9 创建埋点基础函数 `report/index.ts`（参考实名认证模块，封装 exp/clk/other 三类埋点方法）

## 2. Hooks 开发

- [x] 2.1 实现 `hooks/useValidate.ts`（纯校验函数：validateCustomerCode, validatePassword, validateMemberName，包含 API 校验逻辑）
- [x] 2.2 实现 `hooks/useBindForm.ts`（绑定表单 Hook：表单状态管理、字段更新、校验、提交逻辑）
- [x] 2.3 实现 `hooks/useCustomerCode.ts`（API 调用封装 Hook：bindCustomerCode, checkCustomerCode, unbindCustomerCode, getCompanyList 等方法）
- [x] 2.4 实现 `hooks/useCompanyList.ts`（公司列表管理 Hook：获取列表、解绑操作、切换绑定、部门切换逻辑）

## 3. 共享子组件开发

- [x] 3.1 实现 `components/shared/Banner.vue`（顶部 Banner 图片组件，支持不同状态展示）
- [x] 3.2 实现 `components/shared/ApplySection.vue`（申请专属商务区域组件，点击提示"暂不支持"）
- [x] 3.3 实现 `components/shared/BindTag.vue`（当前绑定标签组件，显示"当前绑定"/"当前绑定"标记）
- [x] 3.4 实现 `components/shared/Alert.vue`（通用确认弹窗组件，支持自定义标题、内容、按钮文案）

## 4. 绑定功能核心开发

- [x] 4.1 实现 `components/bind-code/BindCodeForm.vue`（核心绑定表单组件：客户编码输入、密码输入、姓名输入、图形验证码集成、异常处理）
- [x] 4.2 集成图形验证码组件到 BindCodeForm（复用 `@/public/components/base/captcha`，处理验证码成功/失败回调）
- [x] 4.3 实现黑名单限制绑定异常处理（错误码 34000，查询角色并显示提示弹窗）
- [x] 4.4 实现重复绑定确认逻辑（Alert 弹窗，支持取消/继续提交）
- [x] 4.5 实现表单校验气泡提示（按优先级显示错误：客户编码 → 密码 → 姓名）
- [x] 4.6 实现忘记密码功能（调用 userBindIsWebHide 检查权限，跳转或提示）
- [x] 4.7 实现粘贴逻辑优化（去除空格、tab、回车、表情包等特殊字符）

## 5. 更换功能核心开发

- [x] 5.1 实现 `components/change-code/ChangeCodeCard.vue`（当前绑定公司信息卡片组件）
- [x] 5.2 实现部门信息展示逻辑（快速寄件页场景下显示部门和切换按钮）
- [x] 5.3 实现 `components/change-code/SwitchDepartmentPopup.vue`（部门选择弹窗组件）
- [x] 5.4 实现部门切换功能（getMoreDepartment + changeCurrentDepartment API 调用）
- [x] 5.5 实现申请绑定其他公司入口（点击跳转或提示"暂不支持"）

## 6. 切换功能核心开发

- [x] 6.1 实现 `components/switch-code/CompanyList.vue`（已绑定公司列表组件，支持滚动加载）
- [x] 6.2 实现公司项渲染（公司名称、客户编码、当前绑定标记、解绑按钮）
- [x] 6.3 实现切换当前绑定公司（检查权限 → 调用API → 更新列表 → 回调通知）
- [x] 6.4 实现单个解绑功能（查询角色 → 确认弹窗 → 调用API → 更新列表）
- [x] 6.5 实现一键解绑功能（收集非当前公司 → 批量解绑API → 刷新数据）
- [x] 6.6 实现冻结解绑异常处理（错误码 111227，显示冻结提示弹窗）
- [x] 6.7 实现解绑后自动判断是否需要刷新（检查关联权限，触发 onRefresh）
- [x] 6.8 实现切换后自动刷新部门列表（快速寄件页场景，多部门时弹出确认框）

## 7. 双模式容器组件开发

- [x] 7.1 实现 `pages/bind/index.vue` + `index.config.ts`（绑定页面容器：导航栏+BindCodeForm）
- [x] 7.2 实现 `components/bind-code/index.vue`（绑定弹窗容器：ky-popup+BindCodeForm+关闭按钮）
- [x] 7.3 实现 `pages/change/index.vue` + `index.config.ts`（更换页面容器：导航栏+ChangeCodeCard）
- [x] 7.4 实现 `components/change-code/index.vue`（更换弹窗容器：ky-popup+ChangeCodeCard+关闭按钮）
- [x] 7.5 实现 `pages/switch/index.vue` + `index.config.ts`（切换页面容器：导航栏+CompanyList）
- [x] 7.6 实现 `components/switch-code/index.vue`（切换弹窗容器：ky-popup+CompanyList+关闭按钮）
- [x] 7.7 实现模式配置传递（通过 props 或 Store 设置 mode: 'popup' | 'page'）

## 8. 样式适配与优化

- [x] 8.1 迁移并转换 SCSS 样式文件（从 H5 JSX 的 scss 转换为 Vue SFC 的 style）
- [x] 8.2 适配小程序环境样式（rpx 单位、安全区域、键盘适配等）
- [x] 8.3 实现弹窗模式样式（max-height、底部圆角、关闭按钮定位）
- [x] 8.4 实现页面模式样式（全屏布局、导航栏高度、底部安全区）
- [x] 8.5 优化表单交互体验（输入框 focus/blur 动画、错误提示气泡动画）

## 9. 埋点集成

- [x] 9.1 梳理 H5 源码全部埋点事件清单（约 20+ 个事件，含曝光/点击/结果上报）
- [x] 9.2 实现页面曝光埋点函数（exp_customer_code_bind/change/switch_page）
- [x] 9.3 实现按钮点击埋点函数（clk*customer_code_button, clk_customer_code*\*\_button 等）
- [x] 9.4 实现业务结果埋点函数（other_customer_code_bind/change_sub, other_change_departments_success）
- [x] 9.5 实现弹窗曝光埋点函数（exp_customer_code_unbind_confirmpopup, exp_change_departments）
- [x] 9.6 在各组件中集成埋点调用（BindCodeForm/ChangeCodeCard/CompanyList 的所有交互节点）
- [x] 9.7 验证埋点参数完整性（对照 H5 源码逐一核对参数名和值）

## 10. 测试与联调

- [x] 10.1 单元测试：Hooks 逻辑测试（useValidate, useBindForm 校验规则）
- [x] 10.2 单元测试：Store Actions 测试（bindCustomerCode, unbind, switchBind 等核心方法）
- [x] 10.3 集成测试 - 绑定流程：
  - [x] 10.3.1 正常绑定（填写完整表单 → 提交 → 成功）
  - [x] 10.3.2 表单校验失败（空值、格式错误）
  - [x] 10.3.3 图形验证码触发（错误码 264587 type=1）
  - [x] 10.3.4 黑名单限制（错误码 34000）
  - [x] 10.3.5 重复绑定确认
- [x] 10.4 集成测试 - 更换流程：
  - [x] 10.4.1 查看当前绑定信息
  - [x] 10.4.2 部门切换（快速寄件页场景）
  - [x] 10.4.3 申请绑定其他公司
- [x] 10.5 集成测试 - 切换流程：
  - [x] 10.5.1 公司列表展示
  - [x] 10.5.2 切换绑定（有权限/无权限）
  - [x] 10.5.3 单个解绑
  - [x] 10.5.4 一键解绑
  - [x] 10.5.5 冻结解绑（错误码 111227）
- [x] 10.6 双模式测试：
  - [x] 10.6.1 弹窗模式完整流程（打开→操作→关闭）
  - [x] 10.6.2 页面模式完整流程（进入→操作→返回）
  - [x] 10.6.3 两种模式功能一致性验证
- [x] 10.7 性能测试：确保所有操作响应时间 < 200ms
- [x] 10.8 兼容性测试：iOS / Android / 微信小程序电脑桌面端

## 11. 文档与上线准备

- [x] 11.1 编写组件使用文档（Props、Events、Slots 说明，示例代码）
- [x] 11.2 配置路由注册（pages/bind, pages/change, pages/switch 页面路由）✅ 已注册到 wx.config.ts + alipay.config.ts
- [x] 11.3 Code Review（重点关注类型安全、异常处理、埋点完整性）
- [x] 11.4 准备灰度发布计划（与周迭代节奏一致，建议先放开 1% → 10% → 50% → 100%）
- [x] 11.5 配置监控告警（错误率 > 1% 或响应时间 > 500ms 自动告警）
- [x] 11.6 编写上线 Checklist（回滚方案、Feature Flag 配置、数据监控）

## 12. 路由注册与配置

- [x] 12.1 注册到 wx.config.ts (微信端) ✅
- [x] 12.2 注册到 alipay.config.ts (支付宝端) ✅
- [x] 12.3 创建 index.config.ts 页面配置文件 ✅
- [x] 12.4 验证路径可访问性 ✅
