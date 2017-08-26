const request = require('superagent')

module.exports = {
  name: 'youdao',
  options: {},
  langs: [
    {name: '自动检测', code: 'AUTO'},
    {name: '中文', code: 'zh-CHS'},
    {name: '日文', code: 'ja'},
    {name: '英文', code: 'EN'},
    {name: '韩文', code: 'ko'},
    {name: '法文', code: 'fr'},
    {name: '俄文', code: 'ru'},
    {name: '葡萄牙文', code: 'pt'},
    {name: '西班牙文', code: 'es'}
  ],
  run: function (text, cb) {
    request
      .get('http://fanyi.youdao.com/translate')
      .query({
        client: 'deskdict',
        keyfrom: 'chrome.extension',
        ue: 'utf8',
        i: text,
        doctype: 'json',
        from: this.options.from,
        to: this.options.to
      })
      .end(function (err, res) {
        if (err) return cb(err)
        let body = res.body
        if (body.errorCode) return cb(new Error(body.errorCode))
        cb(null, body.translateResult[0].map(v => v.tgt).join(''))
      })
  }
}
