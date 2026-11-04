## 1. 基础设施准备

- [x] 1.1 创建目录结构和页面配置文件
  - 创建 `src/modules/user/pages/customer-code/apply/` 目录
  - 创建 `index.config.ts` 页面配置（navigationBarTitleText: '申请绑定其他公司'）
  - 创建 `assets/` 目录存放图片资源
  - 创建 `types/` 目录存放类型定义
  - 创建 `hooks/` 目录存放业务逻辑
  - **交付物**: 完整的目录结构、index.config.ts

- [x] 1.2 复制图片资源并添加 API 接口
  - 从 H5 项目复制 `required_icon.png` 到 assets 目录
  - 在 `src/modules/user/apis/customerCode/index.ts` 中新增 4 个接口：
    - `getFrontRecommendCustomer()` - 获取推荐公司列表
    - `applyBindOtherCustomerCheck()` - 校验是否可申请绑定
    - `bindOtherCustomerList()` - 提交绑定申请
    - `batchCheckBlackCustomerCode()` - 批量黑名单校验
  - 在 `src/modules/user/apis/customerCode/types.ts` 中新增相关类型定义
  - **交付物**: 图片资源、API 接口函数、TypeScript 类型

## 2. TypeScript 类型定义

- [x] 2.1 定义核心数据类型（types/index.ts）
  - 定义 `CompanyItem` 接口：customerCode, errorMsg, warningMsg, show, inputing
  - 定义 `RecommendItem` 接口：customerCode, customerShortName, selected
  - 定义 `ApplyBindFormState` 接口：companyList, currentCode, reason, errorReason, loading 等
  - 定义 `ApplyBindProps` 接口：source?, title?
  - 定义 API 响应类型：
    - `FrontRecommendCustomerResponse`
    - `ApplyBindOtherCheckResponse`
    - `BindOtherCustomerListResponse`
    - `BatchCheckBlackResponse`
  - **交付物**: types/index.ts 文件，所有类型明确无 any

## 3. 业务逻辑 Hooks 封装

- [x] 3.1 实现 useApplyBind hook（hooks/useApplyBind.ts）
  - 封装表单状态管理（reactive）
  - 实现动态表单管理方法：
    - `addCompany()` - 新增输入框（上限 9 个）
    - `removeCompany(index)` - 删除输入框（下限 1 个）
    - `validateField(item, index)` - 单字段校验
    - `validateForm()` - 全量校验
  - 实现联想推荐逻辑：
    - `fetchRecommendList()` - 获取推荐数据
    - `filterRecommendList(value)` - 过滤匹配项
    - `selectRecommend(item, obj)` - 选择推荐项
  - 实现提交逻辑：
    - `handleSubmit()` - 提交前校验 + API 调用
    - `handleBatchCheck()` - 批量黑名单校验
  - 返回状态和方法供组件使用
  - **交付物**: useApplyBind.ts，完整的业务逻辑封装

## 4. 子组件开发

- [x] 4.1 开发 CompanyInput 组件（components/CompanyInput.vue）
  - Props: value (string), errorMsg (string), index (number), showDelete (boolean)
  - Emits: update:value, blur, focus, delete, clear
  - 功能：
    - 使用 ky-field 渲染输入框
    - 支持数字键盘（type="digit"）
    - 错误状态样式（红色边框 + 错误提示 Tooltip）
    - 删除按钮（仅当 showDelete=true 时显示）
    - 清空按钮
  - 样式文件：components/CompanyInput.scss
  - **交付物**: CompanyInput.vue + CompanyInput.scss

- [x] 4.2 开发 RecommendList 组件（components/RecommendList.vue ）
  - Props: list (RecommendItem[]), visible (boolean)
  - Emits: select (item: RecommendItem)
  - 功能：
    - 渲染推荐公司列表（最多 10 条）
    - 高亮匹配文本（使用 span 包裹 + .active 类）
    - 已选标识（"已选"标签 + 置灰样式）
    - 长名称处理（>=12 字符换行显示）
    - 点击选择事件
  - 样式文件：components/RecommendList.scss
  - **交付物**: RecommendList.vue + RecommendList.scss

