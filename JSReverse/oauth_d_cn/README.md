## 当乐网

- 目标：当乐网登录
- 主页：https://oauth.d.cn/auth/goLogin.html
- 接口：https://oauth.d.cn/auth/login
- 逆向参数：
    - Query String Parameters：
        - `pwd: 26fac08e6b524bef29c09479fdefe604ea7b2c4d7285a3e01f0969a9230a4e9af1b8ed23ca840978f61bf0e7850c72ece07dc95ef3f7484a5086284f825bd420da19ecd8b832877b113f21181bc9a22cc795c92f8d4c8dc6ca8b21309c674220e365ab67475a299277b0aa7842e09517c7ab3c5e693e51c4d9d9935f6ec430cb`
  
## 分析过程

全局搜索 `pwd` 关键字，在首页就可以找到一段 `submitData` 提交数据的函数，埋下断点进行调试，可以发现明文密码是经过 RSA 加密后得到的：

![01.png](https://i.loli.net/2021/07/27/mq3FZcysJhGdABO.png)

跟进这个 rsa 加密函数：

![02.png](https://i.loli.net/2021/07/27/GAyfrneUi4vRgZI.png)

```javascript
  var rsa = function (arg) {
      setMaxDigits(130);
      var PublicExponent = "10001";
      var modulus = "be44aec4d73408f6b60e6fe9e3dc55d0e1dc53a1e171e071b547e2e8e0b7da01c56e8c9bcf0521568eb111adccef4e40124b76e33e7ad75607c227af8f8e0b759c30ef283be8ab17a84b19a051df5f94c07e6e7be5f77866376322aac944f45f3ab532bb6efc70c1efa524d821d16cafb580c5a901f0defddea3692a4e68e6cd";
      var key = new RSAKeyPair(PublicExponent, "", modulus);
      return encryptedString(key, arg);
  };
```

`setMaxDigits` 这个函数在 BigInt.js 里面可以找到，而 `RSAKeyPair` 和 `encryptedString` 都可以在 RSA.js 里面找到，由于这两个 JS 都比较复杂，所以直接将两个 JS 源码全部复制下来直接调用即可，在本地调试的过程中发现 RSA.js 里面会提示 `BarrettMu` 未定义，经过调试可以发现这个函数在 Barrett.js 里面，所以直接把 Barrett.js 也全部复制下来即可。

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
var RSAAPP = {};

RSAAPP.NoPadding = "NoPadding";
RSAAPP.PKCS1Padding = "PKCS1Padding";
RSAAPP.RawEncoding = "RawEncoding";
RSAAPP.NumericEncoding = "NumericEncoding"

function RSAKeyPair(encryptionExponent, decryptionExponent, modulus, keylen) {}

function encryptedString(key, s, pad, encoding) {}

function decryptedString(key, c) {}

var biRadixBase = 2;
var biRadixBits = 16;
var bitsPerDigit = biRadixBits;
var biRadix = 1 << 16;
var biHalfRadix = biRadix >>> 1;
var biRadixSquared = biRadix * biRadix;
var maxDigitVal = biRadix - 1;
var maxInteger = 9999999999999998;
var maxDigits;
var ZERO_ARRAY;
var bigZero, bigOne;

function setMaxDigits(value) {}

setMaxDigits(20);

var dpl10 = 15;
var lr10 = biFromNumber(1000000000000000);

function BigInt(flag) {}

// 此处省略 N 个函数

function BarrettMu_multiplyMod(x, y) {}

function BarrettMu_powMod(x, y) {}

function getEncryptedPassword (arg) {
    setMaxDigits(130);
    var PublicExponent = "10001";
    var modulus = "be44aec4d73408f6b60e6fe9e3dc55d0e1dc53a1e171e071b547e2e8e0b7da01c56e8c9bcf0521568eb111adccef4e40124b76e33e7ad75607c227af8f8e0b759c30ef283be8ab17a84b19a051df5f94c07e6e7be5f77866376322aac944f45f3ab532bb6efc70c1efa524d821d16cafb580c5a901f0defddea3692a4e68e6cd";
    var key = new RSAKeyPair(PublicExponent, "", modulus);
    return encryptedString(key, arg);
}

// 测试样例
// console.log(getEncryptedPassword("2543534534"))
```
