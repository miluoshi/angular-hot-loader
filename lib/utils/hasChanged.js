/**
 * Get content of all the methods in the class definition,
 * (e.g. constructor and any other prototype methods).
 *
 * @param {Function} cls - Class
 * @return {string}
 */
function getClassContent(cls) {
  let content = '';
  const props = Object.getOwnPropertyNames(cls.prototype);
  for (let prop of props) {
    content += cls.prototype[prop].toString();
  }
  return content;
}

module.exports = function(name, def) {
  if (def.template && !this.templateCache[name]) return true;

  const template = typeof def.template === 'function' ? def.template() : def.template
  const isInjectableTemplate = (typeof def.template === 'function' || Array.isArray(def.template))
  const templateChanged = isInjectableTemplate || template && template.toString() !== this.templateCache[name].toString();

  // No need to check class, if template already changed.
  // Assuming template is smaller than controller class.
  if (templateChanged) return true;

  if (!def.controller) return false;
  if (!this.controllerCache[name]) return true;

  const controller = Array.isArray(def.controller)
      ? def.controller.slice(-1)[0] : def.controller
  const controllerCache = Array.isArray(this.controllerCache[name])
      ? this.controllerCache[name].slice(-1)[0] : this.controllerCache[name]
  const controllerChanged = getClassContent(controller) !== getClassContent(controllerCache);

  return controllerChanged;
};
