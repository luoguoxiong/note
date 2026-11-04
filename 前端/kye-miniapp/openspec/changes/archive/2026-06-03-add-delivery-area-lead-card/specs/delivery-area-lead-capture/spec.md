## ADDED Requirements

### Requirement: Display lead capture card after delivery search

The delivery area page SHALL display a lead capture card below the delivery result only when the current logged-in user is a new customer without lead capture and the queried address supports delivery service.

#### Scenario: Supported delivery result shows lead card

- **GIVEN** the user is on the delivery area page in WeChat mini program, Alipay mini program, or H5
- **AND** the current logged-in user is a new customer without lead capture
- **WHEN** the user queries an address and the delivery result is supported or partially supported
- **THEN** the page displays the existing delivery result and a lead capture card below it
- **AND** the existing delivery result "去寄件" button is hidden

#### Scenario: Lead card reflects activity status

- **GIVEN** the current logged-in user is a new customer without lead capture
- **AND** the page can read new customer activity status
- **WHEN** `hasLeadCaptureActivity` is true
- **THEN** the lead card displays the "新客专享优惠" badge and coupon-related copy

#### Scenario: Supported delivery result refreshes lead status

- **GIVEN** the current logged-in user is a new customer
- **WHEN** the user queries a supported or partially supported delivery address
- **THEN** the delivery area page refreshes the current account lead capture status before deciding whether to show the lead card

#### Scenario: Unknown customer role is refreshed before lead decision

- **GIVEN** the user is logged in
- **AND** the current cached customer role cannot clearly identify new customer or old customer
- **WHEN** the user queries a supported or partially supported delivery address
- **THEN** the delivery area page refreshes the current user information before deciding whether to request lead capture status

#### Scenario: Lead card without activity

- **GIVEN** the current logged-in user is a new customer without lead capture
- **AND** the page cannot read an active lead capture activity
- **WHEN** the delivery result is supported or partially supported
- **THEN** the lead card still displays the service plan copy and action button without blocking the query result

#### Scenario: User already has lead capture or is an old customer

- **GIVEN** the current logged-in user already has lead capture or is an old customer
- **WHEN** the delivery result is supported, partially supported, or unsupported
- **THEN** the page does not display the lead capture card

#### Scenario: Account switch resets stale lead entry

- **GIVEN** the delivery area page previously displayed a lead capture card for a new customer without lead capture
- **WHEN** the logged-in account changes to an old customer before returning to the home page
- **THEN** the delivery area page hides the lead capture card
- **AND** supported delivery results display the original "去寄件" action

#### Scenario: Unsupported or empty delivery result

- **GIVEN** the current logged-in user is a new customer without lead capture
- **WHEN** the delivery result is unsupported or no result is displayed
- **THEN** the page does not display the lead capture card

### Requirement: Switch to and validate lead capture form card

The delivery area page SHALL switch the lead capture card to an inline form card when the user taps "获取专属服务方案" and MUST validate required fields before navigation.

#### Scenario: Switch from CTA card to form card

- **GIVEN** a lead capture card is visible
- **WHEN** the user taps "获取专属服务方案"
- **THEN** the page smoothly transitions the result-area lead card to an inline form card containing company name, province/city/district, detailed address, and the submit button
- **AND** the page does not open a modal or bottom popup

#### Scenario: Default address is reused

- **GIVEN** the user has queried an address on the delivery area page
- **WHEN** the lead capture form card is shown
- **THEN** the province/city/district field defaults to the queried address

#### Scenario: Required fields are missing

- **GIVEN** the lead capture form card is visible
- **WHEN** the user taps "领取新客专属福利" with required fields empty
- **THEN** the page shows validation feedback and does not navigate to the H5 result page

### Requirement: Navigate to lead capture result H5

The delivery area page SHALL navigate to the configured H5 apply result page after the lead capture form passes validation.

#### Scenario: Successful form navigation

- **GIVEN** the lead capture form card is complete
- **WHEN** the user taps "领取新客专属福利"
- **THEN** the page opens `https://ic-h5-uat.kye-erp.com/customer-code.html#/apply-result`
- **AND** the URL includes `from=home`, `express_type=绑码组件`, `hasLeadCapture=10`, `status=1`, `contactsName`, `companyName`, `phone`, `workId`, and `backSence`

#### Scenario: Coupon fields are reserved

- **GIVEN** coupon interface data has not been integrated
- **WHEN** the page builds the H5 result URL
- **THEN** `couponStatus` and `couponNumber` remain reserved optional parameters and missing values do not block navigation
