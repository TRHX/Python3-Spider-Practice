// 引用 crypto-js 加密模块
CryptoJS = require("crypto-js")

function aesEncrypt(e) {
    var a = CryptoJS.MD5("login.189.cn");
    var c = CryptoJS.enc.Utf8.parse(a);
    var b = CryptoJS.enc.Utf8.parse("1234567812345678");
    var d = CryptoJS.AES.encrypt(e, c, {
        iv: b
    });
    return d + ""
};

function aesDecrypt(e) {
    var b = CryptoJS.MD5("login.189.cn");
    var d = CryptoJS.enc.Utf8.parse(b);
    var c = CryptoJS.enc.Utf8.parse("1234567812345678");
    var a = CryptoJS.AES.decrypt(e, d, {
        iv: c
    }).toString(CryptoJS.enc.Utf8);
    return a
};

function valAesEncryptSet(d) {
    // var d = this.val();
    var a, c;
    try {
        a = aesDecrypt(d);
        if (a != "") {
            c = aesEncrypt(a);
            if (c != d) {
                a = ""
            }
        }
    } catch (b) {
        a = ""
    }
    if (a == "") {
        c = aesEncrypt(d)
    }
    // this.val(c);
    // return this.val()
    return c
};

function checkIsCellphone(account) {
    //alert("checkIsCellphone");
    var checkResult = false;
    var regExp = /^1[3456789]\d{9}$/; //baidu js
    if (regExp.test(account)) {
        checkResult = true;
    }
    return checkResult;
}

function checkIsCellphoneForCT(account) {
    //alert("checkIsCellphoneForCT");
    var checkResult = true;//2014-11-01
    var regExp = /^(1[35]3|18[901]|177)\d{8}|1700\d{3}$/;
    if (regExp.test(account)) {
        checkResult = true;
    }
    return checkResult;
}

function checkIsTelephone(account) {
    //alert("checkIsTelephone");
    var checkResult = false;
    var regExp = /(^\d{7,8}$)|(^0\d{10,12}$)/;
    if (regExp.test(account)) {
        checkResult = true;
    }
    return checkResult;
}

function checkIsMail(account) {
    //alert("checkIsMail");
    var checkResult = false;
    var regExp = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; //baidu js
    if (regExp.test(account)) {
        checkResult = true;
    }
    return checkResult;
}

// 测试样例
// console.log(valAesEncryptSet("123321"))
