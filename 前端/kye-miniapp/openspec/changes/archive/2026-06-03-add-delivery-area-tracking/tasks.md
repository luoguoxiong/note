## 1. OpenSpec And Knowledge

- [x] 1.1 Review `proposal.md`, `design.md`, and `specs/delivery-area-tracking/spec.md` before implementation.
- [x] 1.2 Confirm `knowledge.md` still accurately describes whether long-term knowledge updates are required.

## 2. Tracking Helper

- [x] 2.1 Add `src/modules/tools/delivery-area/report.ts` with page, region, event constants and wrapper functions for PV, click, and exposure tracking.
- [x] 2.2 Keep tracking payloads aligned with the latest `埋点.md`, including `联系商务` in `clk_delivery_range_results_v1`.

## 3. Page And Result Integration

- [x] 3.1 Wire `src/modules/tools/delivery-area/index.vue` to report page view and search button click events.
- [x] 3.2 Wire `src/modules/tools/delivery-area/components/search-result/index.vue` to report `获取专属服务方案`, `去寄件`, and `联系商务` result button clicks.
- [x] 3.3 Report `exp_delivery_range_get_service` when the inline lead form card becomes visible.
- [x] 3.4 Report `clk_delivery_range_get_service` when the lead form submit button is tapped, before required-field validation.

## 4. Verification

- [x] 4.1 Run targeted lint for changed delivery-area files.
- [x] 4.2 Run `openspec-cn.cmd validate add-delivery-area-tracking --strict`.
- [x] 4.3 Manually verify the intended event payloads for WeChat mini program, Alipay mini program, and H5 entry paths where feasible.
