# 小程序项目子应用

## 开发必看
- 子应用是能独立运行的项目
- 子应用独立运行开发时需要将public子应用拉到本地
- src下app.config.ts，app.scss，app.ts，index.html，作用只是为了让子应用单独运行，如果要修改这些文件请将修改同步到主应用的app.config.ts，app.scss，app.ts，index.html，中
- 开发过程中如需要引入主应用的路径请使用别名例如@public，@modules，@layout，请不要将自身项目的路径设为别名，因为后续打包构建的过程中不会读子应用中的配置文件，而是读取主应用的配置文件