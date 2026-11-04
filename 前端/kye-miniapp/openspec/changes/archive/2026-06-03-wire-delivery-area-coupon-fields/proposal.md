## Why

The delivery area page shows an inline lead capture card for new customers when a delivery area query supports or partially supports delivery. The page must still reuse the shared new-customer activity state to decide whether the entry and coupon badge should show.

Later interface confirmation clarified that the final H5 result coupon fields are not the activity-query fields. `couponStatus` and `couponNumber` for the H5 apply result page must come from `web.user.customer.queryMarketingPersonnelV1` after the inline lead form is submitted.

## What Changes

- Reuse `useNewUserActivity().getNewCustomerInfo(false)` to refresh shared new-customer activity state.
- Reuse `useRoleFlags()` for lead identity, lead-capture state, lead-capture activity state, and `activityParams`.
- Keep `activityParams.activityId` as the activity identifier passed to the submit interface when available.
- Add a delivery-area API wrapper for `web.user.customer.queryMarketingPersonnelV1`.
- Submit the inline lead form before opening the H5 apply result page.
- Use reserved `origin: '100'`, `source: 10`, and `sendCouponSource: '70'` for the delivery area submit request.
- Pass H5 result `couponStatus` and `couponNumber` from the submit interface response.

## Capability

### Added

- `delivery-area-coupon-fields`: delivery area lead submit gets final coupon result fields from `web.user.customer.queryMarketingPersonnelV1` and passes them to the H5 apply result URL.

## Impact

- Affected page: `src/modules/tools/delivery-area/**`.
- Reused shared store: `src/store/useNewUserActivity.ts`.
- Reused shared hook: `src/layout/pages/home/hooks/use-role-flags.ts`.
- Added API wrapper: `src/modules/tools/delivery-area/apis/index.ts`.
- Does not change the shared request layer, backend API codes, WebView utility, or H5 result page internals.
