# 实施任务清单

> 页面主体已在工作区实现（分包、hook、组件、样式），已完成项以 `[x]` 标记；剩余工作集中在接口联调与多端验证。

## 1. 基础结构

- [x] 1.1 创建分包目录 `src/modules/monthly-settlement/pages/monthly-qrcode/`（apis / components / constants / hooks）
- [x] 1.2 在 `src/wx.config.ts`、`src/alipay.config.ts` subPackages 注册分包 `modules/monthly-settlement` 与页面 `pages/monthly-qrcode/index`
- [x] 1.3 编写 `index.config.ts` 页面配置（标题「扫码转月结」、关闭下拉刷新）
- [x] 1.4 沉淀页面图片资源常量 `constants/images.ts`

## 2. 接口与数据层

- [x] 2.1 定义 `apis/types.ts`：`MonthlyQrcodeStatus` 枚举（0/2/3/4/5）与 `MonthlyQrcodeData` 类型（status 兼容 number|string，异常文案字段 `statusDesc`）
- [x] 2.2 封装 `apis/index.ts` `getMonthlyQrcode()`（`http<MonthlyQrcodeData>('web.user.fmsSettlement.getQRCode', {}, { hideToast: true })`）
- [x] 2.3 接入内部员工拦截：复用公共 `isEmployee()`（`web.customer.isEmployee`，入参当前登录手机号），每次进入页面只校验一次，命中整页缺省且不调用 `getQRCode`
- [ ] 2.4 接口联调：验证 `isEmployee` 两种结果与 `getQRCode` 的 5 种 status（0/2/3/4/5）及 `statusDesc` 返回

## 3. 状态机与计时逻辑

- [x] 3.1 实现 `hooks/use-monthly-qrcode.ts`：`viewState` 四态（loading/qrcode/cardError/pageError）与 status 枚举映射
- [x] 3.2 实现有效期本地计时：调用发起时刻 + 10 分钟，`YYYY-MM-DD HH:mm 至 YYYY-MM-DD HH:mm` 格式化展示
- [x] 3.3 实现到期 `setTimeout` 自动刷新、`useDidHide`/卸载清理计时器、`useDidShow` 过期即重取
- [x] 3.4 实现统一 `refresh()` 入口：首次进入/手动刷新/重新加载/自动刷新共用，正常态局部 loading、异常态整页 loading
- [x] 3.5 实现网络异常分级：`Taro.getNetworkType` 区分无网络与服务器异常两种整页缺省

## 4. 页面与组件

- [x] 4.1 实现 `components/qr-empty-state/index.vue` 缺省态组件（icon/title/desc/buttonText props + action emit）
- [x] 4.2 实现 `index.vue` 卡片态：二维码展示、有效期、底部 fixed 刷新栏
- [x] 4.3 实现卡片内缺省三型（contact 联系商务 / noPermission 无按钮 / qrFail 刷新重试）与整页缺省三型（internalStaff 返回 / noNetwork / serverError 重新加载）
- [x] 4.4 接入公共 `ContactBusiness` 弹窗（传入 `useUserInfo().phone`）与 `ky-image`/`ky-loading`
- [x] 4.5 编写 `index.scss` 页面样式（kye-mini-css 原子体系取值）

## 5. 入口配置（无前端代码）

- [ ] 5.1 轻应用后台配置「我的页面 → 客户支持 → 扫码转月结」入口，配置 3 条显示条件（结算方式=月结、后台状态=正常、已开通转月结权限）与跳转路径 `/modules/monthly-settlement/pages/monthly-qrcode/index`
- [ ] 5.2 验证入口显示/隐藏：三条条件任一不满足时入口不展示，权限关闭后 10 分钟内入口静默消失

## 6. 验证

- [ ] 6.1 微信开发者工具编译预览：走查内部员工拦截（isEmployee true/false）、status 0/2/3/4/5 五种状态、到期自动刷新、手动刷新、联系商务弹窗
- [ ] 6.2 支付宝端编译预览：确认分包注册与页面渲染正常
- [ ] 6.3 异常路径验证：断网显示无网络缺省、接口 500 显示服务器异常缺省、重新加载恢复
- [ ] 6.4 埋点确认：入口曝光/点击埋点按 report-tracking 规范补齐（若入口配置支持）
