## MODIFIED Requirements

### Requirement: Platform adaptation layer
The Input component SHALL have a unified platform adaptation layer in `index.vue` that handles environment detection and component selection.

#### Scenario: Platform detection
- **WHEN** component is initialized in WeChat MiniProgram
- **THEN** `input.vue` is rendered
- **AND** platform-specific logic is applied

#### Scenario: Platform detection for H5
- **WHEN** component is initialized in H5 environment
- **THEN** `input-h5.vue` is rendered
- **AND** H5-specific logic is applied

### Requirement: Platform-specific props handling
The Input component SHALL automatically apply platform-specific props based on the detected environment.

#### Scenario: WeChat native component
- **WHEN** `enableWxNative` is true in WeChat MiniProgram
- **THEN** `custom-input` component is used instead of standard input
- **AND** native platform props are passed correctly