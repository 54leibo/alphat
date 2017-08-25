const ace = require('brace')
const Acer = require('../lib/acer')
const Range = ace.acequire('ace/range').Range

class Origin extends Acer {
  constructor (seletor, eventBus, data) {
    super(seletor, eventBus, data)
    this.bindEvent()
  }

  startSession (session) {
    this.session = session
    this.setMode(session.mode)
    this.acer.selection.removeAllListeners('changeCursor')
    this.acer.setValue(session.getText())
    this.acer.renderer.once('afterRender', () => {
      this.renderMarker()
    })
    this.acer.selection.on('changeCursor', () => {
      this.$eventBus.trigger('cursor.origin', this.acer.selection.getCursor())
    })
    session.createAnchor(this.acer.session.doc)
    this.moveTo(session.row)
    this.$eventBus.trigger('title.origin', session.getBasename())
  }

  renderMarker () {
    if (!this.session) return
    let $gutters = this.$acer.find('.ace_gutter-cell')
    this.session.lines.forEach(line => {
      let marker = this.session.renderMarker(line)
      if (!marker) return
      $gutters.eq(marker.row).append(`<span class="mark-gutter">${marker.mark}</span>`)
    })
  }

  unmarkLine (row, isDst) {
    this.$acer.find(`.ace_gutter-cell:eq(${row}) .mark-gutter`).text(isDst ? '▶' : '▷')
  }

  moveTo (row = 0, column = 0) {
    this.acer.selection.moveCursorTo(row, column)
    this.acer.scrollToLine(row, true, true, function () {})
    this.acer.selection.setRange(new Range(row, 0, row, Number.MAX_VALUE))
  }

  bindEvent () {
    this.$eventBus.on('syncdst.origin', (event, {start, end, text = ''}) => {
      this.acer.session.doc.replace(new Range(start, 0, end, Number.MAX_VALUE), text)
    })
    this.$eventBus.on('unmarkLine.origin', (event, {row, isDst}) => {
      this.unmarkLine(row, isDst)
    })
  }
}

module.exports = Origin
