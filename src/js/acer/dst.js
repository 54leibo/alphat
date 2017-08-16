const Acer = require('../lib/acer')

class Dst extends Acer {
  constructor (seletor, eventBus, data) {
    super(seletor, eventBus, data)
    this.bindEvent()
  }

  bindEvent () {
    this.acer.on('blur', () => {
      this.$eventBus.trigger('blur.dst')
    })
    this.acer.on('change', () => {
      this.$eventBus.trigger('change.dst', this.getText())
    })
  }
}

module.exports = Dst
