## Context

Delivery area lead capture lives in `src/modules/tools/delivery-area`. The page already determines whether the current result supports delivery and whether the current user is a new customer without lead capture.

The shared new-customer activity state is provided by:

- `src/store/useNewUserActivity.ts`
- `src/layout/pages/home/hooks/use-role-flags.ts`

The submit interface reference was checked in `D:\styudy\zc\netc-h5-modules-new\service\site-query`, where `web.user.customer.queryMarketingPersonnelV1` returns final coupon result fields.

## Goals

- Keep shared activity state as the source for lead-entry display and `activityId`.
- Submit delivery area inline lead form through `web.user.customer.queryMarketingPersonnelV1`.
- Use the submit interface response as the final source of `couponStatus` and `couponNumber`.
- Avoid passing stale or default activity fields as final coupon result values.

## Non-Goals

- Do not change `web.activity.getNewCustomerActivity`.
- Do not change the shared `scene: '30'` new-customer activity query.
- Do not change the H5 apply result page internals.
- Do not change the shared request layer or add an interface-specific `appkey`.

## Decisions

1. Reuse shared activity state.

   Delivery area calls `useNewUserActivity().getNewCustomerInfo(false)` and reads `useRoleFlags().activityParams`. The activity query is used for display state and `activityId`, not as final coupon result state.

2. Submit inline form before H5 navigation.

   `SearchResult` calls `web.user.customer.queryMarketingPersonnelV1` after local form validation. If the submit interface fails or returns an unsupported business code, the page shows a toast and does not open H5.

3. Use delivery area source constants.

   The submit request currently sends:

   - `origin: '100'`
   - `source: 10`
   - `sendCouponSource: '70'`
   - `activityId` when `activityParams.activityId` exists

4. Build H5 result params from submit response.

   H5 URL params use:

   - `couponStatus = response.data.couponStatus`
   - `couponNumber = response.data.couponNumber`

## Risks

- `origin: '100'` is a reserved value inferred from the H5 reference for non-App contexts; backend can later confirm a more specific CRM origin dictionary value.
- The submit interface may return coupon fields empty when there is no coupon activity; the H5 result page must tolerate empty coupon params.
- Existing debug console logs still expose the built H5 URL for local verification and can be removed before release if needed.
