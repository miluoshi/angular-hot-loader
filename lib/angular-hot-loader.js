const toFactory = require('to-factory');
const logger = require('./logger');

let hotAngular;

/**
 * Angular Hot Loader.
 * @param {Object} settings - hot loader setiings.
 */
let HotAngular = function (settings) {
  const toString = Function.prototype.toString;
  this.ANGULAR_MODULE;

  this.settings = settings || {};

  // Create cahing objects.
  this.MODULE_CACHE = {};
  this.cache = {};
  this.configCache = {};
  this.constantCache = {};
  this.controllerCache = {};
  this.decoratorCache = {};
  this.valueCache = {};
  this.templateCache = {};

  this.name;
  this.bootstrapElement;
  this.isReloading = false;

  this.logger = this.settings.log ? logger : function() {};

  // Module may have been lazy loaded after document load.
  if (document.readyState === 'complete') {
    loadHandler.call(this);
  } else {
    document.addEventListener('DOMContentLoaded', loadHandler.bind(this), false);
  }

  /**
   * Document load handler.
   */
  function loadHandler() {
    this.element = document.querySelector(this.settings.rootElement);
    this.bootstrapElement = angular.element(this.element);
  }

  /**
   * Gets transpiled function body.
   * @param {Function} fn - transpiled function source.
   */
  function fnBody(fn) {
    return toString.call(fn).replace(/^[^{]*{\s*/,'').replace(/\s*}[^}]*$/,'');
  }

  /**
   * Checks if function is es6 or Babel class.
   * @param {Function} fn - transpiled function source.
   */
  this.isClass =  function(fn) {
    return (typeof fn === 'function' &&
    (/^class\s/.test(toString.call(fn)) ||
    // babel class definition.
    (/.*classCallCheck\(?/.test(fnBody(fn)))));
  }

  /**
   * Wraps class functions in factory.
   */
  this.classTransform = function(fn) {
    return this.isClass(fn) ? toFactory(fn) : fn;
  };
};

// Angular functions to replace
HotAngular.prototype.animation = require('./interceptors/animation');
HotAngular.prototype.component = require('./interceptors/component');
HotAngular.prototype.config = require('./interceptors/config');
HotAngular.prototype.constant = require('./interceptors/constant');
HotAngular.prototype.controller = require('./interceptors/controller');
HotAngular.prototype.decorator = require('./interceptors/decorator');
HotAngular.prototype.directive = require('./interceptors/directive');
HotAngular.prototype.factory = require('./interceptors/factory');
HotAngular.prototype.filter = require('./interceptors/filter');
HotAngular.prototype.module = require('./interceptors/module');
HotAngular.prototype.provider = require('./interceptors/provider');
HotAngular.prototype.run = require('./interceptors/run');
HotAngular.prototype.service = require('./interceptors/service');
HotAngular.prototype.value = require('./interceptors/value');

HotAngular.prototype.reloadState = function () {
  const elm = this.bootstrapElement;

  if (elm && elm.injector().has('$state')) {
    const $state = elm.injector().get('$state');

    if (!this.isReloading) {
      this.logger('Reloading UI Router State', 'info');

      this.isReloading = true;
      $state.reload().then(() => {
        this.isReloading = false
      })
    }
  } else {
    this.recompile(elm)
  }
};

HotAngular.prototype.rebootstrapApp = function () {
  const strictDi = this.bootstrapElement.injector().strictDi;
  const rootModule = this.element.getAttribute('ng-app');

  this.bootstrapElement.injector().get('$rootScope').$destroy();
  this.bootstrapElement.removeData('$scope').removeData('$injector');
  angular.bootstrap(this.element, [rootModule], { strictDi: strictDi })
}

HotAngular.prototype.recompile = function(elm) {
  if (elm.injector) {
    this.logger('Recompile App', 'info');
    elm.injector().get('$compile')(elm.contents())(elm.scope());
  } else {
    this.logger('Reloadpage', 'info');
    window.location.reload();
  }
};

// HotAngular must be a singleton so the cache remains the
// same across consecutive updates.
module.exports = function (settings) {
  if (!hotAngular) {
    hotAngular = new HotAngular(settings);
  }
  return hotAngular;
};
