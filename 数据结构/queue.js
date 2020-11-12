// 队列 FIFO 先进先出
class Queue {
  constructor() {
    this.count = 0; // 队列大小
    this.lowestCount = 0; // 第一个元素
    this.items = {};
  }

  // 添加元素
  enqueue(element) {
    this.items[this.count] = element;
    this.count++;
  }

  // 移除队列第一项元素
  dequenue() {
    if (this.isEmpty()) {
      return undefined;
    }
    const ele = this.items[this.lowestCount];
    delete this.items[this.lowestCount];
    this.lowestCount++;
    return ele;
  }

  // 返回队列第一个元素，最先被添加的
  peek() {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items[this.lowestCount];
  }

  isEmpty() {
    return this.size() === 0;
  }

  size() {
    return this.count - this.lowestCount;
  }

  toString() {
    if (this.isEmpty()) {
      return '';
    }
    let objString = `${this.items[this.lowestCount]}`;
    for (let i = this.lowestCount + 1; i < this.count; i++) {
      objString = `${objString},${this.items[i]}`;
    }
    return objString;
  }
}

const queue = new Queue();
queue.enqueue('11');
queue.enqueue('22');
queue.dequenue();

console.log(queue.toString());
