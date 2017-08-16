let sessions = {}
let fs = require('fs')
let filePath

function init (path) {
  filePath = path
  if (fs.existsSync(filePath)) {
    let data = fs.readFileSync(filePath, 'utf8')
    sessions = JSON.parse(data)
  } else {
    fs.writeFileSync(filePath, '{}')
  }
}

function upsert (session) {
  sessions[session.meta.id] = session
  fs.writeFileSync(filePath, JSON.stringify(sessions))
}

function remove (id) {
  delete sessions[id]
  fs.writeFileSync(filePath, JSON.stringify(sessions))
}

function listSessions () {
  let list = []
  for (let key in sessions) {
    let {meta, computed} = sessions[key]
    list.push({meta, computed})
  }
  return list.sort((a, b) => {
    return new Date(a.updated).getTime() - new Date(b.updated).getTime()
  })
}

function getSession (id) {
  return sessions[id] || null
}

module.exports = {
  init,
  upsert,
  remove,
  listSessions,
  getSession
}
