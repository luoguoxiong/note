'use strict';
const url = require('url');

function buildManifest(compiler, compilation) {
  let context = compiler.options.context;
  let manifest = {};
  compilation.chunks.forEach((chunk) => {
    // chunk.files.forEach((file) => {
    //   for (const module in chunk) {
    //     let id = module.id;
    //     let name = typeof module.libIdent === 'function' ? module.libIdent({ context }) : null;
    //     let publicPath = url.resolve(compilation.outputOptions.publicPath || '', file);
    //     let currentModule = module;
    //     if (module.constructor.name === 'ConcatenatedModule') {
    //       currentModule = module.rootModule;
    //     }
    //     if (!manifest[currentModule.rawRequest]) {
    //       manifest[currentModule.rawRequest] = [];
    //     }
    //     manifest[currentModule.rawRequest].push({ id, name, file, publicPath });
    //   }
    // });
  });

  console.log(manifest);
  return manifest;
}

class ReactLoadablePlugin {
  constructor(opts = {}) {
    this.filename = opts.filename;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('DemoWebpackPlugin', (compilation, callback) => {
      const manifest = buildManifest(compiler, compilation);
      var json = JSON.stringify(manifest, null, 2);
      compilation.assets[this.filename] = {
        source() {
          return json;
        },
        size() {
          return json.length;
        },
      };
      callback();
    });
  }
}

module.exports = ReactLoadablePlugin;
