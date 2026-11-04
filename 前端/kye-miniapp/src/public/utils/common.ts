import { PC_DESIGN_WIDTH } from '../h5/config'
import { isH5FSEnv, isPcFSEnv } from './device'
import plateform from '@kye-netc/plateform'

export const getDeleteSource = () => {
  let deleteSource = '350'
  if (isH5FSEnv) {
    deleteSource = '760'
  }
  return deleteSource
}

export function px2real(designPx: number, designWidth: number = 750) {
  let { windowWidth } = plateform.getWindowInfo()
  const screenWidth = isPcFSEnv ? PC_DESIGN_WIDTH : windowWidth
  const scale = screenWidth / designWidth
  return designPx * scale
}
