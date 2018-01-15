module.exports = function (name, def) {
  const isClassTransformNeeded = def.controller
    && typeof def.controller === 'function'
    && this.isClass(this.controllerCache[name])

  if (isClassTransformNeeded) {
    const that = this;

    def.controller = function ($injector, $scope, $element, $attrs, $transclude) {
      return $injector.invoke(
        that.classTransform(that.controllerCache[name]),
        this,
        {
          $scope,
          $element,
          $attrs,
          $transclude
        }
      );
    };
    def.controller.$inject = ['$injector', '$scope', '$element', '$attrs', '$transclude'];
  }

  return def;
};
