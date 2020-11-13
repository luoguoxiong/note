// 单向链表 火车头数据结构

class Node {
  constructor(element) {
    this.element = element;
    this.next = undefined;
  }
}

class LinkedList {
  constructor() {
    this.count = 0;
    this.header = undefined;
    this.equalsFn = (a, b) => a === b;
  }
  // 尾部添加
  push(element) {
    const node = new Node(element);
    if (this.header === undefined) {
      this.header = node;
    } else {
      // 遍历数据，找到next为null的节点
    }
    this.count++;
  }
  // 中间插入
  insert() {}
  // 返回列表中特定位置的元素
  getElementAt(index) {}
  // 链表移除一个元素
  remove() {}
  // 获取链表中的索引
  indexOf() {}
  // 移除某个位置的元素
  removeAt(index) {}
  isEmpty() {}
  size() {}
  toString() {}
}
