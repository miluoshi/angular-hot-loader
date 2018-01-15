const transformClassController = require('../utils/transform');
const hasChanged = require('../utils/hasChanged');

module.exports = function (name, directive) {
  const cacheKey = `directive:${name}`;
  const $inject = Array.isArray(directive) ? directive.slice(0, -1) : directive.$inject || [];
  const directiveFn = Array.isArray(directive) ? directive.slice(-1)[0] : directive;
  const def = directiveFn();
  const exists = !!this.MODULE_CACHE[cacheKey];
  const changed = hasChanged.call(this, name, def);

  this.templateCache[name] = def.template.toString();
  this.controllerCache[name] = def.controller;

  this.logger(`DIRECTIVE "${name}":
    ${JSON.stringify(def)}`, 'info');

  if (exists && changed) {
    hotUpdateDirective.call(this, name, def)
    this.reloadState();
  }

  if (!exists) {
    const self = this
    this.MODULE_CACHE[cacheKey] = true;

    const transformedDirectiveFn = function() {
      const def = directiveFn.apply(null, arguments)
      const transformedDef = transformClassController.call(self, name, def)
      def.controller = transformedDef.controller

      return def
    }
    transformedDirectiveFn.$inject = $inject

    this.ANGULAR_MODULE.directive(name, transformedDirectiveFn);
  }

  return this;
};

function hotUpdateDirective(name, newDirective) {
  const oldDirective = this.bootstrapElement.injector.get(`${name}Directive`)[0]
  const { controller, link, require, scope, template, templateUrl } = newDirective

  angular.extend(oldDirective, {
    controller, link, require, scope, template, templateUrl
  })
}
