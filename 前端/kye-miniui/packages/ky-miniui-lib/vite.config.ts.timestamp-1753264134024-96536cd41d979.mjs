// vite.config.ts
import { defineConfig } from "file:///D:/kye-work/kye-mini/kye-miniui/node_modules/.pnpm/vite@4.5.5_@types+node@20.5_3b155de4b3f4bd621b114c729aac8780/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/kye-work/kye-mini/kye-miniui/node_modules/.pnpm/@vitejs+plugin-vue@4.6.2_vi_9dffedafca652be8dc256d9f8988155f/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import * as path from "path";
import VueJsx from "file:///D:/kye-work/kye-mini/kye-miniui/node_modules/.pnpm/@vitejs+plugin-vue-jsx@3.1._f5c2821495bb96fadd0f8693a046cf43/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import dts from "file:///D:/kye-work/kye-mini/kye-miniui/node_modules/.pnpm/vite-plugin-dts@4.5.0_@type_eaaee96bab528afa36d0814964e2322b/node_modules/vite-plugin-dts/dist/index.mjs";
import { viteStaticCopy } from "file:///D:/kye-work/kye-mini/kye-miniui/node_modules/.pnpm/vite-plugin-static-copy@2.2_cca387da783180b6e244347791b67be8/node_modules/vite-plugin-static-copy/dist/index.js";
var __vite_injected_original_dirname = "D:\\kye-work\\kye-mini\\kye-miniui\\packages\\ky-miniui-lib";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxreWUtd29ya1xcXFxreWUtbWluaVxcXFxreWUtbWluaXVpXFxcXHBhY2thZ2VzXFxcXGt5LW1pbml1aS1saWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGt5ZS13b3JrXFxcXGt5ZS1taW5pXFxcXGt5ZS1taW5pdWlcXFxccGFja2FnZXNcXFxca3ktbWluaXVpLWxpYlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDova3llLXdvcmsva3llLW1pbmkva3llLW1pbml1aS9wYWNrYWdlcy9reS1taW5pdWktbGliL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IFZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4J1xyXG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cydcclxuaW1wb3J0IHsgdml0ZVN0YXRpY0NvcHkgfSBmcm9tICd2aXRlLXBsdWdpbi1zdGF0aWMtY29weSdcclxuXHJcbi8vIEB0cy1pZ25vcmVcclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICByb290OiAnLi8nLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBmaW5kOiAnQHBhY2thZ2VzJyxcclxuICAgICAgICByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzJyksXHJcbiAgICAgIH0sXHJcbiAgICAgIHsgZmluZDogJ0AnLCByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzJykgfSxcclxuICAgIF0sXHJcbiAgICBleHRlbnNpb25zOiBbJy50cycsICcudHN4JywgJy5kLnRzJywgJy52dWUnLCAnLmpzJywgJy5qc29uJ10sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICB2dWUoKSxcclxuICAgIFZ1ZUpzeCgpLFxyXG4gICAgZHRzKHtcclxuICAgICAgaW5zZXJ0VHlwZXNFbnRyeTogdHJ1ZSxcclxuICAgICAgc3RhdGljSW1wb3J0OiB0cnVlLFxyXG4gICAgICBjb3B5RHRzRmlsZXM6IHRydWUsXHJcbiAgICB9KSxcclxuICAgIHZpdGVTdGF0aWNDb3B5KHtcclxuICAgICAgdGFyZ2V0czogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHNyYzogJy4uLy4uL3BhY2thZ2VzJywgLy8gXHU4OTgxXHU1OTBEXHU1MjM2XHU3Njg0XHU2RTkwXHU2NTg3XHU0RUY2XHU1OTM5XHU2MjE2XHU2NTg3XHU0RUY2XHJcbiAgICAgICAgICBkZXN0OiAnJywgLy8gXHU1OTBEXHU1MjM2XHU1MjMwIGRpc3QgXHU0RTJEXHU3Njg0XHU3NkVFXHU2ODA3XHU2NTg3XHU0RUY2XHU1OTM5XHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgY3NzOiB7XHJcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgIHNjc3M6IHtcclxuICAgICAgICAvLyBcdTgxRUFcdTUyQThcdTZDRThcdTUxNjVcdTUxNjhcdTVDNDBcdTUzRDhcdTkxQ0ZcdTMwMDFcdTUxRkRcdTY1NzBcdTYyMTZcdTZERjdcdTU0MDhcclxuICAgICAgICBhZGRpdGlvbmFsRGF0YTogYEB1c2UgXCIuLi9zY3NzL2Jhc2UvdmFyaWFibGUuc2Nzc1wiIGFzICo7YCxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgbWluaWZ5OiB0cnVlLFxyXG4gICAgdGFyZ2V0OiAnZXMyMDE1JyxcclxuICAgIGxpYjoge1xyXG4gICAgICBlbnRyeTogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vaW5kZXgudHMnKSxcclxuICAgICAgbmFtZTogJ2t5LW1pbml1aS1saWInLFxyXG4gICAgICBmaWxlTmFtZTogKGZvcm1hdCkgPT4gYGt5LW1pbml1aS1saWIuJHtmb3JtYXR9LmpzYCxcclxuICAgIH0sXHJcbiAgICBvdXREaXI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9saWInKSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgZXh0ZXJuYWw6IFsndnVlJywgJ0B0YXJvanMvdGFybyddLFxyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBnbG9iYWxzOiB7XHJcbiAgICAgICAgICB2dWU6ICdWdWUnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1csU0FBUyxvQkFBb0I7QUFDN1gsT0FBTyxTQUFTO0FBQ2hCLFlBQVksVUFBVTtBQUN0QixPQUFPLFlBQVk7QUFDbkIsT0FBTyxTQUFTO0FBQ2hCLFNBQVMsc0JBQXNCO0FBTC9CLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixhQUFrQixhQUFRLGtDQUFXLGdCQUFnQjtBQUFBLE1BQ3ZEO0FBQUEsTUFDQSxFQUFFLE1BQU0sS0FBSyxhQUFrQixhQUFRLGtDQUFXLGdCQUFnQixFQUFFO0FBQUEsSUFDdEU7QUFBQSxJQUNBLFlBQVksQ0FBQyxPQUFPLFFBQVEsU0FBUyxRQUFRLE9BQU8sT0FBTztBQUFBLEVBQzdEO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxJQUFJO0FBQUEsTUFDRixrQkFBa0I7QUFBQSxNQUNsQixjQUFjO0FBQUEsTUFDZCxjQUFjO0FBQUEsSUFDaEIsQ0FBQztBQUFBLElBQ0QsZUFBZTtBQUFBLE1BQ2IsU0FBUztBQUFBLFFBQ1A7QUFBQSxVQUNFLEtBQUs7QUFBQTtBQUFBLFVBQ0wsTUFBTTtBQUFBO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxxQkFBcUI7QUFBQSxNQUNuQixNQUFNO0FBQUE7QUFBQSxRQUVKLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLEtBQUs7QUFBQSxNQUNILE9BQVksYUFBUSxrQ0FBVyxZQUFZO0FBQUEsTUFDM0MsTUFBTTtBQUFBLE1BQ04sVUFBVSxDQUFDLFdBQVcsaUJBQWlCLE1BQU07QUFBQSxJQUMvQztBQUFBLElBQ0EsUUFBYSxhQUFRLGtDQUFXLFdBQVc7QUFBQSxJQUMzQyxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsT0FBTyxjQUFjO0FBQUEsTUFDaEMsUUFBUTtBQUFBLFFBQ04sU0FBUztBQUFBLFVBQ1AsS0FBSztBQUFBLFFBQ1A7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
