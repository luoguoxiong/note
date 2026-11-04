## 1. OpenSpec And Knowledge

- [x] 1.1 Add `knowledge.md` for this change and record whether long-term knowledge pages need updates.
- [x] 1.2 Update and validate the OpenSpec change artifacts for the inline card transition design.

## 2. Delivery Area UI

- [x] 2.1 Implement the lead capture CTA card in `src/modules/tools/delivery-area/components/search-result` and show the activity badge when `hasLeadCaptureActivity` is true.
- [x] 2.2 Replace the popup flow with an inline form card and smooth CTA-to-form transition in the query result area.
- [x] 2.3 Wire `src/modules/tools/delivery-area/index.vue` to pass queried address/activity status into the result card.
- [x] 2.4 Gate the lead entry by current user role/lead status and hide the original "去寄件" button for new customers without lead capture.
- [x] 2.5 Reset stale lead eligibility on account switch and refresh current account lead status after supported delivery queries.
- [x] 2.6 Refresh current user information before lead decision when cached new/old customer role is unknown.

## 3. H5 Navigation

- [x] 3.1 Build the H5 apply-result URL with form values, fixed source params, generated `workId`, `backSence`, and reserved optional coupon params.
- [x] 3.2 Use existing WebView navigation utilities to open the H5 result page after form validation.

## 4. Verification

- [x] 4.1 Run targeted lint for changed delivery-area files and OpenSpec validation.
- [x] 4.2 Manually review expected WeChat mini program, Alipay mini program, and H5 regression points for query result, card transition, validation, and URL parameters.
- [x] 4.3 Re-run targeted lint and OpenSpec validation for the account-switch lead eligibility fix.
