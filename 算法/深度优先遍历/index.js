const data = {
  label: '1',
  children: [
    {
      label: '1-1',
      children: [
        { label: '1-1-1', children: [] },
        { label: '1-1-2', children: [] },
      ],
    },
    {
      label: '1-2',
      children: [
        { label: '1-2-1', children: [] },
        { label: '1-2-2', children: [] },
      ],
    },
  ],
};

// 递归
function Tree(data, nodes = []) {
  if (data !== null) {
    nodes.push(data.label);
    for (let i = 0; i < data.children.length; i++) {
      Tree(data.children[i], nodes);
    }
  }
  return nodes;
}

function Tree2(data) {
  const stack = [];
  const nodes = [];
  stack.push(data);
  while (stack.length) {
    item = stack.pop();
    nodes.push(item.label);
    for (let i = item.children.length - 1; i >= 0; i--) {
      stack.push(item.children[i]);
    }
  }
  return nodes;
}

const node = Tree2(data);
console.log(JSON.stringify(node));
