module.exports = function(name, filter) {
  const cacheKey = `filter:${name}`;
  const $inject = Array.isArray(filter) ? filter.slice(0, -1) : filter.$inject;
  const filterFunction = Array.isArray(filter) ? filter.slice(-1)[0] : filter;
  const exists = !!this.MODULE_CACHE[cacheKey];
  const changed = filterFunction.toString() !== this.MODULE_CACHE[cacheKey];

  this.MODULE_CACHE[cacheKey] = filterFunction.toString();

  this.logger(`FILTER "${name}":
    ${filterFunction.toString()}`, 'info');

  if (exists && changed) {
    updateFilter.call(this, name, $inject, filterFunction);
    this.reloadState();
  }

  if (!exists) {
    this.ANGULAR_MODULE.filter(name, filter);
  }

  return this;
};

function updateFilter(name, $inject, filterFunction) {
  const newFilterInject = this.classTransform(filterFunction);

  const injectFilterWithDependencies = function () {
    const args = Array.prototype.slice.call(arguments),
      originalFilter = args[0],
      injectedDependencies = args.slice(1);

    // Service defined as class can't be replaced by `Function.prototype.apply()`
    if (this.isClass(filterFunction)) {
      const newService = newFilterInject.apply(originalFilter, injectedDependencies);

      originalFilter.__proto__ = newService.__proto__
      Object.getOwnPropertyNames(newService).forEach(property => {
        originalFilter[property] = newService[property]
      })
    } else { // Inject new properties to the old service function
      newFilterInject.apply(originalFilter, injectedDependencies)
    }
  }
  injectFilterWithDependencies.$inject = [name].concat($inject)

  this.bootstrapElement.injector().invoke(injectFilterWithDependencies, this);
}
