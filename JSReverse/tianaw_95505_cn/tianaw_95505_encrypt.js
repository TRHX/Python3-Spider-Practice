// 引用 crypto-js 加密模块
var CryptoJS = require('crypto-js')

function getJsonKey(l, privaKey) {
    var n = CryptoJS.enc.Utf8.parse(privaKey),
        t = CryptoJS.enc.Utf8.parse(privaKey),
        e = CryptoJS.enc.Utf8.parse(l),
        a = CryptoJS.AES.encrypt(e, n, {
            iv: t,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
    return CryptoJS.enc.Base64.stringify(a.ciphertext)
}

function getPrivaKey(l) {
    l = l || 32;
    for (var n = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678", t = n.length, e = "", a = 0; a < l; a++)
        e += n.charAt(Math.floor(Math.random() * t));
    return e
}


// 测试样例
// var data = '{"body":{"loginMethod":"1","name":"13593335454","password":"123321111"},"head":{"userCode":null,"channelCode":"101","transTime":1627356016051,"transToken":"","customerId":null,"transSerialNumber":""}}'
// var privaKey = getPrivaKey(16)
// var jsonKey = getJsonKey(data, privaKey)
// console.log(privaKey)
// console.log(jsonKey)