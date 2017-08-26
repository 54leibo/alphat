let $winbtn, $eventBus

function init (seletor, eventBus, data) {
  $winbtn = $(seletor)
  $eventBus = eventBus
  bindEvent()
}

function bindEvent () {
  $winbtn.on('click', 'button', function (event) {
    let $el = $(this)
    let action = $el.data('win')
    let toggle = $el.data('toggle')
    if (toggle) {
      $el.hide()
      $(toggle).show()
    }
    $eventBus.trigger(action + '.winbtn')
  })
}

module.exports = {
  init
}
