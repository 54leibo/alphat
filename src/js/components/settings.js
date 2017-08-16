const $ = require('jquery')

let $settings, $eventBus, langsList

function init (seletor, eventBus, data) {
  $settings = $(seletor)
  $eventBus = eventBus
  langsList = data.langsList
  render(data)
  bindEvent()
}

function render (data) {
  $('#settings-theme').append(data.themelist.map(theme => {
    return '<option>' + theme + '</option>'
  }).join('\n'))
  renderLangSelect(langsList[data.engine])
  $('#settings-theme').val(data.theme)
  $('#settings-lang-from').val(data.from)
  $('#settings-lang-to').val(data.to)
  $('#settings-key-mode').val(data.keyMode)
  $('#settings-font-size').val(data.fontSize)
  $(`#settings-engine-${data.engine}`).prop('checked', true)
}

function renderLangSelect (langs) {
  $('#settings-lang-from,#settings-lang-to').empty().append(langs.map(lang => {
    return `<option value="${lang.code}">${lang.name}</option>`
  }).join('\n'))
}

function getFormValue () {
  return {
    theme: $('#settings-theme').val(),
    engine: $('[name=settings-engine]:checked').val(),
    keyMode: $('#settings-key-mode').val(),
    fontSize: $('#settings-font-size').val(),
    from: $('#settings-lang-from').val(),
    to: $('#settings-lang-to').val()
  }
}

function bindEvent () {
  $('#btn-settings-x,#btn-settings-close').click(function () {
    $settings.hide()
  })
  $('#btn-settings-save').click(function () {
    $eventBus.trigger('save.settings', getFormValue())
    $settings.hide()
  })
  $('[name=settings-engine]').change(function () {
    renderLangSelect(langsList[$(this).val()])
  })
  $eventBus.on('hide.popup', function (event) {
    $settings.hide()
  })
  $eventBus.on('settings$', function (event, {action, args}) {
    $settings[action](args)
  })
}

function show () {
  $eventBus.trigger('hide.popup')
  $settings.show()
}

module.exports = {
  init,
  show,
  rerender: render
}
