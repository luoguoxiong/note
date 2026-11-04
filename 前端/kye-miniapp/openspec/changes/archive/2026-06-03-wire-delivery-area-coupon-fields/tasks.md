## 1. OpenSpec And Context

- [x] 1.1 Review `proposal.md`, `design.md`, and `specs/delivery-area-coupon-fields/spec.md` before implementation.
- [x] 1.2 Capture the confirmed decision that new-customer activity queries reuse the shared `scene: '30'` public store.
- [x] 1.3 Confirm `knowledge.md` still accurately describes the long-term knowledge updates required before archive.

## 2. Shared Activity State

- [x] 2.1 Remove the delivery area page's direct `getNewCustomerActivity` import and local activity request.
- [x] 2.2 Call `useNewUserActivity().getNewCustomerInfo(false)` when refreshing delivery-area lead eligibility.
- [x] 2.3 Read `hasLeadCapture`, `hasLeadCaptureActivity`, and `activityParams` from `useRoleFlags()`.

## 3. Activity Id Prop Passing

- [x] 3.1 Read `activityParams.value.activityId` only when a valid activity exists.
- [x] 3.2 Pass `activityId` from `src/modules/tools/delivery-area/index.vue` to `SearchResult`.
- [x] 3.3 Do not pass `activityParams.value.receiveSource` or `activityParams.value.couponCount` as final H5 result coupon fields.
- [x] 3.4 Clear activity fields together with lead eligibility reset/hide paths.

## 4. Knowledge And Verification

- [x] 4.1 Update long-term knowledge pages for the shared new-customer activity state and coupon field mapping.
- [x] 4.2 Append `knowledge/changelog.md`.
- [x] 4.3 Run targeted lint for changed delivery-area files.
- [x] 4.4 Run `openspec-cn.cmd validate wire-delivery-area-coupon-fields --strict`.
- [x] 4.5 Manually verify H5 URL parameter expectations for activity-present and activity-missing paths across WeChat mini program, Alipay mini program, and H5 where feasible.

## 5. Submit Interface Coupon Result Source

- [x] 5.1 Review the H5 reference implementation for `web.user.customer.queryMarketingPersonnelV1`.
- [x] 5.2 Add a delivery-area API wrapper and request/response types for `web.user.customer.queryMarketingPersonnelV1`.
- [x] 5.3 Pass `activityId` from shared `activityParams` to the inline lead form instead of precomputed coupon fields.
- [x] 5.4 Submit the inline lead form before H5 navigation, using `origin: '100'`, `source: 10`, and `sendCouponSource: '70'`.
- [x] 5.5 Build H5 `couponStatus` and `couponNumber` from the submit interface response.
- [x] 5.6 Update long-term knowledge pages for the submit interface coupon result source.
- [x] 5.7 Run targeted lint for changed delivery-area files.
- [x] 5.8 Run `openspec-cn.cmd validate wire-delivery-area-coupon-fields --strict`.
