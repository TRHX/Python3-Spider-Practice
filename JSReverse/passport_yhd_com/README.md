## 1号店

- 目标：1号店登录
- 主页：https://passport.yhd.com/
- 接口：https://passport.yhd.com/publicPassport/login.do
- 逆向参数：
  Query String Parameters：
  ```text
  credentials.username: wdS8iqM1oJOZdtVdFnZuwc9h9D7qBcBhCQv31HSEIAHO4xan......
  credentials.password: GfDwv04llrJsbTOZ7PtybfNmXQlg+hKjQkgD/4vxf48Y+g8W......
  ```

## 逆向过程

### 抓包分析

来到首页，点击登陆，随便输入一个账号密码登陆，抓包定位到登录接口为 https://passport.yhd.com/publicPassport/login.do ，POST 请求，Form Data 里，credentials.username 为加密后的用户名，credentials.password 为加密后的密码，其他参数有些是验证码的参数，暂不分析。

![01.png](https://i.loli.net/2021/08/18/JerAYBdEtWT5K1S.png)

登录返回的结果里面有个 errorCode 参数，可以根据这个参数输出错误类型，不同的值代表的含义在 pc_login_new.js 里面有参考：

![02.png](https://i.loli.net/2021/08/18/zEN5cmA4K89VMUv.png)

### 参数逆向

全局搜索 `password`，可以在 pc_login_new.js 里找到加密的地方，埋下断点进行调试：

![03.png](https://i.loli.net/2021/08/18/kgK8edcLb9Du7fF.png)

分析关键代码的逻辑，可以发现 pubkey 是定值，直接复制即可，将其改写并封装成一个函数，如下所示：

```javascript
function getEncryptedData(username, password) {
    var pubkey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDXQG8rnxhslm+2f7Epu3bB0inrnCaTHhUQCYE+2X+qWQgcpn+Hvwyks3A67mvkIcyvV0ED3HFDf+ANoMWV1Ex56dKqOmSUmjrk7s5cjQeiIsxX7Q3hSzO61/kLpKNH+NE6iAPpm96Fg15rCjbm+5rR96DhLNG7zt2JgOd2o1wXkQIDAQAB"
    var i = new JSEncrypt();
    i.setPublicKey(pubkey);
    result = {
        encryptedUsername: i.encrypt(username),
        encryptedPassword: i.encrypt(password)
    }
    return result
}
```

其中 `var i = new JSEncrypt();` 可以看到是调用的 ea 函数，跟进这个函数，挨个函数扣的话比较麻烦，可以在下面几行看到整个函数的尾部，往上直接将整个函数剥离下来进行本地调试即可（大约第6701行至10434行）：

![04.png](https://i.loli.net/2021/08/18/mtBzUn5j7AeTEqZ.png)

本地调试会发现提示 window 和 navigator 对象未定义，直接定义为空即可。`navigator = {}; window = {};`，此外还会提示 ASN1 未定义，直接将 `window.ASN1 = a` 改为 `ASN1 = a` 即可。还有一种方法就是将 window 直接定义为 global 即可：`window = global;`

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
navigator = {};
window = {};

var JSEncryptExports = {};
(function (a6) {
    var dQ;
    var dg = 244837814094590;
    var dE = ((dg & 16777215) == 15715070);

    function a8(c, b, a) {}

    function dG() {}

    function dh(b, d, f, c, g, e) {}

    function cX(d, h, g, e, k, f) {}

    function d6(d, h, g, e, k, f) {}

    // 此处省略 N 个函数
    
    var ea = function (a) {};
    ea.prototype.setKey = function (a) {};
    ea.prototype.setPublicKey = function (a) {};
    ea.prototype.decrypt = function (a) {};
    ea.prototype.encrypt = function (a) {};
    ea.prototype.getKey = function (a) {};
    ea.prototype.getPublicKey = function () {};
    ea.prototype.getPublicKeyB64 = function () {};
    a6.JSEncrypt = ea
})(JSEncryptExports);
var JSEncrypt = JSEncryptExports.JSEncrypt;

function getEncryptedData(username, password) {
    var pubkey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDXQG8rnxhslm+2f7Epu3bB0inrnCaTHhUQCYE+2X+qWQgcpn+Hvwyks3A67mvkIcyvV0ED3HFDf+ANoMWV1Ex56dKqOmSUmjrk7s5cjQeiIsxX7Q3hSzO61/kLpKNH+NE6iAPpm96Fg15rCjbm+5rR96DhLNG7zt2JgOd2o1wXkQIDAQAB"
    var i = new JSEncrypt();
    i.setPublicKey(pubkey);
    result = {
        encryptedUsername: i.encrypt(username),
        encryptedPassword: i.encrypt(password)
    }
    return result
}

// 测试样例
// console.log(getEncryptedData("15576767676", "12345678"))
```
