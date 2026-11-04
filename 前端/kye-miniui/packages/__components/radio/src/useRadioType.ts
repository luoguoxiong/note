import { computed } from 'vue'
import { RadioProps } from './types'

/* radio type图片枚举 */
enum radioTypeEnum {
  round = 'round',
  check = 'check',
  button = 'button',
  buttonCheck = 'buttonCheck',
  buttonSelect = 'buttonSelect',
}

// Define the possible radio types
type RadioIconUrls = {
  checked: string
  unchecked: string
  'checked-disabled': string
  'unchecked-disabled': string
  error: string
}

const radioTypeIcons: Record<radioTypeEnum, RadioIconUrls> = {
  [radioTypeEnum.round]: {
    checked: 'https://ic-img.ky-express.com/netc/20250726_54190_!!1753523802237_80_80.png',
    unchecked: 'https://ic-img.ky-express.com/netc/20250726_5743_!!1753523802230_80_80.png',
    'checked-disabled': 'https://ic-img.ky-express.com/netc/20250726_1854_!!1753523802220_80_80.png',
    'unchecked-disabled': 'https://ic-img.ky-express.com/netc/20250726_8716_!!1753523802232_80_80.png',
    error: 'https://ic-img.ky-express.com/netc/20250726_27549_!!1753523802236_80_80.png',
  },
  [radioTypeEnum.check]: {
    checked: 'https://ic-img.ky-express.com/netc/20250726_4288_!!1753523802233_80_80.png',
    unchecked: 'https://ic-img.ky-express.com/netc/20250726_5743_!!1753523802230_80_80.png',
    'checked-disabled': 'https://ic-img.ky-express.com/netc/20250726_58250_!!1753523802235_80_80.png',
    'unchecked-disabled': 'https://ic-img.ky-express.com/netc/20250726_8716_!!1753523802232_80_80.png',
    error: 'https://ic-img.ky-express.com/netc/20250726_27549_!!1753523802236_80_80.png',
  },
  [radioTypeEnum.button]: {
    checked: 'https://ic-img.ky-express.com/netc/20250726_54190_!!1753523802237_80_80.png',
    unchecked: 'https://ic-img.ky-express.com/netc/20250726_5743_!!1753523802230_80_80.png',
    'checked-disabled': 'https://ic-img.ky-express.com/netc/20250726_1854_!!1753523802220_80_80.png',
    'unchecked-disabled': 'https://ic-img.ky-express.com/netc/20250726_8716_!!1753523802232_80_80.png',
    error: 'https://ic-img.ky-express.com/netc/20250726_27549_!!1753523802236_80_80.png',
  },
  [radioTypeEnum.buttonCheck]: {
    checked: 'https://ic-img.ky-express.com/netc/20250726_4288_!!1753523802233_80_80.png',
    unchecked: 'https://ic-img.ky-express.com/netc/20250726_5743_!!1753523802230_80_80.png',
    'checked-disabled': 'https://ic-img.ky-express.com/netc/20250726_58250_!!1753523802235_80_80.png',
    'unchecked-disabled': 'https://ic-img.ky-express.com/netc/20250726_8716_!!1753523802232_80_80.png',
    error: 'https://ic-img.ky-express.com/netc/20250726_27549_!!1753523802236_80_80.png',
  },
  [radioTypeEnum.buttonSelect]: {
    checked: 'https://ic-img.ky-express.com/netc/20250726_49055_!!1753524514614_112_100.png',
    unchecked: '',
    'checked-disabled': '',
    'unchecked-disabled': '',
    error: '',
  },
}

interface FunctionProps {
  checked: any
  disabled: any
  isError: any
  type: any
}

export default (
  props: RadioProps,
  { checked, disabled, isError, type }: FunctionProps = {
    checked: null,
    disabled: null,
    isError: null,
    type: null,
  },
) => {
  const radioIconType = computed(() => {
    const error = isError?.value && !checked.value
    if (error) {
      return 'error'
    }
    return `${checked.value ? 'checked' : 'unchecked'}${!disabled.value ? '' : '-disabled'}`
  })

  // radio 当前图标
  const radioIcon = computed(() => {
    const typeValue = type?.value as radioTypeEnum
    // @ts-ignore
    return radioTypeIcons[typeValue][radioIconType.value]
  })
  return {
    radioIcon,
  }
}
