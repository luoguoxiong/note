// 按钮数组
export const menu = [
  {
    title: '联系商务',
    icon: 'https://ic-img.ky-express.com/netc/20250116_19967474283_!!1737020388901_48_48.png',
    action: '',
  },
  {
    title: '在线客户',
    icon: 'https://ic-img.ky-express.com/netc/20250116_19967474283_!!1737020388901_48_48.png',
    action: '',
  },
  {
    title: '催派',
    icon: 'https://ic-img.ky-express.com/netc/20250116_19967474283_!!1737020388901_48_48.png',
    action: '',
  },
  {
    title: '签收确认',
    icon: 'https://ic-img.ky-express.com/netc/20250116_19967474283_!!1737020388901_48_48.png',
    action: '',
  },
  {
    title: '回单资料',
    icon: 'https://ic-img.ky-express.com/netc/20250116_19967474283_!!1737020388901_48_48.png',
    action: '',
    subscript: () => {
      return '未上传'
    },
  },
  {
    title: '派货资料',
    icon: 'https://ic-img.ky-express.com/netc/20250116_19967474283_!!1737020388901_48_48.png',
    action: '',
    subscript: () => {
      return '未上传'
    },
  },
  {
    title: '定时派送',
    icon: 'https://ic-img.ky-express.com/netc/20250116_19967474283_!!1737020388901_48_48.png',
    action: '',
  },
  {
    title: '打印面单',
    icon: 'https://ic-img.ky-express.com/netc/20250116_19967474283_!!1737020388901_48_48.png',
    action: '',
    subscript: (total?: number) => {
      return `已打印${total || 0}次`
    },
  },
]

// 节点图标
export const nodeIcons = {
  'node-start': 'https://ic-img.ky-express.com/netc/20250117_28267474269_!!1737078598469_96_96.png',
  'node-end': 'https://ic-img.ky-express.com/netc/20250117_68767474219_!!1737078598461_96_96.png',
  'node-plane-start': 'https://ic-img.ky-express.com/netc/20250117_85067474267_!!1737078598466_96_96.png',
  'node-plane-end': 'https://ic-img.ky-express.com/netc/20250117_81967474262_!!1737078598464_96_96.png',
  'node-process': 'https://ic-img.ky-express.com/netc/20250117_57067474247_!!1737078598467_96_96.png',
}
