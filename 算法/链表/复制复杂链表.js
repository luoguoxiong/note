// https://leetcode-cn.com/problems/fu-za-lian-biao-de-fu-zhi-lcof/

/*
 * 第一次遍历，复制每个节点和 next 指针，并且保存“原节点-复制节点”的映射关系
 * 第二次遍历，通过哈希表获得节点对应的复制节点，更新 random 指针
 */
/**
 * function Node(val, next, random) {
 *    this.val = val;
 *    this.next = next;
 *    this.random = random;
 * };
 */
/**
 * @param {Node} head
 * @return {Node}
 */
var copyRandomList = function (head) {
  if (!head) {
    return null;
  }
  const map = new Map();

  let node = head; // 当前节点

  const newHead = new Node(node.val);

  let newNode = newHead; // 当前节点的copy

  map.set(node, newNode);

  // 生成新的链表及存下 node-newNode
  while (node.next) {
    newNode.next = new Node(node.next.val);
    node = node.next;
    newNode = newNode.next;
    map.set(node, newNode);
  }

  // newNode = newHead;

  // node = head;

  // while (newNode) {
  //   newNode.random = map.get(node.random);
  //   newNode = newNode.next;
  //   node = node.next;
  // }

  return newHead;
};
