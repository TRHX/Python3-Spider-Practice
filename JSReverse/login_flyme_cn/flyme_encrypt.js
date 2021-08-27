function excutePP(r, e) {
    for (var n = "", t = 0; t < r.length; t++) {
        var o = e ^ r.charCodeAt(t);
        n += String.fromCharCode(o)
    }
    return encodeURIComponent(n)
}

function generateMix(r) {
    return Math.ceil(1e3 * Math.random())
}

function getEncryptedPassword(password) {
    var kk = generateMix();
    return excutePP(password, kk);
}

// 测试样例
// console.log(getEncryptedPassword("12345678"))
