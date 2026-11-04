## ADDED Requirements

### Requirement: Input component supports word limit display
The Input component SHALL display the current character count and maximum length when `showWordLimit` is true and `maxlength` is set.

#### Scenario: Show word limit with maxlength
- **WHEN** `showWordLimit` is true and `maxlength` is set to 100
- **THEN** component displays "0/100" when empty
- **AND** count updates as user types

#### Scenario: Hide word limit when disabled
- **WHEN** `showWordLimit` is false
- **THEN** no word limit display is shown

### Requirement: Word limit display style
The word limit SHALL be displayed in the bottom-right corner of the input field with appropriate styling.

#### Scenario: Word limit positioning
- **WHEN** input has multiple lines
- **THEN** word limit remains visible and does not overlap with input content