const transform = require('../utils/transform');
const hasChanged = require('../utils/hasChanged');

module.exports = function (name, directive) {
  let def, directiveFunc, $inject;
  const cacheKey = `directive:${name}`;

  if (Array.isArray(directive)) {
    // save list of injected services
    $inject = directive.slice(0, -1);
    directiveFunc = directive[directive.length - 1]
  } else if (typeof directive === 'function') {
    $inject = directive.$inject || [];
    directiveFunc = directive;
  } else {
    throw new Error('Malformed directive function');
  }

  def = directiveFunc();

  this.logger(`DIRECTIVE "${name}":
    ${JSON.stringify(def)}`, 'info');

  const exists = !!this.MODULE_CACHE[cacheKey];
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
    const self = this
    this.MODULE_CACHE[cacheKey] = true;

    const transformedDirective = function() {
      const def = directiveFunc.apply(null, arguments)
      const transformedDef = transform.call(self, name, def)
      def.controller = transformedDef.controller

      return def
    }
    transformedDirective.$inject = $inject

    this.ANGULAR_MODULE.directive(name, transformedDirective);
  }

  return this;
};
