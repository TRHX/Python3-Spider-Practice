var CryptoJS = require('crypto-js')

function SHA1Encrypt(word) {
    return CryptoJS.SHA1(word).toString(CryptoJS.enc.Hex);
}

function base64encode2(e) {
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    var a, c, r, o, t, n;
    for (r = e.length,
    c = 0,
    a = ""; c < r; ) {
        if (o = 255 & e.charCodeAt(c++),
        c == r) {
            a += base64EncodeChars.charAt(o >> 2),
            a += base64EncodeChars.charAt((3 & o) << 4),
            a += "==";
            break
        }
        if (t = e.charCodeAt(c++),
        c == r) {
            a += base64EncodeChars.charAt(o >> 2),
            a += base64EncodeChars.charAt((3 & o) << 4 | (240 & t) >> 4),
            a += base64EncodeChars.charAt((15 & t) << 2),
            a += "=";
            break
        }
        n = e.charCodeAt(c++),
        a += base64EncodeChars.charAt(o >> 2),
        a += base64EncodeChars.charAt((3 & o) << 4 | (240 & t) >> 4),
        a += base64EncodeChars.charAt((15 & t) << 2 | (192 & n) >> 6),
        a += base64EncodeChars.charAt(63 & n)
    }
    return a
}

// 测试样例
// console.log(base64encode2("123123"))
// console.log(base64encode2("1231234"))
// console.log(SHA1Encrypt('719198916656926dc80e144287853608hqew'))
