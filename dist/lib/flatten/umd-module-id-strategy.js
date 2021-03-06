'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.umdModuleIdStrategy = (moduleId, umdModuleIds = {}) => {
  let nameProvided;
  if ((nameProvided = umdModuleIds[moduleId])) {
    return nameProvided;
  }
  let regMatch;
  if ((regMatch = /^\@angular\/platform-browser-dynamic(\/?.*)/.exec(moduleId))) {
    return `ng.platformBrowserDynamic${regMatch[1]}`.replace(/\//g, '.');
  }
  if ((regMatch = /^\@angular\/platform-browser(\/?.*)/.exec(moduleId))) {
    return `ng.platformBrowser${regMatch[1]}`.replace(/\//g, '.');
  }
  if ((regMatch = /^\@angular\/(.+)/.exec(moduleId))) {
    return `ng.${regMatch[1]}`.replace(/\//g, '.');
  }
  if (moduleId === 'rxjs') {
    return 'rxjs';
  }
  if ((regMatch = /^rxjs\/(\/?.*)/.exec(moduleId))) {
    return `rxjs.${regMatch[1]}`;
  }
  if (moduleId === 'tslib') {
    return 'tslib';
  }
  return ''; // leave it up to rollup to guess the global name
};
//# sourceMappingURL=umd-module-id-strategy.js.map
