## 房天下

- 目标：房天下账号密码登录
- 主页：https://passport.fang.com/
- 接口：https://passport.fang.com/login.api
- 逆向参数：
    - Form Data：
        - `pwd: 044b527dba64d1e82657668beae1d61e4d86643d231792c78d5c538461a146b01c8e28d98b14915a11758deb6095aba16688a07427150434681949529f02e808e8891e1f90b5c91d42058a83f2c6902bd69825577dc4efb993f1aa4c9bb43a2bbe1acad5781a8738614ddafbda3cca99a0c03fb634d8e1001f25bca59a8d421b`

## 分析过程

加密参数只有一个 pwd，直接全局搜索，出现一个 loginbypassword.js，很明显就是加密的 JS，这个 JS 贴心的写上了中文注释，直接来到登录模块，埋下断点：

![01.png](https://i.loli.net/2021/07/13/GcEH5dO2ZnqIaTK.png)

```javascript
uid: that.username.val(),
pwd: encryptedString(key_to_encode, that.password.val()),
Service: that.service.val(),
AutoLogin: that.autoLogin.val()
```

`encryptedString` 这个函数可以看到在一个叫做 `RSA.min.js` 的加密 JS 里，很明显的 RSA 加密，直接 copy 下来就好了，`key_to_encode` 这个参数可以直接在首页搜到，可以看到是向 `RSAKeyPair` 函数传入参数得到的：

![02.png](https://i.loli.net/2021/07/13/dwVxe4USqvsrk5y.png)

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
function setMaxDigits(n) {}

function BigInt(n) {}

function biFromDecimal(n) {}

// 此处省略 N 个函数

function twoDigit(n) {}

function encryptedString(n, t) {}

function decryptedString(n, t) {}

var biRadixBase = 2, biRadixBits = 16, bitsPerDigit = biRadixBits, biRadix = 65536, biHalfRadix = biRadix >>> 1,
    biRadixSquared = biRadix * biRadix, maxDigitVal = biRadix - 1, maxInteger = 9999999999999998, maxDigits, ZERO_ARRAY,
    bigZero, bigOne, dpl10, lr10, hexatrigesimalToChar, hexToChar, highBitMasks, lowBitMasks;
setMaxDigits(20);
dpl10 = 15;
lr10 = biFromNumber(1e15);
hexatrigesimalToChar = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
hexToChar = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
highBitMasks = [0, 32768, 49152, 57344, 61440, 63488, 64512, 65024, 65280, 65408, 65472, 65504, 65520, 65528, 65532, 65534, 65535];
lowBitMasks = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535];
setMaxDigits(129);

function getEncryptedPassword(pwd, n, i, t) {
    var key_to_encode = new RSAKeyPair(n, i, t);
    return encryptedString(key_to_encode, pwd)
}

// 测试样例
// console.log(getEncryptedPassword("16521689404", "010001", "", "978C0A92D2173439707498F0944AA476B1B62595877DD6FA87F6E2AC6DCB3D0BF0B82857439C99B5091192BC134889DFF60C562EC54EFBA4FF2F9D55ADBCCEA4A2FBA80CB398ED501280A007C83AF30C3D1A142D6133C63012B90AB26AC60C898FB66EDC3192C3EC4FF66925A64003B72496099F4F09A9FB72A2CF9E4D770C41"))
```