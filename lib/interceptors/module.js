module.exports = function (moduleName, dependenciesArray) {
  if (dependenciesArray) {
    dependenciesArray.push(require('../module').name);
    this.ANGULAR_MODULE = angular.module(moduleName, dependenciesArray);
  } else {
    angular.module(moduleName);
  }

  this.cache[moduleName] = this.cache[moduleName] || {};
  this.MODULE_CACHE = this.cache[moduleName];

  this.name = this.ANGULAR_MODULE.name;
  this.bootstrapElement = angular.element(this.element);
  return this;
};
