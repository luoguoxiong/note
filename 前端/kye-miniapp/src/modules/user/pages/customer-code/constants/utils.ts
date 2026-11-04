export const getApplyStatusText = ({ applyStatus }: { applyStatus?: string }) => {
  const statusIconUrl =
    applyStatus == '0'
      ? 'https://ic-img.ky-express.com/netc/20260630_78974_!!1782800222994_120_120.svg+xml'
      : 'https://ic-img.ky-express.com/netc/20260630_67451_!!1782800427717_120_120.svg+xml'
  const statusText = applyStatus == '0' ? '已提交成功' : '等待审批中'

  return {
    statusIconUrl,
    statusText,
  }
}
