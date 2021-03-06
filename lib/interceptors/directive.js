const transform = require('../utils/transform');
const hasChanged = require('../utils/hasChanged');

module.exports = function (name, directive) {
  let def;
  const cacheKey = `directive:${name}`;

  if (Array.isArray(directive)) {
    def = directive[directive.length - 1]();
  } else if (typeof directive === 'function') {
    def = directive();
  } else {
    throw new Error('Malformed directive function');
  }

  this.logger(`DIRECTIVE "${name}":
    ${def}`, 'info');

  const exists = this.MODULE_CACHE[cacheKey];
  const changed = hasChanged.call(this, name, def);

  if (def.template) {
    this.templateCache[name] = def.template;
  }

  if (def.controller) {
    this.controllerCache[name] = def.controller;
  }

  if (exists && changed) {
    this.reloadState();
  }

  if (!exists) {
    this.MODULE_CACHE[cacheKey] = true;
    this.ANGULAR_MODULE.directive(name, () => transform.call(this, name, def));
  }

  return this;
};
