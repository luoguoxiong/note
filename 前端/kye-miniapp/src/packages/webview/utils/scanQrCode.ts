export const faceToFaceMap = {
  faceToFaceMap: {},
  faceToFaceMapUpdate(key: string, value: string | number) {
    this.faceToFaceMap[key] = value
  },
  faceToFaceMapKeyGet(key: string) {
    return this.faceToFaceMap[key]
  },
}
