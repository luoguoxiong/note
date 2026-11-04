# Tasks: homepage-coupon-entries

## 1. 数据层

- [x] 1.1 `apis/types.ts`：`WebHomepageTaskOut` 扩展 `coupon2: HomepageOrderCoupon[]`、`coupon3: HomepageFreeCoupon[]` 类型；定义 CRM 券类型枚举 → 展示类型映射（直减/折扣/满减）；字段名集中注释「后端未定稿，定稿后单点修改」。完成标准：类型编译通过，映射表与 PRD 3.2.1 一致。
- [x] 1.2 mock 数据：为 coupon2/coupon3 提供开发期 mock（含多券合并、不同面额、多张免单券、空数组等用例）。完成标准：mock 可切换，覆盖 spec 全部场景输入。

## 2. 逻辑层

- [x] 2.1 `coupon-card.ts`：实现纯函数 `buildCouponCards(taskOut)`——过滤、合并（类型+面额+描述 key）、排序（免单>领券>下单，同类按有效期临近在前，领券保持原序）、截断前 3。完成标准：throwaway 脚本跑通 spec 中排序/合并/截断全部场景（8 场景已验证）。
- [x] 2.2 实现 `verifyCouponUsable(card)`：重调 task 接口按券 id 匹配（合并组任一命中即放行），三分支返回（可用/失效/失败）；后端未就绪先 mock。完成标准：三分支均有可验证输出。

## 3. 组件层

- [x] 3.1 重构 `coupon-package/index.vue`：统一卡片列表 + scroll-view 横滑（参照 industry-info），1 卡铺满/多卡露半卡；右侧竖排「查 看 全 部」接 M6023 跳转；三券均空时整体不渲染。完成标准：模拟器截图与 315:583017 视觉一致（待 4.1 验证）。
- [x] 3.1.1 移除标题栏：删除「专属权益 + 查看我的优惠券」标题栏，曝光埋点 `exp_homepage_coupon_area_v1`（id `coupon-package-ex`）迁移到区域根节点。完成标准：线上曝光事件码不变、挂载点存在于区域根节点。
- [x] 3.2 新增 `coupon-card-item.vue`：三种卡型视图（免单券文案卡 / 领券卡 / 下单券卡含角标「共 X 张」），样式取值按设计稿 DSL 与 kye-mini-css 规范。完成标准：角标、虚线连接、渐变描边还原（待 4.2 校验）。
- [x] 3.3 「立即寄件」点击接入 `verifyCouponUsable`：通过跳 `/modules/order-build/pages/order/index`；失效 toast「该优惠券已失效」卡保留；失败 toast「网络异常，请稍后重试」。完成标准：三种结果均实操验证（待 4.1）。
- [x] 3.4 盖章样式替换：已领取/已失效印章使用设计稿导出切图（assets/stamp-received.png / stamp-invalid.png），旧网络图片已删除。完成标准：两种状态截图对比设计稿（待 4.2）。
- [x] 3.5 领券流程回归：成功/38009/38010 三路径代码逐行与线上一致（handleReceive 原样保留）；曝光埋点 id `coupon-package-ex` 保留。完成标准：逐路径实操确认无回归（待 4.1）。

## 4. 验证

- [ ] 4.1 微信开发者工具模拟器跑通：未登录不渲染 / 接口失败降级 / 三券混合排序截断 / 合并角标 / 滑动 / 查看更多跳转 / 立即寄件三分支。完成标准：逐场景截图或日志证据。【阻塞：微信开发者工具未启动，CLI 未授权】
- [ ] 4.2 设计稿还原度校验：get_screenshot 对比券区域。完成标准：视觉差异清单为空或已确认。【阻塞：同上】
