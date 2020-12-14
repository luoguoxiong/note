// https://leetcode-cn.com/problems/rotate-list/solution/dong-tu-suan-fa-xuan-zhuan-lian-biao-si-chong-ji-3/
/*
输入: 1->2->3->4->5->NULL, k = 2
输出: 4->5->1->2->3->NULL
解释:
向右旋转 1 步: 5->1->2->3->4->NULL
向右旋转 2 步: 4->5->1->2->3->NULL
*/

function ListNode(val, next) {
  this.val = val === undefined ? 0 : val;
  this.next = next === undefined ? null : next;
}
// 穷举法
// 1. 计算长度
// 2.去重
// 3.重新建立链表
const rotateRight = (head, k) => {
  let len = 0; // 链表长度
  let current = head;
  while (current.next) {
    len++;
    current = current.next;
  }

  k = k % len; //去重

  while (k > 0) {
    k--;
    current = head;
    //   找到倒数第二项
    while (current.next.next) {
      current = current.next;
    }
    current.next.next = head; // 链表最后一项指向头部形成环
    head = current.next; // 定位新的头节点
    current.next = null; // 打断链表环
  }
  return head;
};

// 哈希法
const rotateRight = (head, k) => {
  if (!head || !head.next) return head;
  let curr = head,
    n = 0;
  let hash = new Map();
  // 遍历并将数据存入map
  while (curr && ++n) {
    hash.set(n, curr);
    curr = curr.next;
  }
  k = k % n; // 去重
  // 通过查找map对链表进行操作
  hash.get(n).next = head; // 链表最后一项指向头部形成环
  head = hash.get(n - k).next; // 定位新的头节点
  hash.get(n - k).next = null; // 打断链表环
  return head;
};

// 快慢指针
// fast先走K
// fast===slow?
const rotateRight = function (head, k) {
  let fast = head,
    slow = head;
  // fast 先走k步
  // 是否先判断下？
  while (k--) {
    if (fast && fast.next) {
      fast = fast.next;
    } else {
      fast = head;
    }
  }
  // slow == fast说明k会被链表长度整除，故无需操作head直接返回即可
  if (slow === fast) return head;
  // 快慢指针start
  while (fast.next) {
    slow = slow.next;
    fast = fast.next;
  }
  // 对慢指针位置进行打断
  fast.next = head;
  head = slow.next;
  slow.next = null;
  return head;
};

// 链表转环
const rotateRight = (head, k) => {
  if (!head) return null;
  let curr = head,
    n = 0;
  while (++n && curr.next) curr = curr.next;
  // 形成环链表
  curr.next = head;
  k = k % n; // 去重
  while (++k < n) head = head.next; // 找到打断位置
  // 对环链表打断再拼接得到答案
  let tmp = head;
  head = head.next;
  tmp.next = null;
  return head;
};
