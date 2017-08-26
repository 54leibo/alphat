const MENUS = require('../config/menu.json')

let $menu, $eventBus

function init (seletor, eventBus) {
  $menu = $(seletor)
  $eventBus = eventBus
  render()
  bindEvent()
}

function render () {
  let dom = ''
  for (let menu of MENUS) {
    if (menu.type === 'item') {
      dom += `
        <li class="menu--item" data-menu="${menu.name}">
          <div class="menu--cell menu--icon"><span class="icon ${menu.icon ? 'icon-' + menu.icon : ''}"></span></div>
          <div class="menu--cell menu--name" data-i18n="menu.${menu.name}"></div>
          <div class="menu--cell menu--shortcut">${menu.shortcut ? (process.platfor === 'darwin' ? menu.shortcut.darwin : menu.shortcut.default) : ''}</div>
        </li>`
    } else if (menu.type === 'divider') {
      dom += `
        <li class="menu--divider"></li>`
    }
  }
  $menu.append(dom)
  $menu.localize()
}

function bindEvent () {
  $menu.on('click', '.menu--item', function () {
    let action = $(this).data('menu')
    $eventBus.trigger(action + '.menu')
    $menu.hide()
  })
  $('#btn-trigger-menu').click(function (event) {
    event.stopPropagation()
    $menu.toggle()
  })
  $('body').on('click', function () {
    if ($menu.is(':visible')) {
      $menu.hide()
    }
  })
  $eventBus.on('hide.popup', function (event) {
    $menu.hide()
  })
  $eventBus.on('i18n', function (event) {
    $menu.localize()
  })
}

module.exports = {
  init
}
