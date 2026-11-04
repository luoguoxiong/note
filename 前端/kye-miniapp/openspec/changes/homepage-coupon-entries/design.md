# Design: homepage-coupon-entries

## 数据流

```
web.homepage.task（现有接口，扩展返回）
  ├── coupon  → 领券（数组）        → 现有 couponInfoList 渲染逻辑，零改动
  ├── coupon2 → 下单券列表（数组）   → 过滤/映射/合并 → 统一卡片数组
  └── coupon3 → 免单券列表（数组）   → 过滤 → 统一卡片数组
                                          │
                  mergeSortCoupons（纯函数）▼
        排序：免单券 > 领券 > 下单券；同类按有效期结束临近在前
        （领券类内保持接口返回顺序）；取前 3 张
                                          │
                                          ▼
                    CouponPackage（scroll-view 横滑卡片列表）
```

- 后端未定稿 → `apis/types.ts` 中定义 `HomepageOrderCoupon`（coupon2 元素）、`HomepageFreeCoupon`（coupon3 元素）类型与 mock 数据；字段名/映射集中此一处，定稿后单点修改。
- 过滤规则（PRD 3.2.3）由后端保证主要条件，前端仅做防御性过滤：下单券未使用且在有效期内；免单券数组原样消费（剩余额度>0 由 CRM 判断，接口不返回该字段）。

## 关键决策

### D1 原地改造 CouponPackage，不新建组件

领券数据与交互（领取、弹窗、曝光埋点 id `coupon-package-ex`）都长在该组件上；新建组件会留死代码或大面积改引用。对外渲染条件（custimer-old 中的 `v-if="couponData && !(isAliMiniApp||isAmapMiniApp)"`）保持不变，三券均空的新判空逻辑收在组件内部。

### D2 排序/合并/截断收敛为纯函数

`buildCouponCards(taskOut): CouponCard[]`：输入接口出参，输出统一卡片视图模型（`{ kind: 'free' | 'receive' | 'order', ... }`）。合并 key = 展示类型+面额/折扣+描述；有效期排序仅免单券/下单券；截断取前 3。纯函数便于后端字段定稿后调整与单测验证。

### D3 立即寄件二次校验

点击免单券/下单券卡 → 重调 `getHomepageTask` → 在最新响应中按券 id 匹配该卡对应券：
- 命中 → `kyeNavigate.navigateBefore('navigateTo', { url: '/modules/order-build/pages/order/index' })`（与现有「去寄件」一致，不带参数）；
- 未命中 → `Taro.showToast('该优惠券已失效')`，卡片保留，下次刷新接口后自然隐藏；
- 请求失败 → `Taro.showToast('网络异常，请稍后重试')`。
- 合并卡按合并组内任一券 id 命中即放行（张数减少不算失效）。
- 后端未就绪：校验封装为 `verifyCouponUsable(card)`，内部先走 mock。

### D4 滑动交互复用现有范式

参照 `industry-info`：`scroll-view scroll-x enhanced enable-flex`。卡宽按设计稿 750 基准换算（单卡 500rpx 级、可视区 670rpx 级，保证首屏「第 1 卡 + 第 2 卡一半」）；1 卡时整行铺满；滑到最右展示最后一卡 + 前一卡后一半（scroll-view 自然行为 + 卡宽/间距计算保证）。

### D5 盖章样式替换

现有 `coupon-package__status-image` 两张网络图片（已领取/已失效）替换为设计稿「业务标签/印章」样式（CSS 实现或导出切图，实现时按还原度取优）。领取状态机（isGet / invalidated / 38009 / 38010）不变。

### D6 移除标题栏，迁移曝光挂载点；校验不写回 store

- 新设计稿券区域无标题栏：删除「专属权益 + 查看我的优惠券」标题栏，查看更多收口为右侧竖排「查 看 全 部」（M6023 通道不变）；既有曝光埋点事件码 `exp_homepage_coupon_area_v1` 与挂载 id `coupon-package-ex` 迁移到区域根节点，保持线上埋点连续。
- 「立即寄件」二次校验重调 task 接口时 MUST NOT 写回 `couponData` store——只取响应做券 id 匹配，避免点击瞬间卡片重排/闪烁；失效卡片等下次进首页刷新后自然隐藏。

## 设计稿依据

- Pixso 页面：`mpl8XNOCZ9mbktUwIgACVw`，page-id `280:556185`，方案一（小程序）-推荐 frame `297:578178`；
- 券区域实例 `315:583017`（专属权益）：紫渐变容器 `rgba(131,101,246,.08→.04)`、2px `#f2effe`、圆角 16、pad 12/16；
- 单券卡：左券区橙渐变 `#ffede6` 渐隐 + 1px 描边 + 圆角 8；角标「共 X 张」紫底、圆角 16/0/16/0、高 28；中部虚线连接（2px `#d3d5db` + 半圆缺口）；右按钮区面性按钮 48px；
- 券包卡：紫渐变 `#f0ebff→#e4e0ff`、圆角 18，2 张 / 3 张及以上两档；
- 右侧竖排「查 看 全 部」24px、`#8365f6`；
- 交互说明 frame `280:582230`：状态 3 种（未领取/已领取/已失效印章）、领取流程两失败场景（现状已实现）、热区整块可点、未配置券不显示区域。

## 非目标

- 灰度开关、埋点实施（后续单独排期）；
- APP 端、新客布局、支付宝/高德端适配；
- 领券查询/领取逻辑、券活动后台配置。
