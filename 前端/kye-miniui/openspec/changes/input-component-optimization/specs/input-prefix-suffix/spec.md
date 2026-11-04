## ADDED Requirements

### Requirement: Input component supports prefix slot
The Input component SHALL provide a `prefix` slot for displaying content before the input area.

#### Scenario: Render prefix content
- **WHEN** user provides content in the `prefix` slot
- **THEN** content is displayed to the left of the input field
- **AND** content does not interfere with input functionality

### Requirement: Input component supports suffix slot
The Input component SHALL provide a `suffix` slot for displaying content after the input area but before the clear button.

#### Scenario: Render suffix content
- **WHEN** user provides content in the `suffix` slot
- **THEN** content is displayed to the right of the input field and before the clear button
- **AND** content does not interfere with input functionality or clear button