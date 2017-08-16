function Engine (name, options) {
  let engine = Engine.__plugins__[name]
  if (!engine) throw new Error('Engine unsupported')
  if (!options.from) options.from = 'auto'
  if (!options.to) options.to = 'auto'
  Object.assign(engine.options, options)
  if (!checkLang(engine.langs, options.from, options.to)) {
    throw new Error('Lang unsupported')
  }
  return engine
}

function checkLang (langs, from, to) {
  let codes = langs.map(function (lang) {
    return lang.code
  })
  if (codes.indexOf(from) < 0 || codes.indexOf(to) < 0) return false
  return true
}

Engine.__plugins__ = {}

Engine.listLangs = function () {
  let langs = {}
  for (let name in Engine.__plugins__) {
    langs[name] = Engine.__plugins__[name].langs
  }
  return langs
}

Engine.register = function (plugin) {
  Engine.__plugins__[plugin.name] = plugin
}

Engine.unregister = function (name) {
  delete Engine.__plugins__[name]
}

module.exports = Engine