## 5. 主页面组件开发

- [x] 5.1 实现主页面结构（index.vue template 部分）
  - 顶部提示区域："为保障客户信息安全..."
  - 当前绑定公司展示区域（条件渲染）
  - 动态客户编码列表区域：
    - 标题："申请绑定公司(x/9)" + 必填图标
    - v-for 循环渲染 CompanyInput 组件
    - 每个输入框下挂载 RecommendList 组件
    - "新增申请绑定公司"按钮（条件渲染，<9 时显示）
  - 申请原因区域：
    - 标题 + 必填图标
    - ky-field textarea 类型
    - 字数限制 100，show-word-limit
  - 底部固定按钮区域：
    - ky-button 确认按钮（loading 状态）
  - Alert 弹窗（离开确认）
  - Captcha 弹窗（风控验证）
  - **交付物**: index.vue template 结构完整

- [x] 5.2 实现主页面逻辑（index.vue script 部分）
  - 引入依赖：Taro, ref, computed, onMounted, useApplyBind, API 接口
  - 定义 Props 和 Emits（TypeScript 类型）
  - 初始化 hook：const { ... } = useApplyBind()
  - 实现事件处理：
    - handleAdd() - 新增
    - handleRemove(index) - 删除
    - handleBlur(item, index) - 失焦校验
    - handleFocus(item) - 聚焦清除错误
    - handleSubmit() - 提交
    - handleTextareaBlur() - 原因失焦校验
  - 生命周期：
    - onMounted: 调用 fetchRecommendList(), 获取路由参数
    - useBeforeUnmount: 离开守卫逻辑
  - 计算属性：
    - isCanAdd (< 9)
    - isCanRemove (> 1)
    - addNum / totalNum
    - isDisabled (提交按钮禁用状态)
  - **交付物**: index.vue script 逻辑完整

- [x] 5.3 实现主页面样式（index.scss）
  - BEM 命名规范：`.apply-bind__header`, `.apply-bind__body`, `.apply-bind__footer`
  - 顶部提示区域样式（渐变背景或纯色背景）
  - 当前编码展示区（只读灰色背景）
  - 表单区域布局（flex 垂直排列）
  - 输入框容器样式（含删除按钮定位）
  - Tooltip 错误提示样式（绝对定位 + 圆角 + 半透明黑底）
  - 推荐列表样式（绝对定位 + 白底 + 阴影 + 最大高度滚动）
  - 底部按钮固定（position: fixed 或 flex: 1）
  - px 单位（项目规范）
  - **交付物**: index.scss 样式完整

## 6. 集成测试与优化

- [ ] 6.1 功能验证与联调
  - 验证动态增删输入框功能正常
  - 验证联想推荐列表展示和选择正常
  - 验证单个字段校验（非空、有效性、重复）正常
  - 验证批量黑名单校验正常
  - 验证提交成功跳转结果页正常
  - 验证提交失败错误提示正常
  - 验证离开确认弹窗正常
  - 验证图形验证码触发和回调正常
  - **交付物**: 功能验证通过清单

- [ ] 6.2 多端兼容性检查
  - 微信小程序端表现正常
  - 支付宝小程序端表现正常（如支持）
  - H5 端表现正常（如需）
  - 键盘遮挡问题已处理
  - 滚动流畅无卡顿
  - **交付物**: 兼容性测试报告

- [ ] 6.3 代码规范检查
  - ESLint 检查无错误
  - Prettier 格式化通过
  - TypeScript 类型检查无 any（除必要场景）
  - 无 console.log / debugger 残留
  - 组件命名符合 PascalCase
  - 文件命名符合 kebab-case
  - **交付物**: 代码规范检查通过
