const os = require('os')
const md5 = require('md5')
const path = require('path')

class Session {
  process (lines, pred) {
    this.lines = lines.map(pred)
    let hash = {}
    let ids = []
    for (let line of this.lines) {
      if (line.id) {
        ids.push(line.id)
        hash[line.id] = line
      }
    }
    this.hash = hash
    this.ids = ids
  }

  getBasename () {
    return getBasename(this.filePath)
  }

  countTotalLines () {
    return this.lines.filter(l => l.origin.trim()).length
  }

  countDstLines () {
    return this.lines.filter(l => l.dst).length
  }

  getMode () {
    if (/\.md$/.test(this.filePath)) {
      return 'markdown'
    }
    return 'text'
  }

  toJSON () {
    return {
      meta: {
        filePath: this.filePath,
        mode: this.mode,
        id: this.id,
        row: this.row,
        created: this.created,
        updated: new Date().toISOString(),
        workLine: this.workLine
      },
      computed: {
        basename: getBasename(this.filePath),
        totalLines: this.countTotalLines(),
        dstLines: this.countDstLines()
      },
      lines: this.lines.map(line => {
        let { origin, dst, ai, index, id } = line
        return { origin, dst, ai, index, id }
      })
    }
  }

  setRow (v = 0) {
    this.row = v
  }

  getText () {
    return this.lines.map(line => this.getLineText(line)).join(os.EOL)
  }

  getDstText () {
    return this.lines.map(line => line.dst || line.origin).join(os.EOL)
  }

  getLineText (line) {
    if (!line.origin) return line.origin
    return line.origin + os.EOL + (line.dst ? line.dst : '')
  }

  findLineByRow (row, start = 0, end) {
    if (!end) end = this.lines.length
    if (end - start === 1) return this.lines[start]
    let mid = Math.floor((start + end) / 2)
    let line = this.lines[mid]
    let lr = this.getLineRow(line)
    if (lr === row) return line
    if (lr > row) return this.findLineByRow(row, start, mid)
    if (lr < row) return this.findLineByRow(row, mid, end)
  }

  findPrevNonEmptyLine (line) {
    let index = this.ids.indexOf(line.id)
    return this.hash[this.ids[index - 1]]
  }

  findNextNonEmptyLine (line) {
    let index = this.ids.indexOf(line.id)
    return this.hash[this.ids[index + 1]]
  }

  createAnchor (doc) {
    let acc = 0
    this.lines.forEach((line, row) => {
      line.anchor = doc.createAnchor(acc, 0)
      acc++
      if (line.origin) {
        if (line.dst) {
          acc += line.dst.split(os.EOL).length
        } else {
          acc += 1
        }
      }
    })
  }

  getAnnotation (line) {
    if (!line.id) { return }
    let row = this.getLineRow(line)
    let type = line.dst ? 'info' : 'warning'
    return {type, row}
  }

  getLineRow (line) {
    let cursor = line.anchor.getPosition()
    return cursor.row
  }

  nextLine (line) {
    return this.lines[line.index + 1]
  }
}

function getBasename (filePath) {
  return path.basename(filePath)
}

function getId (filePath, text) {
  return md5(getBasename(filePath) + text)
}

exports.getId = getId

exports.create = function (filePath, text) {
  let session = new Session()
  session.filePath = filePath
  session.mode = session.getMode()
  session.id = getId(filePath, text)
  session.row = 0
  session.created = new Date().toISOString()
  session.updated = new Date().toISOString()
  session.workLine = 0
  session.process(text.split(os.EOL), (text, index) => {
    let line = { origin: text, ai: '', dst: '', index }
    if (text) line.id = md5(index + text)
    return line
  })
  return session
}

exports.load = function (obj) {
  let session = new Session()
  let meta = obj.meta
  for (let key in meta) {
    session[key] = meta[key]
  }
  session.process(obj.lines, line => line)
  return session
}
