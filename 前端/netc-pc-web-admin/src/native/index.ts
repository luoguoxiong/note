import { native } from '@kye-netc/micro-native'
import * as electron from './electron/index'
import * as global from './global/index'
import * as bom from './bom/index'
import * as dom from './dom/index'
import * as router from './router/index'
import * as ui from './ui/index'

native.register({ ...electron, ...global, ...bom, ...dom, ...router, ...ui })
