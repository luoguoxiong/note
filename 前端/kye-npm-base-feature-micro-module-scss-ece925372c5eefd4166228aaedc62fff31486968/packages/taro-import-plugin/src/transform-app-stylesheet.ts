import type { CompilationAssets, AsyncPackOpts } from './types'
import { getExt } from './utils'
interface Opts extends AsyncPackOpts {
  assets: CompilationAssets
}

export const transformAppStylesheet = (code: string, opts: Opts) => {
  const { dynamicPackageNamePrefix, assets } = opts

  const isDynamicModuleStyleFileExist = Object.keys(assets).some((assetName) => {
    return new RegExp(`${dynamicPackageNamePrefix}\\.(?:wxss|acss)`).test(assetName)
  })

  if (!isDynamicModuleStyleFileExist) return code

  return code.concat(`@import './${dynamicPackageNamePrefix}.${getExt()}';`)
}
