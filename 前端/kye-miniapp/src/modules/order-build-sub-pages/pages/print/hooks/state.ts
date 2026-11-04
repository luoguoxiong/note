import { ref } from 'vue'
import { btnListType, VisibleAuth } from './type'
import { KyRadioProps } from '@order-public-sub-public/components/base/ky-radio/types'
export const tagList: btnListType[] = [
  {
    type: '10',
    typeName: '大标签',
    typeNameDes: '(宽76mm*长130mm)',
  },
  {
    type: '20',
    typeName: '小标签*3',
    typeNameDes: '(宽76mm*长130mm)',
  },
]

export const stubTemplateList: btnListType[] = [
  {
    type: '5',
    typeName: '寄方存根',
    typeNameDes: '(宽76mm*长130mm)',
  },
]

export const childTemplateList: btnListType[] = [
  {
    type: '8',
    typeName: '子母单',
    typeNameDes: '(宽76mm*长130mm)',
  },
]

export const templateList: btnListType[] = [
  {
    type: '4',
    typeName: '随货联',
    typeNameDes: '(宽76mm*长130mm)',
  },
  ...stubTemplateList,
  {
    type: '10',
    typeName: '一联二面随货联',
    typeNameDes: '(宽76mm*长88mm)',
  },
  {
    type: '12',
    typeName: '一联二面寄方存根',
    typeNameDes: '(宽76mm*长88mm)',
  },
]

export const waybillLabelTemplateList: btnListType[] = [
  {
    type: '11',
    typeName: '小标签*2',
    typeNameDes: '(宽76mm*长88mm)',
  },
]

export const mdList: btnListType[] = [
  {
    type: 'big',
    typeName: '全部面单',
    typeNameDes: '',
  },
  {
    type: 'small',
    typeName: '面单页码',
    typeNameDes: '',
  },
]
export const markFontList: KyRadioProps[] = [
  {
    name: '4',
    text: '4号字体',
  },
  {
    name: '6',
    text: '6号字体',
  },
  {
    name: '8',
    text: '8号字体',
  },
  {
    name: '10',
    text: '10号字体',
  },
  {
    name: '12',
    text: '12号字体',
  },
]

export const parentChildrenPermission = ref<VisibleAuth>()
export const changeCountPermission = ref<VisibleAuth>()
export const labelPermission = ref<VisibleAuth>()
export const waybillStatusDisabled = ref(false)
export const popVisible = ref(false)
// export const labelPermission = ref(false) // web.print.getMobileSimpleWaybillInfo返回labelPermission全为 10 时展示 打印标签
// export const changeCountPermission = ref(false) // web.print.getMobileSimpleWaybillInfo返回changeCountPermission全为 10 时可以修改件数

// 打印来源
export const printSource = ref<string>()

// 是否显示气泡
export const bubbleVisible = ref(false)
