/* # ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-12-13
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: challenge_3.js
# @Software: PyCharm
# ================================== */

var CryptoJS = require('crypto-js')

function encryptByDES(message, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.ciphertext.toString();
}

function getSign() {
    var message = "http://spider.wangluozhe.com/challenge/3";
    message = message + '|' + Date.parse(new Date()).toString();
    var key = Date.parse(new Date()).toString();
    return encryptByDES(message, key);
}

// 测试输出
// console.log(getSign())
