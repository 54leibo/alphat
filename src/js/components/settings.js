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
  $('#settings-i18n').val(data.i18n)
  $('#settings-lang-from').val(data.from)
  $('#settings-lang-to').val(data.to)
  $('#settings-key-mode').val(data.keyMode)
  $('#settings-font-size').val(data.fontSize)
  $(`#settings-engine-${data.engine}`).prop('checked', true)
  $settings.localize()
}

function renderLangSelect (langs) {
  $('#settings-lang-from,#settings-lang-to').empty().append(langs.map(lang => {
    return `<option data-i18n="langs.${lang.code}" value="${lang.code}">${lang.name}</option>`
  }).join('\n')).localize()
}

function getFormValue () {
  return {
    theme: $('#settings-theme').val(),
    i18n: $('#settings-i18n').val(),
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
  $eventBus.on('i18n', function (event) {
    $settings.localize()
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
