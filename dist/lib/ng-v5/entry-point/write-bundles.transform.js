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
const operators_1 = require('rxjs/operators');
const rxjs_1 = require('rxjs');
const flatten_1 = require('../../flatten/flatten');
const nodes_1 = require('../nodes');
const log = require('../../util/log');
const array_1 = require('../../util/array');
exports.writeBundlesTransform = rxjs_1.pipe(
  operators_1.switchMap(graph => {
    const entryPoint = graph.find(nodes_1.isEntryPointInProgress());
    const { destinationFiles, entryPoint: ngEntryPoint, tsConfig } = entryPoint.data;
    // Add UMD module IDs for dependencies
    const dependencyUmdIds = entryPoint
      .filter(nodes_1.isEntryPoint)
      .map(ep => ep.data.entryPoint)
      .reduce((prev, ep) => {
        prev[ep.moduleId] = ep.umdId;
        return prev;
      }, {});
    const opts = {
      destFile: '',
      entryFile: '',
      sourceRoot: tsConfig.options.sourceRoot,
      flatModuleFile: ngEntryPoint.flatModuleFile,
      esmModuleId: ngEntryPoint.moduleId,
      umdModuleId: ngEntryPoint.umdId,
      amdId: ngEntryPoint.amdId,
      umdModuleIds: Object.assign({}, ngEntryPoint.umdModuleIds, dependencyUmdIds),
      dependencyList: getDependencyListForGraph(graph)
    };
    return rxjs_1.from(writeFlatBundleFiles(destinationFiles, opts)).pipe(operators_1.map(() => graph));
  })
);
function writeFlatBundleFiles(destinationFiles, opts) {
  return __awaiter(this, void 0, void 0, function*() {
    const { esm5, umd } = destinationFiles;
    log.info('Bundling to UMD');
    yield flatten_1.flattenToUmd(
      Object.assign({}, opts, { entryFile: esm5, destFile: umd, dependencyList: opts.dependencyList })
    );
  });
}
/** Get all list of dependencies for the entire 'BuildGraph' */
function getDependencyListForGraph(graph) {
  // We need to do this because if A dependecy on bundled B
  // And A has a secondary entry point A/1 we want only to bundle B if it's used.
  // Also if A/1 depends on A we don't want to bundle A thus we mark this a dependency.
  const dependencyList = {
    dependencies: [],
    bundledDependencies: []
  };
  for (const entry of graph.filter(nodes_1.isEntryPoint)) {
    const { bundledDependencies = [], dependencies = {}, peerDependencies = {} } = entry.data.entryPoint.packageJson;
    dependencyList.bundledDependencies = array_1.unique(dependencyList.bundledDependencies.concat(bundledDependencies));
    dependencyList.dependencies = array_1.unique(
      dependencyList.dependencies.concat(
        Object.keys(dependencies),
        Object.keys(peerDependencies),
        entry.data.entryPoint.moduleId
      )
    );
  }
  return dependencyList;
}
//# sourceMappingURL=write-bundles.transform.js.map
