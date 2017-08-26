const ace = require('brace')
require('brace/ext/themelist')
const aceThemes = ace.acequire('ace/ext/themelist').themesByName

class Acer {
  constructor (seletor, eventBus, data) {
    this.$acer = $(seletor)
    this.$eventBus = eventBus
    this.configAcer(data)
    this.$eventBus.on('theme.acer', (event, theme) => {
      this.setTheme(theme)
    })
    this.$eventBus.on('keyMode.acer', (event, keyMode) => {
      this.setKeyMode(keyMode)
    })
    this.$eventBus.on('mode.acer', (event, mode) => {
      this.setMode(mode)
    })
    this.$eventBus.on('fontSize.acer', (event, fontsize) => {
      this.setFontSize(fontsize)
    })
  }

  configAcer (data) {
    this.acer = ace.edit(this.$acer.get(0))
    this.acer.session.setUseWrapMode(true)
    this.acer.setShowPrintMargin(false)
    this.acer.$blockScrolling = Infinity
    this.acer.renderer.setShowGutter(data.showGutter)
    this.acer.setOption('indentedSoftWrap', false)
    this.acer.setReadOnly(data.readOnly)
    this.acer.setFontSize(parseInt(data.fontSize))
    this.setKeyMode(data.keyMode)
    this.setTheme(data.theme)
  }

  setKeyMode (keyMode) {
    if (this.keyMode === keyMode) { return }
    if (keyMode === 'normal') {
      this.acer.setKeyboardHandler(null)
    } else {
      if (['vim', 'emacs'].indexOf(keyMode)) throw new Error('Keymode invalid')
      require('brace/keybinding/' + keyMode)
      this.acer.setKeyboardHandler('ace/keyboard/' + keyMode)
    }
    this.keyMode = keyMode
  }

  setMode (mode) {
    if (this.mode === mode) { return }
    require('brace/mode/' + mode)
    this.acer.session.setMode('ace/mode/' + mode)
    this.mode = mode
  }

  setTheme (theme) {
    if (this.theme === theme) { return }
    if (theme === 'default') {
      this.acer.setTheme(null)
    } else {
      if (!aceThemes[theme]) throw new Error('Theme invalid')
      require('brace/theme/' + theme)
      this.acer.setTheme('ace/theme/' + theme)
    }
    this.theme = theme
  }

  setFontSize (fontSize) {
    if (this.fontSize === fontSize) { return }
    this.acer.setFontSize(parseInt(fontSize))
    this.fontSize = fontSize
  }

  getText () {
    return this.acer.getValue()
  }

  setText (text) {
    this.acer.setValue(text)
    this.acer.selection.clearSelection()
  }

  layout (css) {
    this.$acer.css(css)
  }
}

module.exports = Acer
