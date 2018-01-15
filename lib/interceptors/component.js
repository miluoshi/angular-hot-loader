const transform = require('../utils/transform');
const hasChanged = require('../utils/hasChanged');

module.exports = function(name, component) {
  const cacheKey = `component:${name}`;
  const exists = !!this.MODULE_CACHE[cacheKey];
  const changed = hasChanged.call(this, name, component);

  this.templateCache[name] = component.template;
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
  const { controller, bindings: bindToController, template, templateUrl } = newComponent;

  angular.extend(oldComponent, {
    controller, bindToController, template, templateUrl
  })
}
