let $history, $eventBus

function init (seletor, eventBus, data) {
  $history = $(seletor)
  $eventBus = eventBus
  render(data)
  bindEvent()
}

function render (data) {
  $('#history-tbody')
    .empty()
    .append(data.sessions.map(session => {
      return `<tr data-id="${session.meta.id}">
        <td>${session.computed.basename}</th>
        <td>${session.computed.dstLines} / ${session.computed.totalLines}</td>
        <td>${formatDateTime(session.meta.updated)}</td>
        <td>
          <button class="btn btn__icon" data-action="edit"><span class="icon icon-pencil"></span></button>
          <button class="btn btn__icon" data-action="remove"><span class="icon icon-bin"></span></button>
        </td>
      </tr>`
    }))
  $history.localize()
}

function bindEvent (data) {
  $('#history-tbody').on('click', 'button', function () {
    let $el = $(this)
    let $tr = $el.closest('tr')
    let id = $tr.data('id')
    let action = $el.data('action')
    if (action === 'edit') {
      $eventBus.trigger('edit.history', id)
    } else if (action === 'remove') {
      $eventBus.trigger('remove.history', id)
      $tr.remove()
    }
  })
  $('#btn-hs-new').click(function () {
    $eventBus.trigger('new.history')
    $history.hide()
  })
  $('#btn-hs-close,#btn-hs-x').click(function () {
    $history.hide()
  })
  $eventBus.on('hide.popup', function (event) {
    $history.hide()
  })
  $eventBus.on('i18n', function (event) {
    $history.localize()
  })
}

function formatDateTime (timeStr) {
  let dt = new Date(timeStr)
  let month = dt.getMonth() + 1
  let date = dt.getDate()
  let hour = dt.getHours()
  let minute = dt.getMinutes()
  return `${month}-${date} ${hour}:${minute}`
}

function show () {
  $eventBus.trigger('hide.popup')
  $history.show()
}

module.exports = {
  init,
  rerender: render,
  show
}
