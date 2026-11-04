// vite.config.ts
import { defineConfig } from "file:///D:/Program%20Files/code/kye-miniui/node_modules/.pnpm/vite@4.5.5_@types+node@20.5.1_less@3.13.1_lightningcss@1.29.1_sass@1.83.4_stylus@0.64.0_terser@5.37.0/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/Program%20Files/code/kye-miniui/node_modules/.pnpm/@vitejs+plugin-vue@4.6.2_vite@4.5.5_@types+node@18.19.71_less@3.13.1_lightningcss@1.29.1_sass_ukqkj7mqvwnhudwwvefv2i3u3e/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import * as path from "path";
import VueJsx from "file:///D:/Program%20Files/code/kye-miniui/node_modules/.pnpm/@vitejs+plugin-vue-jsx@3.1.0_vite@4.5.5_@types+node@20.5.1_less@3.13.1_lightningcss@1.29.1_sa_6btjlqp6oup46cvlchfb3ppfam/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import dts from "file:///D:/Program%20Files/code/kye-miniui/node_modules/.pnpm/vite-plugin-dts@4.5.0_@types+node@20.5.1_rollup@4.46.2_typescript@5.7.3_vite@4.5.5_@types+nod_2fjdm4a5zvvokeqdr2nll5gt3u/node_modules/vite-plugin-dts/dist/index.mjs";
import { viteStaticCopy } from "file:///D:/Program%20Files/code/kye-miniui/node_modules/.pnpm/vite-plugin-static-copy@2.2.0_vite@4.5.5_@types+node@20.5.1_less@3.13.1_lightningcss@1.29.1_s_je6i3svwygx5qw76z5sis3a4di/node_modules/vite-plugin-static-copy/dist/index.js";
var __vite_injected_original_dirname = "D:\\Program Files\\code\\kye-miniui\\packages\\ky-miniui-lib";
var vite_config_default = defineConfig({
  root: "./",
  resolve: {
    alias: [
      {
        find: "@packages",
        replacement: path.resolve(__vite_injected_original_dirname, "../../packages")
      },
      { find: "@", replacement: path.resolve(__vite_injected_original_dirname, "../../packages") }
    ],
    extensions: [".ts", ".tsx", ".d.ts", ".vue", ".js", ".json"]
  },
  plugins: [
    vue(),
    VueJsx(),
    dts({
      insertTypesEntry: true,
      staticImport: true,
      copyDtsFiles: true
    }),
    viteStaticCopy({
      targets: [
        {
          src: "../../packages/__native/",
          // 原生组件目录
          dest: "packages/"
          // dist 下的目标文件夹
        },
        {
          src: "../../packages",
          // 要复制的源文件夹或文件
          dest: ""
          // 复制到 dist 中的目标文件夹
        }
      ]
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // 自动注入全局变量、函数或混合
        additionalData: `@use "../scss/base/variable.scss" as *;`
      }
    }
  },
  build: {
    minify: true,
    target: "es2015",
    lib: {
      entry: path.resolve(__vite_injected_original_dirname, "./index.ts"),
      name: "ky-miniui-lib",
      fileName: (format) => `ky-miniui-lib.${format}.js`
    },
    outDir: path.resolve(__vite_injected_original_dirname, "../../lib"),
    rollupOptions: {
      external: ["vue", "@tarojs/taro"],
      output: {
        globals: {
          vue: "Vue"
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQcm9ncmFtIEZpbGVzXFxcXGNvZGVcXFxca3llLW1pbml1aVxcXFxwYWNrYWdlc1xcXFxreS1taW5pdWktbGliXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQcm9ncmFtIEZpbGVzXFxcXGNvZGVcXFxca3llLW1pbml1aVxcXFxwYWNrYWdlc1xcXFxreS1taW5pdWktbGliXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9Qcm9ncmFtJTIwRmlsZXMvY29kZS9reWUtbWluaXVpL3BhY2thZ2VzL2t5LW1pbml1aS1saWIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgVnVlSnN4IGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnXHJcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJ1xyXG5pbXBvcnQgeyB2aXRlU3RhdGljQ29weSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5J1xyXG5cclxuLy8gQHRzLWlnbm9yZVxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHJvb3Q6ICcuLycsXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIGZpbmQ6ICdAcGFja2FnZXMnLFxyXG4gICAgICAgIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMnKSxcclxuICAgICAgfSxcclxuICAgICAgeyBmaW5kOiAnQCcsIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMnKSB9LFxyXG4gICAgXSxcclxuICAgIGV4dGVuc2lvbnM6IFsnLnRzJywgJy50c3gnLCAnLmQudHMnLCAnLnZ1ZScsICcuanMnLCAnLmpzb24nXSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHZ1ZSgpLFxyXG4gICAgVnVlSnN4KCksXHJcbiAgICBkdHMoe1xyXG4gICAgICBpbnNlcnRUeXBlc0VudHJ5OiB0cnVlLFxyXG4gICAgICBzdGF0aWNJbXBvcnQ6IHRydWUsXHJcbiAgICAgIGNvcHlEdHNGaWxlczogdHJ1ZSxcclxuICAgIH0pLFxyXG4gICAgdml0ZVN0YXRpY0NvcHkoe1xyXG4gICAgICB0YXJnZXRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgc3JjOiAnLi4vLi4vcGFja2FnZXMvX19uYXRpdmUvJywgLy8gXHU1MzlGXHU3NTFGXHU3RUM0XHU0RUY2XHU3NkVFXHU1RjU1XHJcbiAgICAgICAgICBkZXN0OiAncGFja2FnZXMvJywgLy8gZGlzdCBcdTRFMEJcdTc2ODRcdTc2RUVcdTY4MDdcdTY1ODdcdTRFRjZcdTU5MzlcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHNyYzogJy4uLy4uL3BhY2thZ2VzJywgLy8gXHU4OTgxXHU1OTBEXHU1MjM2XHU3Njg0XHU2RTkwXHU2NTg3XHU0RUY2XHU1OTM5XHU2MjE2XHU2NTg3XHU0RUY2XHJcbiAgICAgICAgICBkZXN0OiAnJywgLy8gXHU1OTBEXHU1MjM2XHU1MjMwIGRpc3QgXHU0RTJEXHU3Njg0XHU3NkVFXHU2ODA3XHU2NTg3XHU0RUY2XHU1OTM5XHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgY3NzOiB7XHJcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgIHNjc3M6IHtcclxuICAgICAgICAvLyBcdTgxRUFcdTUyQThcdTZDRThcdTUxNjVcdTUxNjhcdTVDNDBcdTUzRDhcdTkxQ0ZcdTMwMDFcdTUxRkRcdTY1NzBcdTYyMTZcdTZERjdcdTU0MDhcclxuICAgICAgICBhZGRpdGlvbmFsRGF0YTogYEB1c2UgXCIuLi9zY3NzL2Jhc2UvdmFyaWFibGUuc2Nzc1wiIGFzICo7YCxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgbWluaWZ5OiB0cnVlLFxyXG4gICAgdGFyZ2V0OiAnZXMyMDE1JyxcclxuICAgIGxpYjoge1xyXG4gICAgICBlbnRyeTogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vaW5kZXgudHMnKSxcclxuICAgICAgbmFtZTogJ2t5LW1pbml1aS1saWInLFxyXG4gICAgICBmaWxlTmFtZTogKGZvcm1hdCkgPT4gYGt5LW1pbml1aS1saWIuJHtmb3JtYXR9LmpzYCxcclxuICAgIH0sXHJcbiAgICBvdXREaXI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9saWInKSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgZXh0ZXJuYWw6IFsndnVlJywgJ0B0YXJvanMvdGFybyddLFxyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBnbG9iYWxzOiB7XHJcbiAgICAgICAgICB2dWU6ICdWdWUnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVcsU0FBUyxvQkFBb0I7QUFDbFksT0FBTyxTQUFTO0FBQ2hCLFlBQVksVUFBVTtBQUN0QixPQUFPLFlBQVk7QUFDbkIsT0FBTyxTQUFTO0FBQ2hCLFNBQVMsc0JBQXNCO0FBTC9CLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixhQUFrQixhQUFRLGtDQUFXLGdCQUFnQjtBQUFBLE1BQ3ZEO0FBQUEsTUFDQSxFQUFFLE1BQU0sS0FBSyxhQUFrQixhQUFRLGtDQUFXLGdCQUFnQixFQUFFO0FBQUEsSUFDdEU7QUFBQSxJQUNBLFlBQVksQ0FBQyxPQUFPLFFBQVEsU0FBUyxRQUFRLE9BQU8sT0FBTztBQUFBLEVBQzdEO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxJQUFJO0FBQUEsTUFDRixrQkFBa0I7QUFBQSxNQUNsQixjQUFjO0FBQUEsTUFDZCxjQUFjO0FBQUEsSUFDaEIsQ0FBQztBQUFBLElBQ0QsZUFBZTtBQUFBLE1BQ2IsU0FBUztBQUFBLFFBQ1A7QUFBQSxVQUNFLEtBQUs7QUFBQTtBQUFBLFVBQ0wsTUFBTTtBQUFBO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLEtBQUs7QUFBQTtBQUFBLFVBQ0wsTUFBTTtBQUFBO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxxQkFBcUI7QUFBQSxNQUNuQixNQUFNO0FBQUE7QUFBQSxRQUVKLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLEtBQUs7QUFBQSxNQUNILE9BQVksYUFBUSxrQ0FBVyxZQUFZO0FBQUEsTUFDM0MsTUFBTTtBQUFBLE1BQ04sVUFBVSxDQUFDLFdBQVcsaUJBQWlCLE1BQU07QUFBQSxJQUMvQztBQUFBLElBQ0EsUUFBYSxhQUFRLGtDQUFXLFdBQVc7QUFBQSxJQUMzQyxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsT0FBTyxjQUFjO0FBQUEsTUFDaEMsUUFBUTtBQUFBLFFBQ04sU0FBUztBQUFBLFVBQ1AsS0FBSztBQUFBLFFBQ1A7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
