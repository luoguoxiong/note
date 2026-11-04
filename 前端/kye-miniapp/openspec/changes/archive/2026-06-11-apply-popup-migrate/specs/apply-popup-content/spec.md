## ADDED Requirements

### Requirement: Apply Popup Content renders status view for non-applying states

When `status` is not `FeeAuthApplyStatus.申请查看` (i.e., 申请中 or 申请失败), the component SHALL render the status view containing an icon, title, application time, application reason, and a contact card with business QR code.

#### Scenario: Display pending application status
- **WHEN** `status` equals `FeeAuthApplyStatus.申请中`
- **THEN** the component renders the status icon (`auth-apply-status`), the title from `title` prop, the text "您于 {{ applyTime }} 已申请查看运费", the text "申请原因：{{ applyReason }}", and the contact card

#### Scenario: Display failed application status
- **WHEN** `status` equals `FeeAuthApplyStatus.申请失败`
- **THEN** the component renders the status view with `title` set to "申请失败"

#### Scenario: Contact card with business QR
- **WHEN** the status view is rendered and `showBusinessQr` is `true` and `modalShow` is `true`
- **THEN** the component renders the business QR image alongside the contact button

#### Scenario: Contact card without business QR
- **WHEN** the status view is rendered and `showBusinessQr` is `false`
- **THEN** the component renders the contact card without the QR image

### Requirement: Apply Popup Content renders input view for applying state

When `status` equals `FeeAuthApplyStatus.申请查看`, the component SHALL render a textarea for the user to enter an application reason.

#### Scenario: Display textarea input
- **WHEN** `status` equals `FeeAuthApplyStatus.申请查看`
- **THEN** the component renders a `KyTextarea` with placeholder "请填写申请原因，便于{{ contactTypeDesc }}为您快速开通", maxlength 150, 5 rows, word limit enabled, and wx native mode enabled

#### Scenario: Textarea v-model binding
- **WHEN** the user types in the textarea
- **THEN** the component emits `update:modelValue` with the current input value

#### Scenario: Textarea disabled state
- **WHEN** `textDisable` prop is `true`
- **THEN** the textarea SHALL be disabled and non-clearable

#### Scenario: Textarea enabled state
- **WHEN** `textDisable` prop is `false`
- **THEN** the textarea SHALL be enabled with clear button visible

### Requirement: Apply Popup Content emits contact event

The component SHALL emit a `contact` event when the user taps the "联系{{ contactButtonName }}" button in the status view, without implementing the actual contact mechanism.

#### Scenario: Tap contact button
- **WHEN** the user taps the contact button in the status view
- **THEN** the component emits a `contact` event to the parent

### Requirement: Apply Popup Content handles optional data gracefully

The component SHALL render empty or fallback values when optional props are not provided.

#### Scenario: Missing apply time
- **WHEN** `applyTime` prop is empty or undefined
- **THEN** the component still renders "您于 已申请查看运费" without crashing

#### Scenario: Missing apply reason
- **WHEN** `applyReason` prop is empty or undefined
- **THEN** the component still renders "申请原因：" without crashing

#### Scenario: Missing contact info
- **WHEN** `contactTypeDesc` or `contactButtonName` props are empty
- **THEN** the component still renders the contact card section without crashing
