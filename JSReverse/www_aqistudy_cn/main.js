/* # ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2022-01-05
# @Author  : ITBOB
# @Blog    : www.itbob.cn
# @CSDN    : itrhx.blog.csdn.net
# @FileName: main.js
# @Software: PyCharm
# ================================== */

var CryptoJS = require("crypto-js");

var BASE64 = {
    encrypt: function (text) {
        // var b = new Base64();
        // return b.encode(text);
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text))
    },
    decrypt: function (text) {
        // var b = new Base64();
        // return b.decode(text);
        return CryptoJS.enc.Base64.parse(text).toString(CryptoJS.enc.Utf8)
    }
};

var DES = {
    encrypt: function (text, key, iv) {
        var secretkey = (CryptoJS.MD5(key).toString()).substr(0, 16);
        var secretiv = (CryptoJS.MD5(iv).toString()).substr(24, 8);
        secretkey = CryptoJS.enc.Utf8.parse(secretkey);
        secretiv = CryptoJS.enc.Utf8.parse(secretiv);
        var result = CryptoJS.DES.encrypt(text, secretkey, {
            iv: secretiv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return result.toString();
    },
    decrypt: function (text, key, iv) {
        var secretkey = (CryptoJS.MD5(key).toString()).substr(0, 16);
        var secretiv = (CryptoJS.MD5(iv).toString()).substr(24, 8);
        secretkey = CryptoJS.enc.Utf8.parse(secretkey);
        secretiv = CryptoJS.enc.Utf8.parse(secretiv);
        var result = CryptoJS.DES.decrypt(text, secretkey, {
            iv: secretiv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return result.toString(CryptoJS.enc.Utf8);
    }
};

var AES = {
    encrypt: function (text, key, iv) {
        var secretkey = (CryptoJS.MD5(key).toString()).substr(16, 16);
        var secretiv = (CryptoJS.MD5(iv).toString()).substr(0, 16);
        // console.log('real key:', secretkey);
        // console.log('real iv:', secretiv);
        secretkey = CryptoJS.enc.Utf8.parse(secretkey);
        secretiv = CryptoJS.enc.Utf8.parse(secretiv);
        var result = CryptoJS.AES.encrypt(text, secretkey, {
            iv: secretiv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return result.toString();
    },
    decrypt: function (text, key, iv) {
        var secretkey = (CryptoJS.MD5(key).toString()).substr(16, 16);
        var secretiv = (CryptoJS.MD5(iv).toString()).substr(0, 16);
        secretkey = CryptoJS.enc.Utf8.parse(secretkey);
        secretiv = CryptoJS.enc.Utf8.parse(secretiv);
        var result = CryptoJS.AES.decrypt(text, secretkey, {
            iv: secretiv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return result.toString(CryptoJS.enc.Utf8);
    }
};

function getDecryptedData(data, AES_KEY_1, AES_IV_1, DES_KEY_1, DES_IV_1) {
    data = AES.decrypt(data, AES_KEY_1, AES_IV_1);
    data = DES.decrypt(data, DES_KEY_1, DES_IV_1);
    data = BASE64.decrypt(data);
    return data;
}

function ObjectSort(obj) {
    var newObject = {};
    Object.keys(obj).sort().map(function (key) {
        newObject[key] = obj[key];
    });
    return newObject;
}

function getRequestParam(method, obj, appId) {
    var clienttype = 'WEB';
    var timestamp = new Date().getTime()
    var param = {
        appId: appId,
        method: method,
        timestamp: timestamp,
        clienttype: clienttype,
        object: obj,
        secret: CryptoJS.MD5(appId + method + timestamp + clienttype + JSON.stringify(ObjectSort(obj))).toString()
    };
    param = BASE64.encrypt(JSON.stringify(param));
    return param;
}

function getRequestAESParam(requestMethod, requestCity, appId, AES_KEY_2, AES_IV_2){
    var param = getRequestParam(requestMethod, requestCity, appId);
    return AES.encrypt(param, AES_KEY_2, AES_IV_2);
}

function getRequestDESParam(requestMethod, requestCity, appId, DES_KEY_2, DES_IV_2){
    var param = getRequestParam(requestMethod, requestCity, appId);
    return DES.encrypt(param, DES_KEY_2, DES_IV_2);
}

// var requestMethod = "GETDATA"
// var requestCity = {city: '北京'}
// var appId = "49f79420965a848068868c54864ecb7e"
// var AES_KEY_1 = "aIFJGOW9DT1EisD8"
// var AES_IV_1 = "bwXuHH56NEn3XnFG"
// var AES_KEY_2 = "dHonRXYPhwlvKzKL"
// var AES_IV_2 = "fTF0B4Jtu3SeOY4C"
// var DES_KEY_1 = "h2rXliiTDehlHsM5"
// var DES_IV_1 = "xy7OT0UjDQUoMYrJ"
// var DES_KEY_2 = "drnan951bHwbiZUN"
// var DES_IV_2 = "fdkV46lJBJvDdnjX"
// // var data = "43NQGXU3q99BncxQY0SUrR/4H+Pae9nL4RaGh6yDDbcZclwl5e2xhLfv8yhYupHdy6EoFqIY5EBy8rEZ7K+ldO51XJ4uDIhp1QxA8GB3GyjtCOlOdgfIqcJqR9US0uG56XSmfJDQH9Y6MAsvr5mEqg=="
// // console.log(getDecryptedData(data, AES_KEY_1, AES_IV_1, DES_KEY_1, DES_IV_1))
// console.log(getRequestParam(requestMethod, requestCity, appId, DES_KEY_2, DES_IV_2))
