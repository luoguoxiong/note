import { createAsyncComp } from '@/public/utils/createAsyncComponent'

export const VersionUpdatePopup = createAsyncComp(() => import('./index.vue'))
