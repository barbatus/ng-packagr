'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.STATE_DIRTY = 'dirty';
exports.STATE_IN_PROGESS = 'in-progress';
exports.STATE_PENDING = 'pending';
exports.STATE_DONE = 'done';
/**
 * A Node in the {@link BuildGraph}.
 */
class Node {
  constructor(url) {
    this.url = url;
    this.state = '';
    this._dependents = [];
    this._dependees = [];
  }
  filter(by) {
    return this._dependents.filter(by);
  }
  find(by) {
    return this._dependents.find(by);
  }
  some(by) {
    return this._dependents.some(by);
  }
  get dependents() {
    return this._dependents;
  }
  /** @experimental DO NOT USE. For time being, dirty checking is for `type=entryPoint && state !== 'done'` (full rebuild of entry point). */
  dependsOn(dependent) {
    const newDeps = dependent instanceof Array ? dependent : [dependent];
    newDeps.forEach(dep => (dep._dependees = dep._dependees.filter(d => d.url !== this.url).concat(this)));
    this._dependents = this._dependents
      .filter(existing => newDeps.some(newDep => newDep.url !== existing.url))
      .concat(newDeps);
  }
}
exports.Node = Node;
//# sourceMappingURL=node.js.map
