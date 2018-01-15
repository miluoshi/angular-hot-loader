module.exports = function(name, factory) {
  const cacheKey = `factory:${name}`;
  const $inject = Array.isArray(factory) ? factory.slice(0, -1) : factory.$inject;
  const factoryFunction = Array.isArray(factory) ? factory.slice(-1)[0] : factory;
  const exists = !!this.MODULE_CACHE[cacheKey];
  const changed = factoryFunction.toString() !== this.MODULE_CACHE[cacheKey];

  this.MODULE_CACHE[cacheKey] = factoryFunction.toString();

  this.logger(`FACTORY "${name}":
    ${factoryFunction}`, 'info');

  if (exists && changed) {
    updateFactory.call(this, name, $inject, factoryFunction);
    this.rebootstrapApp();
  }

  if (!exists) {
    this.ANGULAR_MODULE.factory(name, factory);
  }

  return this;
};

function updateFactory(name, $inject, factoryFunction) {
  this.ANGULAR_MODULE.config(['$provide', function ($provide) {
    const decoratorFn = function () {
      const args = Array.prototype.slice.call(arguments),
        $delegate = args[0],
        factoryDependencies = args.slice(1);

      return factoryFunction.apply($delegate, factoryDependencies)
    }
    decoratorFn.$inject = ['$delegate'].concat($inject);

    $provide.decorator(name, decoratorFn)
  }])
}
