// 前序遍历 根->左->右

// 递归方法
var preorderTraversal = function (root) {
  return root ? [root.val, ...preorderTraversal(root.left), ...preorderTraversal(root.right)] : [];
};

// 栈方法
var preorderTraversal = function (root) {
  let arr = [],
    res = [];
  root && arr.push(root);

  while (arr.length > 0) {
    let cur = arr.pop();
    res.push(cur.val);

    cur.right && arr.push(cur.right);
    cur.left && arr.push(cur.left);
  }
  return res;
};
