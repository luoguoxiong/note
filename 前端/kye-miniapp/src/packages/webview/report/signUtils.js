/**
 * @Desc: signUtils
 * @Author: wu xingtao
 * @Date: 2024/6/3
 */
// url 是否是面签签到页
export const is_sign_in_h5 = (url) => {
  let result = false
  try {
    const decodeUrl = decodeURIComponent(url)
    result = decodeUrl.includes('sign-in')
  } catch (e) {
    console.log(e)
  }
  return result
}

export default {}
