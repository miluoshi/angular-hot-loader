const transform = require('../utils/transform');
const hasChanged = require('../utils/hasChanged');

module.exports = function(name, component) {
  const cacheKey = `component:${name}`;
  const exists = !!this.MODULE_CACHE[cacheKey];
  const changed = hasChanged.call(this, name, component);

  this.templateCache[name] = component.template && component.template.toString();
  this.controllerCache[name] = component.controller;

  this.logger(`COMPONENT "${name}":
    ${JSON.stringify(component)}`, 'info');

  if (changed && exists) {
    hotUpdateComponent.call(this, name, component)
    this.reloadState();
  }

  if (!exists) {
    this.MODULE_CACHE[cacheKey] = true;
    this.ANGULAR_MODULE.component(name, transform.call(this, name, component));
  }

  return this;
};

function hotUpdateComponent(name, newComponent) {
  const oldComponent = this.bootstrapElement.injector().get(`${name}Directive`)[0];
  let { controller, bindings: bindToController, template, templateUrl } = newComponent;

  // If template is injectable fn (array of deps + fn), invoke it inside injector
  if (typeof template === 'function' || Array.isArray(template)) {
    template = getInjectedTemplateFn.call(this, template)
  }

  angular.extend(oldComponent, {
    controller, bindToController, template, templateUrl
  })
}

function getInjectedTemplateFn(template) {
  return (tElement, tAttrs) => {
    return this.bootstrapElement.injector().invoke(template, this, {$element: tElement, $attrs: tAttrs});
  }
}
