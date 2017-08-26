const { ipcRenderer, remote } = require('electron')
const electronSettings = remote.require('electron-settings')
const fs = require('fs')
const ace = require('brace')
const i18next = require('i18next')

const i18nInit = require('./i18n')
const Session = require('./session')
require('brace/ext/themelist')

let menu$ = require('./components/menu')
let settings$ = require('./components/settings')
let history$ = require('./components/history')
let winbtn$ = require('./components/winbtn')
let shortcut$ = require('./components/shortcut')

let Engine = require('./engine')

let Origin = require('./acer/origin')
let Ai = require('./acer/ai')
let Dst = require('./acer/dst')

let settings, eventBus, sessions
let originAcer, aiAcer, dstAcer
let engine
let session
let previouseLine, currentLine
let prevSessionJson

function init () {
  initGobal()
  initEngine()
  i18nInit({
    lng: settings.i18n,
    resources: remote.require('./locales')
  }, function (err) {
    if (err) throw err
    initComponets()
    initAcers()
    bindEvent()
    autoSaveSession(60)
  })
}

function initGobal () {
  settings = getSetting()
  sessions = listSessions()
  eventBus = $(window)
}

function initEngine () {
  Engine.register(require('./engine/baidu'))
  Engine.register(require('./engine/google'))
  Engine.register(require('./engine/youdao'))
  updateEngine()
}

function initComponets () {
  menu$.init('#menu', eventBus)
  settings$.init('#settings', eventBus, Object.assign({}, settings, {
    themelist: Object.keys(ace.acequire('ace/ext/themelist').themesByName),
    langsList: Engine.listLangs()
  }))
  history$.init('#history', eventBus, {sessions})
  history$.show()
  winbtn$.init('#winbtn', eventBus)
  shortcut$.init(window, eventBus)
}

function initAcers () {
  originAcer = new Origin('#origin', eventBus, Object.assign({}, settings, {
    showGutter: true,
    readOnly: true
  }))
  aiAcer = new Ai('#ai', eventBus, Object.assign({}, settings, {
    showGutter: false,
    readOnly: true
  }))
  dstAcer = new Dst('#dst', eventBus, Object.assign({}, settings, {
    showGutter: false,
    readOnly: false
  }))
  layoutAcers(65, 15)
}

function layoutAcers (e, m, t = 95 - e - m) {
  originAcer.layout({height: e + 'vh'})
  aiAcer.layout({top: (e + 5) + 'vh', height: m + 'vh'})
  dstAcer.layout({top: (e + m + 5) + 'vh', height: t + 'vh'})
}

function getSetting () {
  return Object.assign({
    i18n: 'en',
    theme: 'default',
    keyMode: 'normal',
    fontSize: '12px',
    from: 'auto',
    to: 'zh',
    engine: 'baidu'
  }, electronSettings.getAll())
}

function listSessions () {
  return ipcRenderer.sendSync('list-sessions')
}

