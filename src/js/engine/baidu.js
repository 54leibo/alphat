const request = require('superagent')
const appid = '20151211000007653'
const key = 'IFJB6jBORFuMmVGDRude'
const md5 = require('md5')

module.exports = {
  name: 'baidu',
  options: {},
  langs: [
    {name: '自动检测', code: 'auto'},
    {name: '中文', code: 'zh'},
    {name: '英语', code: 'en'},
    {name: '粤语', code: 'yue'},
    {name: '文言文', code: 'wyw'},
    {name: '日语', code: 'jp'},
    {name: '韩语', code: 'kor'},
    {name: '法语', code: 'fra'},
    {name: '西班牙语', code: 'spa'},
    {name: '泰语', code: 'th'},
    {name: '阿拉伯语', code: 'ara'},
    {name: '俄语', code: 'ru'},
    {name: '葡萄牙语', code: 'pt'},
    {name: '德语', code: 'de'},
    {name: '意大利语', code: 'it'},
    {name: '希腊语', code: 'el'},
    {name: '荷兰语', code: 'nl'},
    {name: '波兰语', code: 'pl'},
    {name: '保加利亚语', code: 'bul'},
    {name: '爱沙尼亚语', code: 'est'},
    {name: '丹麦语', code: 'dan'},
    {name: '芬兰语', code: 'fin'},
    {name: '捷克语', code: 'cs'},
    {name: '罗马尼亚语', code: 'rom'},
    {name: '斯洛文尼亚语', code: 'slo'},
    {name: '瑞典语', code: 'swe'},
    {name: '匈牙利语', code: 'hu'},
    {name: '繁体中文', code: 'cht'},
    {name: '越南语', code: 'vie'}
  ],
  run: function (text, cb) {
    let salt = Date.now()
    let str = appid + text + salt + key
    let sign = md5(str)
    request
      .get('http://api.fanyi.baidu.com/api/trans/vip/translate')
      .query({
        q: text,
        from: this.options.from,
        to: this.options.to,
        appid: appid,
        salt: salt,
        sign: sign
      }).end(function (err, res) {
        if (err) return cb(err)
        let body = res.body
        if (body.error_code) return cb(new Error(body.error_msg))
        cb(null, body.trans_result[0].dst)
      })
  }
}
