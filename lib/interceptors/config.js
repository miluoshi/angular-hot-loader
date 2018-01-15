module.exports = function (configFunction) {
  const exists = !!this.configCache[this.name]
  const changed = this.configCache[this.name] !== configFunction.toString();

  this.configCache[this.name] = configFunction.toString()

  this.logger(`CONFIG "${this.ANGULAR_MODULE.name}"
    ${configFunction}`, 'info');

  if (exists && changed) {
    hotUpdateConfig.call(this, this.ANGULAR_MODULE.name, configFunction)
    this.reloadState();
  }

  if (!exists) {
    this.ANGULAR_MODULE.config(configFunction);
  }

  return this;
};

function hotUpdateConfig(moduleName, configFunction) {
  this.bootstrapElement.injector().modules[moduleName]._configBlocks[0][2][0] = configFunction
}
