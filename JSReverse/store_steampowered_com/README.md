## Steam

- 目标：Steam 登录
- 主页：https://store.steampowered.com/login
- 接口：https://store.steampowered.com/login/dologin/
- 逆向参数：
  Form Data：
  ```text
  password: MzX419b8uvaNe//lkf+15sx6hnLD/L1BX......
  captchagid: 5718995253934681478
  rsatimestamp: 374533150000
  ```

## 逆向过程

### 抓包分析

来到 Steam 的登录页面，随便输入一个账号密码登录，抓包定位到登录接口为 https://store.steampowered.com/login/dologin/ ，POST 请求，Form Data 里，`donotcache` 是 13 位时间戳，密码 `password` 被加密处理了，`captchagid` 和 `rsatimestamp` 不知道是什么，`captcha_text` 是验证码：

![01.png](https://i.loli.net/2021/08/16/pEsLfjFJnyd91Bz.png)

我们注意到登录请求的上面，还有一个 getrsakey 的请求，很明显和 RSA 加密有关，应该是获取 key 之类的参数，可以看到其返回值类似于：

```json
{
  "success":true,
  "publickey_mod":"b1ae3215684fd66207415e39810dcbda75c143dc8c4497994db51591ed5bd17dbaf75e1e......", 
  "publickey_exp":"010001",
  "timestamp":"288093900000",
  "token_gid":"c304e76a58481ad12"
}
```

![02.png](https://i.loli.net/2021/08/16/jPAo5RkOemd4F8Y.png)

这里可以发现登录请求的 `rsatimestamp` 参数就是这里的 `timestamp`，其他参数在后面会用到。

### 参数逆向

全局搜索 `password`，很容易在 login.js 里面找到语句 `var encryptedPassword = RSA.encrypt(password, pubKey);`，非常明显的 RSA 加密：

关键代码改写如下：

```javascript
function getEncryptedPassword(password, results) {
    var pubKey = RSA.getPublicKey(results.publickey_mod, results.publickey_exp);
    password = password.replace(/[^\x00-\x7F]/g, '');
    var encryptedPassword = RSA.encrypt(password, pubKey);
    return encryptedPassword
}
```

其中 `results` 就是前面 getrsakey 请求返回的数据：

![03.png](https://i.loli.net/2021/08/17/StolT7RvjnAwQEH.png)

`RSA.getPublicKey` 和 `RSA.encrypt` 分别是 rsa.js 里面 RSA 的 `getPublicKey` 和 `encrypt` 方法：

![04.png](https://i.loli.net/2021/08/17/ZEak2HJMB4UqYxr.png)

![05.png](https://i.loli.net/2021/08/17/KRGFlfoLMm4QNTs.png)

![06.png](https://i.loli.net/2021/08/17/OJPXIKxWc9gYp2R.png)

将整个 rsa.js 复制下来进行本地调试，会提示 `BigInteger` 未定义，鼠标放上去会看到是用到了 jsbn.js 里面的方法，如果一个一个函数去扣的话会比较麻烦，直接将整个 jsbn.js 文件代码复制下来即可：

![07.png](https://i.loli.net/2021/08/17/bRYSmgLQPnGrcVs.png)

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
navigator = {};

var dbits;

// JavaScript engine analysis
var canary = 0xdeadbeefcafe;
var j_lm = ((canary & 0xffffff) == 0xefcafe);

// (public) Constructor
function BigInteger(a, b, c) {}

// return new, unset BigInteger
function nbi() {}

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
function am1(i, x, w, j, c, n) {}

// 此处省略 N 个函数

var RSAPublicKey = function ($modulus_hex, $encryptionExponent_hex) {};

var Base64 = {};

var Hex = {};

var RSA = {};

function getEncryptedPassword(password, results) {
    var pubKey = RSA.getPublicKey(results.publickey_mod, results.publickey_exp);
    password = password.replace(/[^\x00-\x7F]/g, '');
    var encryptedPassword = RSA.encrypt(password, pubKey);
    return encryptedPassword
}

// 测试样例
// var results = {
//     publickey_exp: "010001",
//     publickey_mod: "b1c6460eb07d9a6a9de07e2d7afbbe36f30b7196a4a13b7f069e8bc6be3217fe368df46ee506ad4bbaf4190a13d3937b7cc19d081fa40c3cb431d94956804b2c80aad349fa9f95254c899d905aaaab54e7bbe95159b400fde541ec6828df76f0c7a226b38651853f6cdc67dc46e7fc3253d819e0ece8aae8551a27ebbb9f8a579ba1c4f52b69fc6605c8e11b0c00e32043c7675e268815f491be48ee644670d2d632077f8ff09d7a4928e5187d6e33279760f23b0b72a4e2928154f87326e5a57541b91862b3916e4972313ad764608d9628793eef3a0a8dcdd1ab6b908d32f56f830262fd33ed6b441e6b1e0c945508461e9c083cb10d8069f9539ca70fdd33",
//     success: true,
//     timestamp: "370921200000",
//     token_gid: "3d1df3e102d1a1d2"
// }
//
// console.log(getEncryptedPassword("12345678", results))
```
