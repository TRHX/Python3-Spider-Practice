## 学易云

- 目标：学易云登录
- 主页：https://passport.xueyiyun.com/login
- 接口：https://passport.xueyiyun.com/Login?returnUrl=%2f
- 逆向参数：
    - Form Data：
        - `Password: X4CG%2FjYDr2q6tqt94n%2BlzIDn3zjRwEFk13q2odEegFIHgfTqO9Ghv3ijnFsr2Bb13DPA4gAaEBqT%2F26yc44TVpP604E3j1nNMFt17BuSwrf48MdA%2BJhUt%2Fj7TVUy2baqNrgRsCRRWu%2Bt%2FAkdBLYcNO1twJGj9L7ZybRjS3%2Fj%2F1fVlGnxJNevWoEeN8%2FPD%2B%2BmNd1yajh92e%2BQXl9MZUDJNUSsjzSPkPa%2BwfbKZ87PHTrJVL3Zf2H8teI2MnVeGeLO%2FAMDNiea7FSCyRElIBzzzMLhJdcR9qZIYTnFBVTPMWhZ2FNG8hrsPxTwNGcaEQJ60P3ZQatAnzzpEtmVu3T45Q%3D%3D`

## 分析过程

加密参数只有一个 password，直接全局搜索，发现只有 main.js 一个 JS 文件里面有此参数，点击第一个就可以看到是查找元素，获取里面的值，JS 文件直接写好了注释，直接看下面加密部分。

![01.png](https://i.loli.net/2021/07/13/BDRPaydgIeA9u1H.png)

```javascript
if (rsaPublicKey) {
    setMaxDigits(262);
    var key = new RSAKeyPair(rsaPublicKey.exponent, "", rsaPublicKey.modulus, parseInt(rsaPublicKey.dwKeySize));
    var ciphertext = encryptedString(key, user.Password, RSAAPP.PKCS1Padding, RSAAPP.RawEncoding);
    user.Password = base64js.fromByteArray(ciphertext);
    user.Password = encodeURIComponent(user.Password);
}
```

非常明显了，RSA 加密，其中有一个 rsaPublicKey，有三个属性：exponent、modulus、dwKeySize，直接全局搜索，定位到获取公钥的地方：

![02.png](https://i.loli.net/2021/07/13/s1LPkQWwYAXeOVG.png)

```javascript
$.get('/api/account/rsaPublicKeyToBit', {}, function (data) {
    rsaPublicKey = data;
});
```

显然 rsaPublicKey 是向 https://passport.xueyiyun.com/api/account/rsaPublicKeyToBit 发送 get 请求得到的。

继续加密部分的函数跟进，点击 RSAKeyPair 来到一个 rsa.js 的 JS 文件，后续的 encryptedString 函数、RSAAPP 等参数都可以在这个文件里面找到，直接复制整个文件即可。

![03.png](https://i.loli.net/2021/07/13/cDotby7ENMVpPsO.png)

加密的最后两步分别是 base64 加密和将字符串作为 URI 组件进行编码，这两步可以直接使用 Python 来完成。

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
function setMaxDigits(n) {}

function BigInt(n) {}

function biFromDecimal(n) {}

// 此处省略 N 个函数

function RSAKeyPair(n, t, i, r) {}

function encryptedString(n, t, i, r) {}

function decryptedString(n, t) {}

var lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", dpl10, lr10, hexatrigesimalToChar,
    hexToChar, highBitMasks, lowBitMasks, RSAAPP;

(function (n) {}
)(typeof exports == "undefined" ? this.base64js = {} : exports);

var biRadixBase = 2, biRadixBits = 16, bitsPerDigit = biRadixBits, biRadix = 65536, biHalfRadix = biRadix >>> 1,
    biRadixSquared = biRadix * biRadix, maxDigitVal = biRadix - 1, maxInteger = 9999999999999998, maxDigits, ZERO_ARRAY,
    bigZero, bigOne;
setMaxDigits(20);
dpl10 = 15;
lr10 = biFromNumber(1e15);
hexatrigesimalToChar = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
hexToChar = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
highBitMasks = [0, 32768, 49152, 57344, 61440, 63488, 64512, 65024, 65280, 65408, 65472, 65504, 65520, 65528, 65532, 65534, 65535];
lowBitMasks = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535];
RSAAPP = {};
RSAAPP.NoPadding = "NoPadding";
RSAAPP.PKCS1Padding = "PKCS1Padding";
RSAAPP.RawEncoding = "RawEncoding";
RSAAPP.NumericEncoding = "NumericEncoding"


function getEncryptedCiphertext(rsaPublicKey, password) {
    setMaxDigits(262);
    var key = new RSAKeyPair(rsaPublicKey.exponent, "", rsaPublicKey.modulus, parseInt(rsaPublicKey.dwKeySize));
    var ciphertext = encryptedString(key, password, RSAAPP.PKCS1Padding, RSAAPP.RawEncoding);
    // var encryptedPassword = base64js.fromByteArray(ciphertext);
    // encryptedPassword = encodeURIComponent(encryptedPassword);
    return ciphertext
}

// 测试样例
// rsaPublicKey = {
//     "dwKeySize": 2048,
//     "exponent": "010001",
//     "modulus": "A58A59B6FAF3A111C1B5055F39C425542B21E2817D1E4B5F16B14B649F6C9850A495E506B646E335905851A9A3A9748F7023E495EC3B863025158D354B933AFCFD44C189B038638976083C79BE80379B6BB920682C6CAC3DD449AD888C44514EE01BD00FE8B121741215BDD5A9EFA1CBA4CFB316FD38E6BA27BA7FB9C892211F338AADB3DE943C07850A4B1EAA55EBD386E842E61F714BAB3BEEC54692F6B637B03EF2CCC4120EE9F5827A80F88603ED74E48F262EBD1573F1E1A771A70BFED965467EEF3B37A4F6DFDE29ECDAF95F521EB11E4B3D08B73E846F43434AAE177C7167BEBF6F5D0CAF852EE9944E0D1FC5CC06EB53D16DA90636F0D1FE3411696B"
// }
// password = '23123213'
//
// console.log(getEncryptedCiphertext(rsaPublicKey, password))
```