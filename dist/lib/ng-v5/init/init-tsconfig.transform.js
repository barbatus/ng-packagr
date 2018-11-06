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
const transform_1 = require('../../brocc/transform');
const nodes_1 = require('../nodes');
const tsconfig_1 = require('../../ts/tsconfig');
exports.initTsConfigTransformFactory = defaultTsConfig =>
  transform_1.transformFromPromise(graph =>
    __awaiter(this, void 0, void 0, function*() {
      // Initialize tsconfig for each entry point
      const entryPoints = graph.filter(nodes_1.isEntryPoint);
      tsconfig_1.initializeTsConfig(defaultTsConfig, entryPoints);
      return graph;
    })
  );
//# sourceMappingURL=init-tsconfig.transform.js.map
