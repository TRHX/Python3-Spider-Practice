## 中国移动

- 目标：中国移动掌上门户登录
- 主页：https://wap.10086.cn/
- 接口：https://login.10086.cn/login.htm
- 逆向参数：
    - Form Data：
        - `account: j9RmZgPu2jmLLghkR06NUCqo/5v7bDOTlJDMRtY9Fs......URGDHa12Q==`
        - `password: CBEYzAcL7SdMNKtenggVAg/yMWxacRThLcyLA7YXt......IQbL/R9aA==`
  
## 分析过程

全局搜索 `account =` 或者 `password =`，很容易在 new_touch.js 里面找到加密的地方，还有中文注释，直接指明了是加密的地方，埋下断点进行调试：

![01.png](https://i.loli.net/2021/08/04/XnKox4tpRFNl2Jf.png)

```javascript
params.password = encrypt(params.password);
params.account = encrypt(params.account);
```

跟进 `encrypt` 加密函数，可以看到实际上使用了 `encrypt` 函数，后面的两个 AES 加密解密没有用到，返回的 `encrypted` 值就是最终目标：

![02.png](https://i.loli.net/2021/08/04/wpHjsgNrxkWBifL.png)

可以看到 `var encrypt = new JSEncrypt();` 调用了 `ze` 函数，跟进 `ze` 函数，这里引用了 jsencrypt.min.js 这个 JS，直接全部复制下来进行本地调试：

![03.png](https://i.loli.net/2021/08/04/tlhuKwd5yqSZ2H1.png)

调试过程中会发现提示 `navigator`、`window` 和 `JSEncrypt` 未定义，前两个直接定义或者置空即可：

```javascript
navigator = {
    appName: "Netscape",
    appVersion: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
};
window = this;
```

`JSEncrypt` 我们在 jsencrypt.min.js 的最后一行将 `t.JSEncrypt = ze` 改为 `JSEncrypt = ze` 即可。

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
navigator = {
    appName: "Netscape",
    appVersion: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
};
window = this;

/*! JSEncrypt v2.3.1 | https://npmcdn.com/jsencrypt@2.3.1/LICENSE.txt */
!function(t, e) {}(this, function(t) {

    // 此处省略 N 个函数
    
    var ze = function(t) {};
    ze.prototype.setKey = function(t) {},
    ze.prototype.setPrivateKey = function(t) {},
    ze.prototype.setPublicKey = function(t) {},
    ze.prototype.decrypt = function(t) {},
    ze.prototype.encrypt = function(t) {},
    ze.prototype.getKey = function(t) {},
    ze.prototype.getPrivateKey = function() {},
    ze.prototype.getPrivateKeyB64 = function() {},
    ze.prototype.getPublicKey = function() {},
    ze.prototype.getPublicKeyB64 = function() {},
    ze.version = "2.3.1",
    JSEncrypt = ze
});

function getEncryptedData(pwd){
	var key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsgDq4OqxuEisnk2F0EJFmw4xKa5IrcqEYHvqxPs2CHEg2kolhfWA2SjNuGAHxyDDE5MLtOvzuXjBx/5YJtc9zj2xR/0moesS+Vi/xtG1tkVaTCba+TV+Y5C61iyr3FGqr+KOD4/XECu0Xky1W9ZmmaFADmZi7+6gO9wjgVpU9aLcBcw/loHOeJrCqjp7pA98hRJRY+MML8MK15mnC4ebooOva+mJlstW6t/1lghR8WNV8cocxgcHHuXBxgns2MlACQbSdJ8c6Z3RQeRZBzyjfey6JCCfbEKouVrWIUuPphBL3OANfgp0B+QG31bapvePTfXU48TYK0M5kE+8LgbbWQIDAQAB";
	var encrypt = new JSEncrypt();
    encrypt.setPublicKey(key);
    var encrypted = encrypt.encrypt(pwd);
    return encrypted;
}
```
