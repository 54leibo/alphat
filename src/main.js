const { ipcMain, app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
const settings = require('electron-settings')
const sessions = require('./sessions')
const SESSIONS_PATH = 'Sessions'

// Icon
const ICON = `icon.${((process.platform === 'win32') ? 'ico' : 'png')}`
const ICON_PATH = path.join(__dirname, 'img', ICON)

if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.resolve(__dirname, '../node_modules/.bin/electron')
  })
}

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    minWidth: 600,
    minHeight: 400,
    height: 900,
    icon: ICON_PATH,
    frame: false
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  sessions.init(path.join(app.getPath('userData'), SESSIONS_PATH))
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('win-action', (event, arg) => {
  mainWindow[arg]()
})

ipcMain.on('save-settings', function (event, arg) {
  settings.setAll(arg)
})

ipcMain.on('save-session', function (event, arg) {
  sessions.upsert(arg)
})

ipcMain.on('check-session', function (event, arg) {
  event.returnValue = sessions.getSession(arg)
})

ipcMain.on('remove-session', function (event, arg) {
  sessions.remove(arg)
})

ipcMain.on('list-sessions', function (event, arg) {
  event.returnValue = sessions.listSessions()
})
