## 1. 基础设施

- [x] 1.1 新增服务方式相关类型定义（`types.ts`）
- [x] 1.2 新增 API 方法（`getQueryServiceTime` / `getNewCustomerActivity` / `applyEstimated` / `getApplyContent` / `getContactInfo`）
- [x] 1.3 扩展 Pinia Store（查询结果、新客活动、优惠券、联系商务）
- [x] 1.4 图片 CDN 统一配置（`constants/images.ts`）

## 2. Service-Mode 组件

- [x] 2.1 创建组件 + hooks + CSS Modules
- [x] 2.2 表头：服务方式 + 预计时效 + 预估费用排序（互斥）
- [x] 2.3 列表项：名称、时效描述（rich-text）、总费用 ¥xx.xx 起 + 明细入口
- [x] 2.4 不可用置灰、延迟提示、违禁品说明
- [x] 2.5 优惠券横幅 + 联系商务入口 + 联系商务弹窗
- [x] 2.6 限取限派提示
- [x] 2.7 空状态 + 底部提示

## 3. Freight-Footer 组件

- [x] 3.1 创建组件 + hooks + CSS Modules
- [x] 3.2 6 种状态面板：新客留资/未留资/未绑码/待开通/申请中/已开通
- [x] 3.3 联系商务按钮、留资券角标
- [x] 3.4 按钮逻辑闭环（跳转/toast/弹窗）

## 4. Estimated-Shipping-Popup 组件

- [x] 4.1 创建组件 + hooks + CSS Modules
- [x] 4.2 两态切换：可编辑 textarea（status=3）+ 只读（status=4）
- [x] 4.3 提交申请 API 调用 + 提交后重查询

## 5. 主页面集成

- [x] 5.1 重置按钮 + 查询按钮 + 加载态
- [x] 5.2 查询参数组装 + API 调用 + 结果存入 Store
- [x] 5.3 验证码弹窗集成（`withCaptchaRequest`）
- [x] 5.4 ServiceMode、FreightFooter、Captcha 引入
- [x] 5.5 新客活动 onMounted + useDidShow

## 6. 样式

- [x] 6.1 service-mode 对齐旧版样式（CSS Modules）
- [x] 6.2 freight-footer 样式（CSS Modules）
- [x] 6.3 estimated-shipping-popup 样式（CSS Modules）
- [x] 6.4 重置/查询按钮样式