function bindEvent () {
  eventBus.on('blur.dst', function (event) {
    if (currentLine) {
      currentLine.dst = dstAcer.getText()
    }
  })
  eventBus.on('change.dst', function (event, text) {
    if (currentLine) {
      let start = session.getLineRow(currentLine) + 1
      let next = session.nextLine(currentLine)
      let end = Number.MAX_VALUE
      if (next) end = session.getLineRow(next) - 1
      eventBus.trigger('syncdst.origin', {start, end, text})
    }
  })
  eventBus.on('new.menu new.history new.shortcut', function (event) {
    seletFile(function (err, data) {
      if (err) {
        eventBus.on('alert.app', {title: '错误', textt: '', type: 'error', confirmButtonText: '关闭'})
        return
      }
      if (!data) return
      let {filePath, text} = data
      let id = Session.getId(filePath, text)
      startSession(id, filePath, text)
    })
  })
  eventBus.on('history.menu history.shortcut', function (event) {
    history$.show()
  })
  eventBus.on('settings.menu settings.shortcut', function (event) {
    settings$.show()
  })
  eventBus.on('exportBoth.menu', function (event) {
    if (!session) { return }
    exportFile(session.getText(), function (err) {
      if (err) {
        eventBus.on('alert.app', {title: '错误', textt: '', type: 'error', confirmButtonText: '关闭'})
      }
    })
  })
  eventBus.on('exportDst.menu exportDst.shortcut', function (event) {
    if (!session) { return }
    exportFile(session.getDstText(), function (err) {
      if (err) throw err
    })
  })
  eventBus.on('maximize.winbtn', function (event) {
    ipcRenderer.send('win-action', 'maximize')
  })
  eventBus.on('minimize.winbtn', function (event) {
    ipcRenderer.send('win-action', 'minimize')
  })
  eventBus.on('restore.winbtn', function (event) {
    ipcRenderer.send('win-action', 'restore')
  })
  eventBus.on('close.winbtn', function (event) {
    ipcRenderer.send('win-action', 'close')
  })
  eventBus.on('save.settings', function (event, sett) {
    settings = sett
    eventBus.trigger('theme.acer', settings.theme)
    eventBus.trigger('keyMode.acer', settings.keyMode)
    eventBus.trigger('fontSize.acer', settings.fontSize)
    updateI18n()
    updateEngine()
    electronSettings.setAll(settings)
  })
  eventBus.on('remove.history', function (event, id) {
    ipcRenderer.send('remove-session', id)
  })
  eventBus.on('edit.history', function (event, id) {
    eventBus.trigger('app.save', session)
    startSession(id)
    eventBus.trigger('hide.popup')
  })
  eventBus.on('cursor.origin', function (event, cursor) {
    if (!session) { return }
    currentLine = session.findLineByRow(cursor.row)
    session.setRow(cursor.row)
    if (previouseLine) {
      if (previouseLine.id === currentLine.id) { return }
      previouseLine.dst = dstAcer.getText()
      eventBus.trigger('unmarkLine.origin', session.getAnnotation(previouseLine))
    }
    if (currentLine.origin) {
      if (currentLine.ai) {
        aiAcer.setText(currentLine.ai)
      } else {
        requestAI(currentLine)
      }
      dstAcer.setText(currentLine.dst)
    } else {
      aiAcer.setText('')
      dstAcer.setText('')
    }
    previouseLine = currentLine
  })
  eventBus.on('escape.shortcut', function (event) {
    eventBus.trigger('hide.popup')
  })
  eventBus.on('prev.shortcut', function (event) {
    if (!currentLine) { return }
    let line = session.findPrevNonEmptyLine(currentLine)
    if (line) originAcer.moveTo(session.getLineRow(line))
  })
  eventBus.on('next.shortcut', function (event) {
    if (!currentLine) { return }
    let line = session.findNextNonEmptyLine(currentLine)
    if (line) originAcer.moveTo(session.getLineRow(line))
  })
  eventBus.on('copyOrigin.shortcut', function (event) {
    if (!currentLine) { return }
    dstAcer.setText(currentLine.origin)
  })
  eventBus.on('copyAi.shortcut', function (event) {
    if (!currentLine) { return }
    dstAcer.setText(currentLine.ai)
  })
  eventBus.on('save.shortcut save.menu save.app', function (event, sess) {
    if (!sess) sess = session
    if (!sess) return
    let sessionJson = sess.toJSON()
    if (prevSessionJson === sessionJson) return
    ipcRenderer.send('save-session', sessionJson)
    prevSessionJson = sessionJson
  })
  eventBus.on('title.origin', function (event, title) {
    $('#hd-title').text(title)
  })
  eventBus.on('alert.app', function (event, data) {
    window.swal(data)
  })
}

function updateEngine () {
  engine = Engine(settings.engine, {
    from: settings.from,
    to: settings.to
  })
}

function updateI18n () {
  if (settings.i18n !== i18next.language) {
    i18next.changeLanguage(settings.i18n, function () {
      eventBus.trigger('i18n')
    })
  }
}

function seletFile (cb) {
  remote.dialog.showOpenDialog({
    title: i18next.t('dialog.openFile'),
    filters: [
      {name: 'Support Files', extensions: ['md', 'txt']},
      {name: 'All Files', extensions: ['*']}
    ],
    properties: ['openFile']
  }, function (filePaths) {
    if (!filePaths) return cb(null)
    let filePath = filePaths[0]
    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) return cb(err)
      cb(null, {filePath, text: data})
    })
  })
}

function exportFile (text, cb) {
  remote.dialog.showSaveDialog({
    title: '保存译文'
  }, function (filePath) {
    fs.writeFile(filePath, text, cb)
  })
}

function startSession (id, filePath, text) {
  let sessionData = ipcRenderer.sendSync('check-session', id)
  if (sessionData) {
    session = Session.load(sessionData)
  } else {
    session = Session.create(filePath, text)
    eventBus.trigger('save.app')
  }
  originAcer.startSession(session)
}

function autoSaveSession (span) {
  setInterval(() => {
    eventBus.trigger('save.app')
  }, span * 1000)
}

function requestAI (line) {
  engine.run(line.origin, function (err, ai) {
    if (err) throw err
    line.ai = ai
    if (line.id === currentLine.id) {
      aiAcer.setText(ai)
    }
  })
}

init()
