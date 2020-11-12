// 双端队列
class Dueue {
  constructor() {
    this.count = 0; // 下一个添加的位置
    this.lowestCount = 0; // 第一个元素的位置
    this.items = {};
  }
  /*
   * 1.双端队列是空的，添加的尾部
   * 2.一个元素已经被从双端队列的前端移除
   * 3.lowestCount 为 0 的情况，后续数据向后移一位
   */
  addFront(element) {
    if (this.isEmpty()) {
      this.addBack(element);
    } else if (this.lowestCount > 0) {
      this.lowestCount--;
      this.items[this.lowestCount] = element;
    } else {
      for (let i = this.count; i > 0; i--) {
        this.items[i] = this.count[i - 1];
      }
      this.count++;
      this.items[0] = element;
    }
  }

  // 后添加
  addBack(element) {
    this.items[this.count] = element;
    this.count++;
  }

  //移除第一个元素
  removeFront() {
    if (this.isEmpty()) {
      return undefined;
    }
    const ele = this.items[this.lowestCount];
    delete this.items[this.lowestCount];
    this.lowestCount++;
    return ele;
  }

  // 移除最后一个
  removeBack() {
    if (this.isEmpty()) {
      return undefined;
    } else {
      this.count--;
      const element = this.items[this.count];
      delete this.items[this.count];
      return element;
    }
  }

  // 获取第一个元素
  peekFront() {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items[this.lowestCount];
  }

  // 获取最后一个元素
  peekBack() {
    if (this.isEmpty()) {
      return undefined;
    } else {
      return this.items[this.count - 1];
    }
  }

  size() {
    return this.count - this.lowestCount;
  }

  isEmpty() {
    return this.size() === 0;
  }
}
