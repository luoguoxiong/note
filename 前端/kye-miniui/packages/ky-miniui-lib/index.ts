import ActionSheet from '@ky-miniui-lib/action-sheet'
import AutoComplete from '@ky-miniui-lib/auto-complete'
import Button from '@ky-miniui-lib/button'
import Calendar from '@ky-miniui-lib/calendar'
import Cell from '@ky-miniui-lib/cell'
import CellGroup from '@ky-miniui-lib/cell-group'
import Checkbox from '@ky-miniui-lib/checkbox'
import Checkboxgroup from '@ky-miniui-lib/checkboxgroup'
import Circle from '@ky-miniui-lib/circle'
import Container from '@ky-miniui-lib/container'
import CropperImage from '@ky-miniui-lib/cropper-image'
import Empty from '@ky-miniui-lib/empty'
import Field from '@ky-miniui-lib/field'
import FloatPagination from '@ky-miniui-lib/float-pagination'
import FloatingBubble from '@ky-miniui-lib/floating-bubble'
import FloatingPanel from '@ky-miniui-lib/floating-panel'
import Form from '@ky-miniui-lib/form'
import ImagePreview, { showImagePreview } from '@ky-miniui-lib/image-preview'
import Input from '@ky-miniui-lib/input'
import List from '@ky-miniui-lib/list'
import ListStandard from '@ky-miniui-lib/list-standard'
import ListVirtual from '@ky-miniui-lib/list-virtual'
import Loading from '@ky-miniui-lib/loading'
import Navbar from '@ky-miniui-lib/navbar'
import Overlay from '@ky-miniui-lib/overlay'
import Picker from '@ky-miniui-lib/picker'
import Popover from '@ky-miniui-lib/popover'
import PopoverMenu from '@ky-miniui-lib/popover-menu'
import Popup from '@ky-miniui-lib/popup'
import Radio from '@ky-miniui-lib/radio'
import Radiogroup from '@ky-miniui-lib/radiogroup'
import SwipeCell from '@ky-miniui-lib/swipe-cell'
import SwipeGroup from '@ky-miniui-lib/swipe-group'
import Swiper from '@ky-miniui-lib/swiper'
import SwiperItem from '@ky-miniui-lib/swiper-item'
import Switch from '@ky-miniui-lib/switch'
import Tab from '@ky-miniui-lib/tab'
import Tag from '@ky-miniui-lib/tag'
import Text from '@ky-miniui-lib/text'
import Textarea from '@ky-miniui-lib/textarea'
import Timepicker from '@ky-miniui-lib/timepicker'
import TimeSelect from '@ky-miniui-lib/time-select'
import KyTransition from '@ky-miniui-lib/transition'
// import Upload from '@ky-miniui-lib/upload'
// import component end // 勿删
import Dialog, { showDialog } from '@ky-miniui-lib/dialog'
import { miniuiConfig } from '@ky-miniui-lib/utils'

import { App } from 'vue'
import '../scss/index.scss'

const components = [
  Button,
  Radio,
  Radiogroup,
  Popup,
  // PopupSimple,
  KyTransition,
  Overlay,
  Checkbox,
  Checkboxgroup,
  Switch,
  Dialog,
  Loading,
  Picker,
  Timepicker,
  TimeSelect,
  Tab,
  Text,
  Calendar,
  Container,
  Navbar,
  Empty,
  FloatingPanel,
  FloatingBubble,
  Tag,
  Popover,
  ImagePreview,
  AutoComplete,
  Input,
  List,
  Textarea,
  Cell,
  ActionSheet,
  // Upload,
  CellGroup,
  SwipeGroup,
  ListStandard,
  Circle,
  SwipeCell,
  Field,
  Form,
  PopoverMenu,
  Swiper,
  SwiperItem,
  FloatPagination,
  CropperImage,
  ListVirtual,
] // components // 勿删

// 全局动态添加组件
const install = (app: App): void => {
  components.forEach((component: any) => {
    if (component.install) {
      app.use(component)
    } else if (component.name) {
      app.component(component.name, component)
    }
  })
}

export {
  ActionSheet,
  AutoComplete,
  Button,
  Calendar,
  Cell,
  CellGroup,
  Checkbox,
  Checkboxgroup,
  Circle,
  components,
  Container,
  Dialog,
  Empty,
  Field,
  FloatingBubble,
  FloatingPanel,
  FloatPagination,
  Form,
  ImagePreview,
  Input,
  KyTransition,
  List,
  ListStandard,
  ListVirtual,
  Loading,
  Navbar,
  Overlay,
  Picker,
  Popover,
  PopoverMenu,
  Popup,
  Radio,
  Radiogroup,
  showDialog,
  showImagePreview,
  SwipeCell,
  SwipeGroup,
  Swiper,
  SwiperItem,
  Switch,
  Tab,
  Tag,
  Text,
  Textarea,
  Timepicker,
  TimeSelect,
  // Upload,
} // export components // 勿删

export default {
  install,
  miniuiConfig,
  version: '0.0.1',
}
