## ADDED Requirements

### Requirement: Input component supports built-in validation
The Input component SHALL support a `rules` prop for defining validation rules.

#### Scenario: Required validation
- **WHEN** `rules` contains `{ type: 'required', message: 'Please enter' }`
- **AND** input is empty and loses focus
- **THEN** error state is triggered
- **AND** error message is displayed

#### Scenario: Pattern validation
- **WHEN** `rules` contains `{ type: 'pattern', pattern: /^[a-z]+$/, message: 'Only lowercase' }`
- **AND** user enters "ABC"
- **THEN** error state is triggered

### Requirement: Built-in validators
The Input component SHALL provide built-in validators for: required, minLength, maxLength, pattern, email, phone.

#### Scenario: Email validation
- **WHEN** `rules` contains `{ type: 'email', message: 'Invalid email' }`
- **AND** user enters "invalid-email"
- **THEN** error state is triggered

### Requirement: Custom validator support
The Input component SHALL support custom validation functions.

#### Scenario: Custom validator
- **WHEN** `rules` contains `{ validator: (value) => value.length > 5, message: 'Too short' }`
- **AND** user enters "abc"
- **THEN** error state is triggered