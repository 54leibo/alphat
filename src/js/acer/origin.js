const ace = require('brace')
const Acer = require('../lib/acer')
const Range = ace.acequire('ace/range').Range

const ANNOTATION_TEXT = {
  'info': 'DONE',
  'warning': 'TODO'
}

let annotations = []
let lastRow

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
      this.renderAnnotation()
    })
    this.acer.selection.on('changeCursor', () => {
      let cursor = this.acer.selection.getCursor()
      if (lastRow !== cursor.row) {
        lastRow = cursor.row
        this.$eventBus.trigger('cursor.origin', cursor)
      }
    })
    session.createAnchor(this.acer.session.doc)
    this.moveTo(session.row)
    this.$eventBus.trigger('title.origin', session.getBasename())
  }

  renderAnnotation () {
    if (!this.session) return
    this.session.lines.forEach(line => {
      let annotation = this.session.getAnnotation(line)
      if (!annotation) return
      addTextToAnnotation(annotation)
      annotations.push(annotation)
    })
    this.acer.session.setAnnotations(annotations)
  }

  unmarkLine (annotation) {
    addTextToAnnotation(annotation)
    for (let i = 0; i < annotations.length; i++) {
      let ann = annotations[i]
      if (ann.row === annotation.row) {
        if (ann.type === annotation.type) { return }
        annotations[i] = annotation
      }
    }
    this.acer.session.setAnnotations(annotations)
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
    this.$eventBus.on('unmarkLine.origin', (event, annotation) => {
      if (!annotation) return
      this.unmarkLine(annotation)
    })
  }
}

function addTextToAnnotation (annotation) {
  annotation.text = ANNOTATION_TEXT[annotation.type]
  return annotation
}

module.exports = Origin
