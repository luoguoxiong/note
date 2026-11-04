// 阿里小程序部分
export default function useCommonUtils() {
  // 寄收点位、状态点位
  const SendReceiveMarker = () => {
    return {
      // iconPath: 'https://avatars2.githubusercontent.com/u/1782542?s=460&u=d20514a52100ed1f82282bcfca6f49052793c889&v=4',
      id: 5,
      latitude: 23.099994,
      longitude: 113.32452,
      width: 50,
      height: 50,
    }
  }

  return {
    SendReceiveMarker,
  }
}
