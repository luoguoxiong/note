# Knowledge Delta

## Need To Update Knowledge Base

Yes.

## Impacted Code Scope

- `src/modules/tools/delivery-area/**`
- `src/store/useNewUserActivity.ts`
- `src/layout/pages/home/hooks/use-role-flags.ts`
- `openspec/changes/wire-delivery-area-coupon-fields/**`

## Knowledge Pages To Update

- `knowledge/apis.md`
- `knowledge/modules/home.md`
- `knowledge/changelog.md`

## Long-Term Knowledge To Capture

- New-customer activity state is refreshed through `useNewUserActivity().getNewCustomerInfo(forceRefresh)`.
- The shared store currently calls `web.activity.getNewCustomerActivity` with the unified business scene `scene: '30'`.
- `getNewCustomerInfo(false)` allows the shared store's 10-minute cache; `getNewCustomerInfo(true)` forces refresh.
- `useRoleFlags()` only reads and derives shared state; it does not actively request the activity API.
- Delivery area uses shared `activityParams` for lead-entry state and `activityId`.
- Delivery area inline lead submit calls `web.user.customer.queryMarketingPersonnelV1`.
- Delivery area currently submits reserved `origin: '100'`, `source: 10`, and `sendCouponSource: '70'`.
- Final H5 result fields `couponStatus` and `couponNumber` come from `web.user.customer.queryMarketingPersonnelV1` response, not from `activityParams.receiveSource` or `activityParams.couponCount`.

## Reason For Not Updating Knowledge Base

Not applicable.

## Archive Checklist

- [x] Updated the corresponding knowledge pages or explained why no update is needed.
- [x] Appended `knowledge/changelog.md` or explained why no changelog entry is needed.
- [ ] Updated `knowledge/decisions/index.md` if long-term decisions are affected.
- [ ] Updated `knowledge/manifest.json` if path mappings changed.
