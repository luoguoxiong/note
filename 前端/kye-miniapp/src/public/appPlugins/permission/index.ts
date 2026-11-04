import { safeJsonParse } from '../utils/common'
import { getNativePlugin } from '@public/appPlugins/utils/pluginLoader'

const PERMISSION_PLUGIN_ID = 'wxbe1a61223a0aa4d7'

type AppPermissionStatus = '1' | '0' | '-1'

type AppPermissionType = 'location' | 'contacts' | 'storage' | 'camera' | 'photo' | 'bluetooth' | 'microphone'

// 全量结构
type AppPermissionStatusRes = Record<AppPermissionType, AppPermissionStatus>

// ✅ 全量常量（关键）
const ALL_PERMISSIONS: AppPermissionType[] = [
  'location',
  'contacts',
  'storage',
  'camera',
  'photo',
  'bluetooth',
  'microphone',
]

export async function getAppPermission<T extends AppPermissionType>(
  permission?: T[],
): Promise<Record<T, AppPermissionStatus> | AppPermissionStatusRes> {
  const finalPermission = permission ?? ALL_PERMISSIONS
  const plugin = await getNativePlugin(PERMISSION_PLUGIN_ID, 'getPermission')
  const result = plugin?.getPermissionStatusSync(
    {
      permission: finalPermission,
    },
    (res: any) => {
      console.error('getPermissionStatusSync', res, typeof res)
    },
  )
  const parseResult = safeJsonParse(result, {
    decode: false,
  }) as any
  if (parseResult.code === 0) {
    return parseResult.data
  }
  throw parseResult
}
