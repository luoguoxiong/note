import { h } from 'vue'
import { UploadProps } from '@packages/__components/upload/src/types'

export default function useH5Upload(props: UploadProps, { disabled }) {
  const renderInput = () => {
    let params: any = {
      class: `ky-upload__input`,
      type: 'file',
      accept: props.accept,
      multiple: props.multiple,
      name: props.name,
      disabled: disabled.value,
    }

    if (props.capture) {
      params.capture = 'camera'
      if (!params.accept) {
        params.accept = 'image/*'
      }
    }

    return h('input', params)
  }
  return {
    renderInput,
  }
}
