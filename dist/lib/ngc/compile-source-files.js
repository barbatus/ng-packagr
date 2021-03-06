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
const ng = require('@angular/compiler-cli');
const log = require('../util/log');
const create_emit_callback_1 = require('./create-emit-callback');
const redirect_write_file_compiler_host_1 = require('../ts/redirect-write-file-compiler-host');
const cache_compiler_host_1 = require('../ts/cache-compiler-host');
function compileSourceFiles(
  graph,
  entryPoint,
  tsConfig,
  moduleResolutionCache,
  stylesheetProcessor,
  extraOptions,
  declarationDir
) {
  return __awaiter(this, void 0, void 0, function*() {
    log.debug(`ngc (v${ng.VERSION.full})`);
    const tsConfigOptions = Object.assign({}, tsConfig.options, extraOptions);
    let tsCompilerHost = cache_compiler_host_1.cacheCompilerHost(
      graph,
      entryPoint,
      tsConfigOptions,
      moduleResolutionCache,
      stylesheetProcessor
    );
    if (declarationDir) {
      tsCompilerHost = redirect_write_file_compiler_host_1.redirectWriteFileCompilerHost(
        tsCompilerHost,
        tsConfigOptions.basePath,
        declarationDir
      );
    }
    // ng.CompilerHost
    const ngCompilerHost = ng.createCompilerHost({
      options: tsConfigOptions,
      tsHost: tsCompilerHost
    });
    // Don't use `ng.emit` as it doesn't output all errors.
    // https://github.com/angular/angular/issues/24024
    const emitFlags = tsConfigOptions.declaration ? tsConfig.emitFlags : ng.EmitFlags.JS;
    const result = ng.performCompilation({
      rootNames: tsConfig.rootNames,
      options: tsConfigOptions,
      host: ngCompilerHost,
      emitCallback: create_emit_callback_1.createEmitCallback(tsConfigOptions),
      emitFlags
    });
    const exitCode = ng.exitCodeFromResult(result.diagnostics);
    return exitCode === 0 ? Promise.resolve() : Promise.reject(new Error(ng.formatDiagnostics(result.diagnostics)));
  });
}
exports.compileSourceFiles = compileSourceFiles;
//# sourceMappingURL=compile-source-files.js.map
