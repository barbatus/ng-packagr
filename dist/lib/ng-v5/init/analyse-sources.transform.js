'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const ng = require('@angular/compiler-cli');
const ts = require('typescript');
const rxjs_1 = require('rxjs');
const operators_1 = require('rxjs/operators');
const log = require('../../util/log');
const nodes_1 = require('../nodes');
const cache_compiler_host_1 = require('../../ts/cache-compiler-host');
const array_1 = require('../../util/array');
const tsconfig_1 = require('../../ts/tsconfig');
exports.analyseSourcesTransform = rxjs_1.pipe(
  operators_1.map(graph => {
    const entryPoints = graph.filter(x => nodes_1.isEntryPoint(x) && x.state !== 'done');
    for (let entryPoint of entryPoints) {
      analyseEntryPoint(graph, entryPoint, entryPoints);
    }
    return graph;
  })
);
/**
 * Analyses an entrypoint, searching for TypeScript dependencies and additional resources (Templates and Stylesheets).
 *
 * @param graph Build graph
 * @param entryPoint Current entry point that should be analysed.
 * @param entryPoints List of all entry points.
 */
function analyseEntryPoint(graph, entryPoint, entryPoints) {
  const { analysisModuleResolutionCache } = entryPoint.cache;
  const { moduleId } = entryPoint.data.entryPoint;
  log.debug(`Analysing sources for ${moduleId}`);
  // Add paths mappings for dependencies
  const tsConfig = tsconfig_1.setDependenciesTsConfigPaths(entryPoint.data.tsConfig, entryPoints, true);
  const compilerHost = Object.assign(
    {},
    cache_compiler_host_1.cacheCompilerHost(graph, entryPoint, tsConfig.options, analysisModuleResolutionCache),
    { readResource: () => '' }
  );
  const program = ng.createProgram({
    rootNames: tsConfig.rootNames,
    options: tsConfig.options,
    host: compilerHost
  });
  const diagnostics = program.getNgSemanticDiagnostics();
  if (diagnostics.length) {
    throw new Error(ng.formatDiagnostics(diagnostics));
  }
  // this is a workaround due to the below
  // https://github.com/angular/angular/issues/24010
  let moduleStatements = [];
  program
    .getTsProgram()
    .getSourceFiles()
    .filter(x => !/node_modules|\.ngfactory|\.ngstyle|(\.d\.ts$)/.test(x.fileName))
    .forEach(sourceFile => {
      sourceFile.statements.filter(x => ts.isImportDeclaration(x) || ts.isExportDeclaration(x)).forEach(node => {
        const { moduleSpecifier } = node;
        if (!moduleSpecifier) {
          return;
        }
        const text = moduleSpecifier.getText();
        const trimmedText = text.substring(1, text.length - 1);
        if (!trimmedText.startsWith('.')) {
          moduleStatements.push(trimmedText);
        }
      });
    });
  moduleStatements = array_1.unique(moduleStatements);
  moduleStatements.forEach(moduleName => {
    const dep = entryPoints.find(ep => ep.data.entryPoint.moduleId === moduleName);
    if (dep) {
      log.debug(`Found entry point dependency: ${moduleId} -> ${moduleName}`);
      if (moduleId === moduleName) {
        throw new Error(`Entry point ${moduleName} has a circular dependency on itself.`);
      }
      entryPoint.dependsOn(dep);
    }
  });
}
//# sourceMappingURL=analyse-sources.transform.js.map
