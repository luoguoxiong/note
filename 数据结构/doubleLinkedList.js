class Node {
  constructor(element, next) {
    this.element = element;
    this.next = next;
  }
}
class DoubleLinkNode extends Node {
  constructor(element, next, prev) {
    super(element, next);
    this.prev = prev;
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

class DoubleLinkList extends LinkedList {
  constructor() {
    super(LinkedList);
    this.tail = null; // 标记末尾的元素
  }
  // 向任意位置添加元素
  insert(element, index) {
    if (index >= 0 && this.count > index) {
      let current = '';
      const node = new DoubleLinkNode(element);
      // 头部添加
      if (index === 0) {
        current = this.header;
        //   如果没有数据
        if (current === null) {
          this.header = node;
          this.tail = node;
        } else {
          current.prev = node;
          node.next = current;
          this.header = node;
        }
        //   末尾添加
      } else if (index === this.count) {
        current = this.tail;
        node.prev = current;
        current.next = node;
        this.tail = node;
        //   中间添加
      } else {
        current = this.getElementAt(index);
        const prev = current.prev;
        const next = prev.next;
        prev.next = node;
        node.prev = prev;
        node.next = next;
        next.prev = node;
      }
      this.count++;
      return true;
    }
    return false;
  }
  // 删除某个位置的元素
  removeAt(index) {
    if (index >= 0 && index < this.count) {
      let current = this.head;
      if (index === 0) {
        this.head = current.next;
        if (this.count === 1) {
          this.tail = undefined;
        } else {
          this.head.prev = undefined;
        }
      } else if (index === this.count - 1) {
        current = this.tail;
        this.tail = current.prev;
        this.tail.next = undefined;
      } else {
        current = this.getElementAt(index);
        const previous = current.prev;
        previous.next = current.next;
        current.next.prev = previous;
      }
      this.count--;
      return current.element;
    }
    return undefined;
  }
}
