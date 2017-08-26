const i18next = require('i18next')
const LngDetector = require('i18next-browser-languagedetector')
const jqueryI18next = require('jquery-i18next')

function init ({lng, resources}, cb) {
  i18next
    .use(LngDetector)
    .init({
      fallbackLng: ['en'],
      lng,
      resources
    }, function (err) {
      if (err) return cb(err)
      jqueryI18next.init(i18next, $)
      cb()
    })
}

module.exports = init
