# Proposal: homepage-coupon-entries

## Why

首页券区域（专属权益）目前仅有领券入口，待使用的下单券与免单券藏在「我的-优惠券」多级路径，查看链路长、感知弱。禅道需求 #573952（父需求 #573283，PRD v0.6.1）要求在首页券区域新增免单券、待使用下单券入口，与已有领券入口同区域按「免单券 > 领券 > 下单券」统一排序，缩短路径、引导寄件转化。

已确认的口径（与需求方多轮澄清）：

- 数据源为现有 `web.homepage.task` 接口扩展返回 `coupon`（领券，现有逻辑零改动）、`coupon2`（下单券列表）、`coupon3`（免单券列表）三个字段；后端尚未定稿，前端按 PRD 字段口径定义类型并 mock。
- 指定平台券（支付宝/高德/整车）与代金券由后端过滤，前端不关心；灰度开关、埋点本次不在前端范围。
- 只改老客首页布局（custimer-old）的 CouponPackage，新客布局不动。
- 新设计稿移除区域标题栏（「专属权益 + 查看我的优惠券」），「查看更多」收口为右侧竖排「查 看 全 部」；既有曝光埋点 `exp_homepage_coupon_area_v1` 的挂载点（`coupon-package-ex`）迁移到区域根节点，线上埋点不丢。

## What Changes

1. **组件重构**：原地改造 `src/layout/pages/home/components/coupon-package/`（index.vue / item.vue），由「单组领券卡 flex 横排」重构为「统一排序卡片列表 + scroll-view 横滑」：
   - 三类券合并为统一卡片数组，按免单券 > 领券 > 下单券排序；免单券/下单券类内按有效期结束临近在前，领券类内保持接口返回顺序；取前 3 张展示；
   - 1 卡铺满整行；多卡时首屏展示第 1 卡 + 第 2 卡一半，可手动滑动；
   - 区域右侧竖排「查 看 全 部」入口，复用轻应用 M6023 跳「我的-优惠券」。
2. **卡片类型**：
   - 下单券卡：展示类型（直减/折扣/满减，CRM 类型按映射表转换）+ 面额/折扣 + 描述 + 「立即寄件」；类型+面额+描述完全一致的多张合并为一张卡并显示「共 X 张」角标；券包样式分 2 张 / 3 张及以上两档；
   - 免单券卡：CRM 合并好的一句文案（类型 + 免单范围标签 + 免单总额）+ 「立即寄件」；正常一张，异常多张时不合并、按有效期结束临近排序；
   - 领券卡：现有展示与领取流程（成功 toast / 38010 已领过 toast / 38009 弹窗置灰）原样保留。
3. **立即寄件二次校验**：点击免单券/下单券「立即寄件」时重调 task 接口，按券 id 匹配校验券仍可用：可用则跳 `/modules/order-build/pages/order/index`（不带参数）；不可用则 toast「该优惠券已失效」不跳转、卡片保留，刷新后隐藏；接口失败 toast「网络异常，请稍后重试」。校验逻辑收敛为纯函数，后端定稿前先 mock。
4. **降级与边界**：未登录（手机号与客户编码均无）不调接口不渲染；接口失败/超时静默降级不展示；三种券均为空时整个券区域不渲染。
5. **盖章样式**：已领取/已失效印章按新设计稿（业务标签/印章）替换现有两张网络图片。

## Capabilities

### New Capabilities

- `homepage-coupon-entries`：首页券区域免单券/待使用下单券入口，与领券同区域统一排序、滑动、查看更多、立即寄件二次校验。

## Impact

- `src/layout/pages/home/apis/types.ts`：`WebHomepageTaskOut` 扩展 `coupon2`/`coupon3` 类型（含 CRM 券类型枚举、映射表类型）；
- `src/layout/pages/home/store/index.ts`：新增券合并/排序/截断纯函数与立即寄件校验逻辑；
- `src/layout/pages/home/components/coupon-package/index.vue`、`item.vue`（+ scss）：重构为统一滑动卡片列表；
- `src/layout/pages/home/components/custimer-old/index.vue`：渲染条件不变（CouponPackage 内部自行判空）；
- 不动：`receiveHomepageCoupon` 领取链路、`web.homepage.task` 调用时机、新客布局、埋点（后续单独实施）。
