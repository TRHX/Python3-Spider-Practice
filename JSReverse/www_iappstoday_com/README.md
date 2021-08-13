## 爱应用

- 目标：爱应用登录
- 主页：http://www.iappstoday.com/
- 接口：http://www.iappstoday.com/ajax/login
- 逆向参数：
  Query String Parameters：
  
## 逆向过程

### 抓包分析

在首页，点击登陆，本站账号登录，随便输入一个账号密码登陆，抓包定位到登录接口为 http://www.iappstoday.com/ajax/login ，POST 请求，Form Data 里，密码 password 被加密处理了。

![01.png](https://i.loli.net/2021/08/13/DyWBl3TURiZ95rp.png)

### 参数逆向

全局搜索 `password` 或者 `password =`，很容易在 login.js 里找到 RSA 加密的地方：

![02.png](https://i.loli.net/2021/08/13/il2z73EN8ec9Muy.png)

```javascript
var rsa = new RSAKey();
rsa.setPublic("E07C46D96F735477C373C82F7D3DA01B12F1AE7C30799F128CB62778431D374DC17E08EF792DBEE23A0C4D88B1CD129308AF080D782E9D5FACF6193BC644A997", '10001');
password = hex2b64(rsa.encrypt(password));
```

鼠标放到 `rsa.encrypt` 上面可以看到实际上是 `RSAEncrypt` 函数，直接跟进这个函数，可以看到 seclib.js 就是整个 RSA 加密的代码：

![03.png](https://i.loli.net/2021/08/13/f4DHBcbKp5surAI.png)

将 seclib.js 整个代码 copy 下来，本地调试，提示 navigator 和 window 未定义，直接定义即可：

```javascript
navigator = {
    appName: "Netscape",
    appVersion: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
window = {}
```

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
navigator = {
    appName: "Netscape",
    appVersion: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
window = {}

// Security Library for iApps.
function BigInteger(t, i, r) {}

function nbi() {}

// 此处省略 N 个函数

function byte2Hex(n) {}

function pkcs1pad2(n, t) {}

function RSAKey() {}

function RSASetPublic(n, t) {}

function RSADoPublic(n) {}

function RSAEncrypt(n) {}

RSAKey.prototype.doPublic = RSADoPublic,
RSAKey.prototype.setPublic = RSASetPublic,
RSAKey.prototype.encrypt = RSAEncrypt;

function hex2b64(r) {}

function b64tohex(r) {}

function b64toBA(r) {}

var b64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    , b64padchar = "=";

function getEncryptedPassword(password) {
    var rsa = new RSAKey();
    rsa.setPublic("E07C46D96F735477C373C82F7D3DA01B12F1AE7C30799F128CB62778431D374DC17E08EF792DBEE23A0C4D88B1CD129308AF080D782E9D5FACF6193BC644A997", '10001');
    password = hex2b64(rsa.encrypt(password));
    return password
}

// 测试样例
// console.log(getEncryptedPassword('234234'))
```
