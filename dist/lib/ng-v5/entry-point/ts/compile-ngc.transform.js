'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function(resolve) {
              resolve(result.value);
            }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
const path = require('path');
const ts = require('typescript');
const transform_1 = require('../../../brocc/transform');
const compile_source_files_1 = require('../../../ngc/compile-source-files');
const tsconfig_1 = require('../../../ts/tsconfig');
const log = require('../../../util/log');
const nodes_1 = require('../../nodes');
const stylesheet_processor_1 = require('../resources/stylesheet-processor');
exports.compileNgcTransform = transform_1.transformFromPromise(graph =>
  __awaiter(this, void 0, void 0, function*() {
    log.info(`Compiling TypeScript sources through ngc`);
    const entryPoint = graph.find(nodes_1.isEntryPointInProgress());
    const entryPoints = graph.filter(nodes_1.isEntryPoint);
    // Add paths mappings for dependencies
    const tsConfig = tsconfig_1.setDependenciesTsConfigPaths(entryPoint.data.tsConfig, entryPoints);
    // Compile TypeScript sources
    const { esm2015, esm5, declarations } = entryPoint.data.destinationFiles;
    const { moduleResolutionCache } = entryPoint.cache;
    const { basePath, cssUrl, styleIncludePaths } = entryPoint.data.entryPoint;
    const stylesheetProcessor = new stylesheet_processor_1.StylesheetProcessor(basePath, cssUrl, styleIncludePaths);
    yield Promise.all([
      compile_source_files_1.compileSourceFiles(
        graph,
        entryPoint,
        tsConfig,
        moduleResolutionCache,
        stylesheetProcessor,
        {
          outDir: path.dirname(esm2015),
          declaration: true,
          target: ts.ScriptTarget.ES2015
        },
        path.dirname(declarations)
      ),
      compile_source_files_1.compileSourceFiles(
        graph,
        entryPoint,
        tsConfig,
        moduleResolutionCache,
        stylesheetProcessor,
        {
          outDir: path.dirname(esm5),
          target: ts.ScriptTarget.ES5,
          downlevelIteration: true,
          // the options are here, to improve the build time
          declaration: false,
          declarationDir: undefined,
          skipMetadataEmit: true,
          skipTemplateCodegen: true,
          strictMetadataEmit: false
        }
      )
    ]);
    return graph;
  })
);
//# sourceMappingURL=compile-ngc.transform.js.map
