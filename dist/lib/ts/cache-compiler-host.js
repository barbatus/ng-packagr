'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const ts = require('typescript');
const ng = require('@angular/compiler-cli');
const path = require('path');
const pug = require('pug');
const path_1 = require('../util/path');
const nodes_1 = require('../ng-v5/nodes');
const node_1 = require('../brocc/node');
function cacheCompilerHost(graph, entryPoint, compilerOptions, moduleResolutionCache, stylesheetProcessor) {
  const { sourcesFileCache } = entryPoint.cache;
  const compilerHost = ng.createCompilerHost({ options: compilerOptions });
  const addDependee = fileName => {
    const nodeUri = nodes_1.fileUrl(path_1.ensureUnixPath(fileName));
    let node = graph.get(nodeUri);
    if (!node) {
      node = new node_1.Node(nodeUri);
      graph.put(node);
    }
    entryPoint.dependsOn(node);
  };
  return Object.assign({}, compilerHost, {
    // ts specific
    fileExists: fileName => {
      const cache = sourcesFileCache.getOrCreate(fileName);
      if (cache.exists === undefined) {
        cache.exists = compilerHost.fileExists.call(this, fileName);
      }
      return cache.exists;
    },
    getSourceFile: (fileName, languageVersion) => {
      addDependee(fileName);
      const cache = sourcesFileCache.getOrCreate(fileName);
      if (!cache.sourceFile) {
        cache.sourceFile = compilerHost.getSourceFile.call(this, fileName, languageVersion);
      }
      return cache.sourceFile;
    },
    writeFile: (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
      if (fileName.endsWith('.d.ts')) {
        sourceFiles.forEach(source => {
          const cache = sourcesFileCache.getOrCreate(source.fileName);
          if (!cache.declarationFileName) {
            cache.declarationFileName = path_1.ensureUnixPath(fileName);
          }
        });
      }
      compilerHost.writeFile.call(this, fileName, data, writeByteOrderMark, onError, sourceFiles);
    },
    readFile: fileName => {
      addDependee(fileName);
      const cache = sourcesFileCache.getOrCreate(fileName);
      if (cache.content === undefined) {
        cache.content = compilerHost.readFile.call(this, fileName);
      }
      return cache.content;
    },
    // ng specific
    moduleNameToFileName: (moduleName, containingFile) => {
      const { resolvedModule } = ts.resolveModuleName(
        moduleName,
        path_1.ensureUnixPath(containingFile),
        compilerOptions,
        compilerHost,
        moduleResolutionCache
      );
      return resolvedModule && resolvedModule.resolvedFileName;
    },
    resourceNameToFileName: (resourceName, containingFilePath) => {
      return path.resolve(path.dirname(containingFilePath), resourceName);
    },
    readResource: fileName => {
      addDependee(fileName);
      const cache = sourcesFileCache.getOrCreate(fileName);
      if (cache.content === undefined) {
        // todo: transform styles here.
        // the empty string is needed because of include paths file's won't be resolved properly.
        cache.content = compilerHost.readFile.call(this, fileName);
        if (/(pug)$/.test(path.extname(fileName))) {
          cache.content = pug.render(cache.content, { doctype: 'html' });
        } else if (!/(html|htm)$/.test(path.extname(fileName))) {
          cache.content = stylesheetProcessor.process(fileName, cache.content);
        }
        cache.exists = true;
      }
      return cache.content;
    }
  });
}
exports.cacheCompilerHost = cacheCompilerHost;
//# sourceMappingURL=cache-compiler-host.js.map
