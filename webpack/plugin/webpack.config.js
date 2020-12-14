const DemoWebpackPlugin = require('./myPlugin');
const config = {
  mode: 'development',
  entry: './index.js',
  output: {
    filename: `./dist.js`, // 输出文件
  },
  plugins: [new DemoWebpackPlugin({ filename: 'dist.json' })],
};

module.exports = config;
