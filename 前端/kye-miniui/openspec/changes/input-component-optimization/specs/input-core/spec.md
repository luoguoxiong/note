## MODIFIED Requirements

### Requirement: Core input logic extraction
The Input component's core logic (value management, input handling, clear functionality) SHALL be extracted into composables for reuse across platforms.

#### Scenario: Shared logic between platforms
- **WHEN** `input.vue` and `input-h5.vue` both need to handle input events
- **THEN** both components use the same `useInputCore` composable
- **AND** changes to input handling logic only need to be made in one place

### Requirement: Unified state management
The Input component SHALL use reactive state object instead of multiple refs for better organization.

#### Scenario: State updates
- **WHEN** input value changes
- **THEN** all related state updates are managed through a single reactive object
- **AND** state changes are predictable and traceable

### Requirement: Debounce unified management
All debounced operations in the Input component SHALL be centralized for better control.

#### Scenario: Clear cancels debounces
- **WHEN** user clicks clear button
- **THEN** all pending debounced operations are canceled
- **AND** input is cleared immediately