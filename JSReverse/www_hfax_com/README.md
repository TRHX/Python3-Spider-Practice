## 惠金所

- 目标：惠金所登录
- 主页：https://www.hfax.com/login.html
- 接口：https://www.hfax.com/pc-api/user/login
- 逆向参数：
    - Cookie：
        - `aliyungf_tc=0cb70c2a4d479504ce08cac4137bf855989b42966d96c0c8a6503cb5b869d864`
        - `acw_tc=781bad3f16273776488576986e2efa46e4344a4c404eb0fa6fc411f810c4c8`
        - `SESSION=68e05158-5904-415c-9061-591ff66b8749`
    - Request Payload：
        - `imgCode: "3443"`
        - `imgToken: "D+8gLGnpJCXQVMiyoQkO0Q=="`
        - `password`: `cd7b9a3c50b3b26623c68c2552ab7dac`
        - `username`: `"18166666666"`

## 分析过程

### Cookie

分析登录接口，实际上 cookie 主要由以下几个值组成：`aliyungf_tc`、`acw_tc`、`sensorsdata2015jssdkcross`、`SESSION`，经过实验，`sensorsdata2015jssdkcross` 这个不加也是可以的，其他值，直接搜索，可以在两个链接中获取：

![01.png](https://i.loli.net/2021/07/28/wJusZOf5Q6z2AHF.png)

![02.png](https://i.loli.net/2021/07/28/HrGykFBbAuwo9Tj.png)

### Request Payload

Request Payload 里面，`imgCode` 是验证码，`username` 是明文密码，`imgToken` 经过搜索可以发现是在登录之前，发送了一个预登陆请求，这个请求返回的 JSON 里面包含 `imgToken` 和验证码的 base64 编码字符串：

![03.png](https://i.loli.net/2021/07/28/9d5av7cDmrWsPoR.png)

`password` 很明显是经过加密得到的，全局搜索一下，很容易在 login.ef1710188b140e4e87bd.js 里面找到，埋下断点进行调试：

![04.png](https://i.loli.net/2021/07/28/LS7UyTb2jXDhYJf.png)

可以看到加密后的密码就是 `a` 的值，往上看，`a = encryptByDES(this.password);`，跟进 `encryptByDES` 这个函数：

![05.png](https://i.loli.net/2021/07/28/rNVPEgKvH7nbAl8.png)

```javascript
encryptByDES: function(t) {
    return CryptoJS.MD5(t + "TuD00Iqz4ge7gzIe2rmjSAFFKtaIBmnr8S").toString()
}
```

非常明显，这里使用了 CryptoJS 进行 MD5 加密，其中参数就是明文密码加上一个字符串，这里可以直接使用 Python 的 hashlib 库来实现，也可以引入 JS 来实现。

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
// 引用 crypto-js 加密模块
var CryptoJS = require('crypto-js')

function getEncryptedPassword(t) {
    return CryptoJS.MD5(t + "TuD00Iqz4ge7gzIe2rmjSAFFKtaIBmnr8S").toString()
}

// 测试样例
// console.log(getEncryptedPassword("123123131"))
```
