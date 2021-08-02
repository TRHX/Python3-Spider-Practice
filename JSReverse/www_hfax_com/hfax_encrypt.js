// 引用 crypto-js 加密模块
var CryptoJS = require('crypto-js')

function getEncryptedPassword(t) {
    return CryptoJS.MD5(t + "TuD00Iqz4ge7gzIe2rmjSAFFKtaIBmnr8S").toString()
}

// 测试样例
// console.log(getEncryptedPassword("123123131"))