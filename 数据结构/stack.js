// 栈 时间复杂度 0(n);保证它们的顺序并且遵循 LIFO 原则 后进先出
class Stack {
  constructor() {
    this.count = 0;
    this.items = {};
  }

  push(element) {
    this.items[this.count] = element;
    this.count++;
  }

  pop() {
    if (this.isEmpty()) {
      return undefined;
    } else {
      this.count--;
      const element = this.items[this.count];
      delete this.items[this.count];
      return element;
    }
  }

  peek() {
    if (this.isEmpty()) {
      return undefined;
    } else {
      return this.items[this.count - 1];
    }
  }

  isEmpty() {
    return this.count === 0;
  }

  size() {
    return this.count;
  }

  clear() {
    this.count = 0;
    this.items = {};
  }

  toString() {
    if (this.isEmpty()) {
      return '';
    }
    let objString = `${this.items[0]}`;
    for (let i = 1; i < this.count; i++) {
      objString = `${objString},${this.items[i]}`;
    }
    return objString;
  }
}

const stack = new Stack();

stack.push(1);
stack.push(2);

console.log(stack.toString());
