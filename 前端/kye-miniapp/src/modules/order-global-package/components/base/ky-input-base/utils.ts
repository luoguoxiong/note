/**
 * 过滤 Emoji
 */
export const filterEmoji = (value: string) => {
  return value.replace(/(\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|[\u2600-\u2B55]/g, '')
}
