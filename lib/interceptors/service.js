module.exports = function (name, service) {
  const cacheKey = `service:${name}`;
  const $inject = Array.isArray(service) ? service.slice(0, -1) : service.$inject;
  const serviceFunction = Array.isArray(service) ? service.slice(-1)[0] : service;
  const exists = !!this.MODULE_CACHE[cacheKey];
  const changed = serviceFunction.toString() !== this.MODULE_CACHE[cacheKey];

  this.MODULE_CACHE[cacheKey] = serviceFunction.toString();

  this.logger(`SERVICE "${name}":
    ${serviceFunction.toString()}`, 'info');

  if (exists && changed) {
    updateService.call(this, name, $inject, serviceFunction);
    this.reloadState();
  }

  if (!exists) {
    this.ANGULAR_MODULE.service(name, service);
  }

  return this;
};

function updateService(name, $inject, serviceFunction) {
  const newServiceInject = this.classTransform(serviceFunction);

  const injectServiceWithDependencies = function () {
    // convert provided arguments to array and slice to get original service
    // from 1st argument and service's DI arguments from the rest
    const args = Array.prototype.slice.call(arguments),
      originalService = args[0],
      injectedDependencies = args.slice(1);

    // Service defined as class can't be replaced by `Function.prototype.apply()`
    if (this.isClass(serviceFunction)) {
      const newService = newServiceInject.apply(originalService, injectedDependencies);

      originalService.__proto__ = newService.__proto__
      Object.getOwnPropertyNames(newService).forEach(property => {
        originalService[property] = newService[property]
      })
    } else { // Inject new properties to the old service function
      newServiceInject.apply(originalService, injectedDependencies)
    }
  }
  injectServiceWithDependencies.$inject = [name].concat($inject)

  this.bootstrapElement.injector().invoke(injectServiceWithDependencies, this);
}
