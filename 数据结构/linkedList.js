// 单向链表 火车头数据结构

class Node {
  constructor(element) {
    this.element = element;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.count = 0;
    this.header = null;
  }
  // 尾部添加
  push(element) {
    const node = new Node(element);
    if (this.header === null) {
      this.header = node;
    } else {
      // 遍历数据，找到next为null的节点
      let current = this.header;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
    this.count++;
  }

  // 返回列表中特定位置的元素
  getElementAt(index) {
    if (index >= 0 && this.count > index) {
      let current = this.header;
      for (let i = 0; i < index && current !== null; i++) {
        current = current.next;
      }
      return current;
    }
    return undefined;
  }

  // 中间插入
  insert(index, element) {
    if (index >= 0 && this.count > index) {
      const node = new Node(element);
      if (index === 0) {
        node.next = this.header;
        this.header = node;
      } else {
        const prev = this.getElementAt(index - 1);
        const next = prev.next;
        node.next = next;
        prev.next = node;
      }
      this.count++;
      return true;
    }
    return false;
  }

  // 移除某个位置的元素
  removeAt(index) {
    if (index >= 0 && this.count > index) {
      let current;
      if (index === 0) {
        current = this.header;
        this.header = current.next;
      } else {
        const previous = this.getElementAt(index - 1);
        current = previous.next;
        previous.next = current.next;
      }
      this.count--;
      return current;
    }
    return undefined;
  }

  // 获取链表中的索引
  indexOf(element) {
    let current = this.header;
    for (let i = 0; i < this.count; i++) {
      if (current.element === element) {
        return i;
      }
      current = current.next;
    }
    return -1;
  }

  // 链表移除一个元素
  remove(element) {
    const index = this.indexOf(element);
    return this.removeAt(index);
  }
  isEmpty() {
    return this.count === 0;
  }
  size() {
    return this.count;
  }
  toString() {
    if (this.header == null) {
      return '';
    }
    let objString = `${this.header.element}`;
    let current = this.header.next;
    for (let i = 1; i < this.size() && current != null; i++) {
      objString = `${objString},${current.element}`;
      current = current.next;
    }
    return objString;
  }
}

const link = new LinkedList();

link.push(1);
link.push(2);
console.log(link.getElementAt(1));
console.log(link.toString());
