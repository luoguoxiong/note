const { debounce } = require('../utils/index.js')

Component({
  properties: {
    type: { type: String, value: 'text' },
    placeholder: { type: String, value: '' },
    placeholderStyle: { type: String, value: '' },
    disabled: { type: Boolean, value: false },
    focus: { type: Boolean, value: false },
    alwaysEmbed: { type: Boolean, value: false },
    adjustPosition: { type: Boolean, value: true },
    autoFill: { type: Boolean, value: false },
    cursor: { type: Number, value: -1 },
    cursorSpacing: { type: Number, value: 0 },
    password: { type: Boolean, value: false },

    inputDebounce: {
      type: Number,
      value: 100,
    },

    selectionStart: { type: Number, value: -1 },
    selectionEnd: { type: Number, value: -1 },

    holdKeyboard: { type: Boolean, value: false },

    shouldFocus: { type: Boolean, value: false },

    value: {
      type: String,
      value: '',
      observer(newVal) {
        if (newVal !== this.data.innerValue) {
          this.setData({
            innerValue: newVal,
          })
        }
      },
    },

    maxlength: {
      type: Number,
      value: 140,
      observer(val) {
        if (val === 0) {
          this.setData({
            maxlength: 140,
          })
        }
      },
    },
  },

  data: {
    innerValue: '',
    isFocus: false,
    isInputting: '',
  },

  lifetimes: {
    attached() {
      this.inputThrottleFn = debounce((e) => {
        const value = e.detail.value
        this.setData(
          {
            isInputting: false,
            innerValue: value,
          },
          () => {
            this.triggerEvent('input', e.detail)
          },
        )
      }, this.data.inputDebounce)
      // this.data.inputDebounce
    },
  },

  methods: {
    onInput(e) {
      this.setData({
        isInputting: true,
      })
      this.inputThrottleFn(e)
    },

    onFocus(e) {
      this.triggerEvent('focus', e.detail)
    },

    onBlur(e) {
      this.triggerEvent('blur', e.detail)
    },

    onConfirm(e) {
      this.triggerEvent('confirm', e.detail)
    },

    onKeyboardHeightChange(e) {
      this.triggerEvent('keyboardHeightChange', e.detail)
    },

    updateCurrentValue(value) {
      this.setData({
        innerValue: value,
      })
    },
  },
})
