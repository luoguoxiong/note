/** UUID v4 生成器（从 @order-public/utils 迁移） */
export const uuid = (): string => {
  function b(a?: number) {
    return a
      ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
      : (([1e7] as any) + -[1e3] + -4e3 + -8e3 + -1e11).replace(/[018]/g, b)
  }
  return b()
}
