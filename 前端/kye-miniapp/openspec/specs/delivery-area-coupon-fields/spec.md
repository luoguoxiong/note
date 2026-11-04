# delivery-area-coupon-fields 规范

## 目的
待定 - 由归档变更 wire-delivery-area-coupon-fields 创建。归档后请更新目的。
## 需求
### Requirement: Use shared new-customer activity state

The delivery area page MUST use the shared new-customer activity state when deciding whether to show the lead capture entry.

#### Scenario: Delivery area refreshes shared activity state

- **GIVEN** the user is on the delivery area page in WeChat mini program, Alipay mini program, or H5
- **AND** the current user is a new customer without lead capture
- **AND** the delivery query result supports or partially supports delivery
- **WHEN** the page refreshes lead eligibility
- **THEN** the page MUST call `useNewUserActivity().getNewCustomerInfo(false)`
- **AND** the page MUST read lead activity values from `useRoleFlags().activityParams`
- **AND** the page MUST NOT directly call `web.activity.getNewCustomerActivity`

### Requirement: Submit lead form before opening the lead result H5 page

The delivery area page MUST submit the inline lead form through `web.user.customer.queryMarketingPersonnelV1` before opening the H5 apply result page.

#### Scenario: Lead form submit returns coupon fields for H5

- **GIVEN** the user is on the delivery area page in WeChat mini program, Alipay mini program, or H5
- **AND** the current user is a new customer without lead capture
- **AND** the delivery query result supports or partially supports delivery
- **WHEN** the user completes the inline lead form and taps the submit button
- **THEN** the page MUST call `web.user.customer.queryMarketingPersonnelV1`
- **AND** the request MUST include `phone`, `address`, `origin`, `companyName`, `source`, and `sendCouponSource`
- **AND** `origin` MUST currently use the reserved value `100`
- **AND** `source` MUST be `10`
- **AND** `sendCouponSource` MUST be `70`
- **AND** when `activityParams.value.activityId` exists, the request MUST include it as `activityId`
- **AND** the H5 apply result URL MUST include `couponStatus` from the submit interface response
- **AND** the H5 apply result URL MUST include `couponNumber` from the submit interface response

#### Scenario: Submit interface fails

- **GIVEN** the user has completed the inline lead form
- **WHEN** `web.user.customer.queryMarketingPersonnelV1` fails or returns an unsupported business code
- **THEN** the page MUST show a failure toast
- **AND** the page MUST NOT open the H5 apply result page

### Requirement: Reset lead activity fields with lead eligibility

The delivery area page MUST clear lead activity fields whenever the current lead eligibility is reset or hidden.

#### Scenario: Account switch clears lead activity fields

- **GIVEN** the delivery area page has stored activity fields from a previous new customer activity
- **WHEN** the logged-in account changes
- **THEN** the page MUST clear `activityId`
- **AND** subsequent submit requests MUST NOT use the previous account's activity fields

#### Scenario: New delivery query clears stale activity fields before refresh

- **GIVEN** the delivery area page has stored activity fields from a previous query
- **WHEN** the user starts a new delivery area query
- **THEN** the page MUST clear the previous `activityId` before requesting the latest lead eligibility

#### Scenario: Activity refresh failure clears activity fields

- **GIVEN** the delivery query result supports or partially supports delivery
- **WHEN** refreshing shared new-customer activity state fails
- **THEN** the page MUST hide the lead entry
- **AND** the page MUST clear `activityId`

