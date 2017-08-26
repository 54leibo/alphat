const SHORTCUTS = require('../config/shortcut.json')

function init (seletor, $eventBus) {
  let codeMap = {}
  for (let shortcut of SHORTCUTS) {
    for (let k of shortcut.key) {
      codeMap[k] = shortcut.action
    }
  }
  $(seletor).on('keyup', function (event) {
    let originalEvent = event.originalEvent
    let code = encodeEvent(originalEvent)
    if (originalEvent.key === 'Escape') {
      $eventBus.trigger('escape.shortcut')
    }
    let action = codeMap[code]
    if (action) {
      $eventBus.trigger(action + '.shortcut')
      event.preventDefault()
      event.stopPropagation()
    }
  })
}

function encodeEvent (event) {
  let keys = []
  if (event.ctrlKey) {
    keys.push('ctrl')
  }
  if (event.metaKey) {
    keys.push('meta')
  }
  if (event.shiftKey) {
    keys.push('shift')
  }
  if (event.altKey) {
    keys.push('alt')
  }
  keys.push(event.key)
  return keys.join('+')
}

module.exports = { init }
