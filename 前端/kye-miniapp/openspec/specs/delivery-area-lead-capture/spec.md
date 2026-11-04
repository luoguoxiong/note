# delivery-area-lead-capture 规范

## 目的

待定 - 由归档变更 add-delivery-area-lead-card 创建。归档后请更新目的。

## 需求

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
- **AND** the page does not display the original contact business action

#### Scenario: Unsupported result keeps contact action hidden when lead status fails

- **GIVEN** the current logged-in user can be identified as a new customer
- **WHEN** the delivery result is unsupported and the lead capture status request fails
- **THEN** the page does not display the lead capture card
- **AND** the page does not display the original contact business action

### Requirement: Open and validate lead capture form half popup

The delivery area page SHALL replace the lead capture card with a bottom half-popup-style form when the user taps "获取专属服务方案" and MUST validate required fields before navigation.

#### Scenario: Open lead form half popup from CTA card

- **GIVEN** a lead capture card is visible
- **WHEN** the user taps "获取专属服务方案"
- **THEN** the page replaces the lead capture card with a bottom half-popup-style form containing company name, province/city/district, detailed address, and the submit button
- **AND** the delivery query result remains visible and is not covered by the form
- **AND** the popup uses no visible mask overlay
- **AND** the form uses a transition when replacing the lead capture card
- **AND** the page scrolls to the bottom so the form is visible

#### Scenario: Close lead form half popup

- **GIVEN** the lead capture form half popup is visible
- **WHEN** the user taps a non-form area on the page
- **THEN** the page closes the half popup with a transition

#### Scenario: Default address is reused

- **GIVEN** the user has queried an address on the delivery area page
- **WHEN** the lead capture form half popup is shown
- **THEN** the province/city/district field defaults to the queried address

#### Scenario: Required fields are missing

- **GIVEN** the lead capture form half popup is visible
- **WHEN** the user taps the form submit button with required fields empty
- **THEN** the page shows validation feedback and does not navigate to the H5 result page

#### Scenario: Form controls follow enterprise popup specification

- **GIVEN** the lead capture form half popup is visible
- **WHEN** company name, province/city/district, or detailed address controls are empty, focused, filled, or invalid
- **THEN** the input and picker controls use the latest enterprise popup default, focus, filled, and error states
- **AND** validation errors are shown with field-level red styling and a black error bubble
- **AND** the submit button uses the latest enterprise popup default, pressed, and loading states
- **AND** the half popup container style remains unchanged

### Requirement: Navigate to lead capture result H5

The delivery area page SHALL navigate to the configured H5 apply result page after the lead capture form passes validation.

#### Scenario: Successful form navigation

- **GIVEN** the lead capture form card is complete
- **WHEN** the user taps the form submit button
- **THEN** the page opens `https://ic-h5-uat.kye-erp.com/customer-code.html#/apply-result`
- **AND** the URL includes `from=home`, `express_type=绑码组件`, `hasLeadCapture=10`, `status=1`, `contactsName`, `companyName`, `phone`, `workId`, and `backSence`

#### Scenario: Coupon fields are reserved

- **GIVEN** coupon interface data has not been integrated
- **WHEN** the page builds the H5 result URL
- **THEN** `couponStatus` and `couponNumber` remain reserved optional parameters and missing values do not block navigation

### Requirement: Report delivery area lead capture analytics

The delivery area page SHALL follow the latest delivery range analytics definition for page, query, result, lead form exposure, field clicks, and submit outcome events.

#### Scenario: Report page and query result events

- **GIVEN** the user opens the delivery area page
- **WHEN** the page is shown
- **THEN** the page reports `page_delivery_range` with page name `配送范围_主页`
- **WHEN** the user taps the query button
- **THEN** the page reports `clk_delivery_range_search_v1` with `content_name` and `work_id`
- **WHEN** the user taps result actions "获取专属服务方案", "去寄件", or "联系商务"
- **THEN** the page reports `clk_delivery_range_results_v1` with `button_name` and `work_id`

#### Scenario: Report lead form exposure and field clicks

- **GIVEN** the lead capture card is visible
- **WHEN** the user taps "获取专属服务方案"
- **THEN** the page reports `exp_delivery_range_get_service` with `work_id`
- **WHEN** the user focuses company name, taps province/city/district, or focuses detailed address
- **THEN** the page reports `clk_delivery_range_company_name`, `clk_delivery_range_third_level_address`, or `clk_delivery_range_detailed_address` with `work_id`

#### Scenario: Report lead form close and submit outcome

- **GIVEN** the lead capture form half popup is visible
- **WHEN** the user closes the form by tapping a non-form area
- **THEN** the page closes the form without reporting a close action event
- **WHEN** the user submits the form and it navigates to the result H5
- **THEN** the page reports `clk_delivery_range_get_service` with `activity_result=成功`
- **WHEN** validation or submit failure prevents navigation to the result H5
- **THEN** the page reports `clk_delivery_range_get_service` with `activity_result=失败`
