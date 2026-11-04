# delivery-area-tracking 规范

## Purpose
Define delivery area page tracking for page view, search, result actions, and lead form interactions.

## Requirements
### Requirement: Report delivery area page view

The delivery area page MUST report a page view event when the user views the page on WeChat mini program, Alipay mini program, or H5.

#### Scenario: Page view is reported

- **GIVEN** the user opens or returns to the delivery area page
- **WHEN** the page is shown
- **THEN** the system MUST report a PV event with `page_code` equal to `page_delivery_range`
- **AND** the event parameters MUST include `event_code` equal to `page_delivery_range`
- **AND** the event parameters MUST include `page_name` equal to `配送范围_主页`
- **AND** the event parameters MUST include `work_id`
- **AND** the event type MUST be page event `2001`

### Requirement: Reuse delivery area page work id

Delivery area tracking events within the same page view MUST use the same `work_id`.

#### Scenario: Same page view reuses work id

- **GIVEN** the user opens or returns to the delivery area page
- **WHEN** the page is shown
- **THEN** the system MUST generate a page-level `work_id`
- **AND** the page view event MUST use that `work_id`
- **AND** subsequent delivery area search click, result click, lead form exposure, lead form field click, and lead form submit click events in the same page view MUST use that same `work_id`

#### Scenario: New page view refreshes work id

- **GIVEN** the user opens or returns to the delivery area page again
- **WHEN** the page is shown again
- **THEN** the system MUST generate a new page-level `work_id` for the new page view

### Requirement: Report delivery area search click

The delivery area page MUST report a click event when the user taps the search button.

#### Scenario: Search button click is reported

- **GIVEN** the user has selected a query address on the delivery area page
- **WHEN** the user taps `查询`
- **THEN** the system MUST report `clk_delivery_range_search_v1`
- **AND** the event parameters MUST include `page_code` equal to `page_delivery_range`
- **AND** the event parameters MUST include `page_name` equal to `配送范围_主页`
- **AND** the event parameters MUST include `region_code` equal to `top_search`
- **AND** the event parameters MUST include `region_name` equal to `顶部查询区`
- **AND** the event parameters MUST include `content_name` equal to the visible query address text
- **AND** the event parameters MUST include the current page-level `work_id`

### Requirement: Report delivery area result button clicks

The delivery area page MUST report a result area click event when the user taps a query result action button.

#### Scenario: Lead service plan entry click is reported

- **GIVEN** the query result displays the new customer lead card
- **WHEN** the user taps `获取专属服务方案`
- **THEN** the system MUST report `clk_delivery_range_results_v1`
- **AND** the event parameters MUST include `page_code` equal to `page_delivery_range`
- **AND** the event parameters MUST include `page_name` equal to `配送范围_主页`
- **AND** the event parameters MUST include `region_code` equal to `search_results`
- **AND** the event parameters MUST include `region_name` equal to `查询结果区`
- **AND** the event parameters MUST include `button_name` equal to `获取专属服务方案`
- **AND** the event parameters MUST include the current page-level `work_id`

#### Scenario: Send order button click is reported

- **GIVEN** the query result displays the original send order button
- **WHEN** the user taps `去寄件`
- **THEN** the system MUST report `clk_delivery_range_results_v1`
- **AND** the event parameters MUST include `button_name` equal to `去寄件`
- **AND** the event parameters MUST include `region_code` equal to `search_results`

#### Scenario: Contact business button click is reported

- **GIVEN** the query result displays the contact business button
- **WHEN** the user taps `联系商务`
- **THEN** the system MUST report `clk_delivery_range_results_v1`
- **AND** the event parameters MUST include `button_name` equal to `联系商务`
- **AND** the event parameters MUST include `region_code` equal to `search_results`

### Requirement: Report delivery area lead form card exposure

The delivery area page MUST report an exposure event when the new customer lead form card becomes visible.

#### Scenario: Lead form card exposure is reported

- **GIVEN** the query result displays the `获取专属服务方案` entry
- **WHEN** the user taps the entry and the inline lead form card is shown
- **THEN** the system MUST report `exp_delivery_range_get_service`
- **AND** the event parameters MUST include `page_code` equal to `page_delivery_range`
- **AND** the event parameters MUST include `page_name` equal to `配送范围_主页`
- **AND** the event parameters MUST include `region_code` equal to `search_results`
- **AND** the event parameters MUST include `region_name` equal to `查询结果区`
- **AND** the event parameters MUST include the current page-level `work_id`
- **AND** the event type MUST be exposure event `2201`

### Requirement: Report delivery area lead form button clicks

The delivery area page MUST report a form click event when the user taps a lead form action button.

#### Scenario: Lead benefit submit click is reported

- **GIVEN** the inline lead form card is visible
- **WHEN** the user taps `领取新客专属福利`
- **THEN** the system MUST report `clk_delivery_range_get_service`
- **AND** the event parameters MUST include `page_code` equal to `page_delivery_range`
- **AND** the event parameters MUST include `page_name` equal to `配送范围_主页`
- **AND** the event parameters MUST include `region_code` equal to `search_results`
- **AND** the event parameters MUST include `region_name` equal to `查询结果区`
- **AND** the event parameters MUST include `button_name` equal to `领取新客专属福利`
- **AND** the event parameters MUST include the current page-level `work_id`
- **AND** the click MUST be reported even if required field validation later fails

#### Scenario: Generic submit button value remains supported

- **GIVEN** the inline lead form card later displays a submit action named `提交`
- **WHEN** the user taps `提交`
- **THEN** the system MUST report `clk_delivery_range_get_service`
- **AND** the event parameters MUST include `button_name` equal to `提交`
