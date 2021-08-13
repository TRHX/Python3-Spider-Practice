## 中国电信

- 目标：中国电信网上营业厅登录
- 主页：https://login.189.cn/web/login
- 接口：https://login.189.cn/web/login
- 逆向参数：
  Form Data：
  ```text
  UType: 201
  ProvinceID: 16
  AreaCode: 
  CityNo: 
  Password: 2FDAChv++22iOVyB6m42jg==
  ```

## 分析过程

观察登录页面，可以发现输入的登录账号不一样，出来的登录选项也不一样：

![01.png](https://i.loli.net/2021/08/09/bFoIhNqlTCwevXS.png)

`UType` 字面意思可以猜到应该是不同的 username 类型，那么必然有某个方法用来检测 username 的类型，先搜索一下 `UType`，可以在 loginNew.js 里面看到有很多诸如 `checkIsTelephone`、`checkIsMail` 的方法，全局搜一下，就可以看到这些函数：

![02.png](https://i.loli.net/2021/08/09/P7ykYpTVjNcdvZm.png)
![03.png](https://i.loli.net/2021/08/09/j2oFpf8BnzISiyV.png)

可以将这些函数复制下来，写进 JS，输入 username 的时候可以调用方法进行校验，然后根据不同类型，来确定 `UType` 的值，经过测试，`UType` 有如下几个值：

- 1：邮箱登录，例如 admin@itrhx.com
- 201：正常手机号登录，例如 13366666666
- 202：固话登录，例如 8637222
- 203：宽带登录，例如 8637222

`ProvinceID`、`AreaCode`、`CityNo` 从字面意思上看是一些城市的信息，那么联想到可能是登录手机号的归属地信息，经过抓包分析，这些值是通过向 https://login.189.cn/web/login/ajax 发送 POST 请求得到的，针对登录账户的不同，发送的 Form Data 也不同。

第一种：直接是手机号登录的：

![04.png](https://i.loli.net/2021/08/09/hp1BUCY9jm4cleu.png)

第二种：固话或者宽带登录，可以输入中文、拼音进行查询：

![05.png](https://i.loli.net/2021/08/09/DpS9lPc3tIsZRMk.png)

他们返回的结果都一样，类似以下结构：

```json
{
  "cityName":"武汉",
  "provinceId":"18",
  "areaCode":"027",
  "cityNo":"027",
  "provinceName":"湖北",
  "pinyin":"wuhan",
  "pinyinShort":"wh",
  "remark":null
}
```

最后一个加密参数 `Password`，直接全局搜索，很容易在 loginNew.js 找到以下语句：

```javascript
$("#hidpwd").val($.trim($("#txtPassword").val()));
$("#hidpwd").valAesEncryptSet();
```

![06.png](https://i.loli.net/2021/08/09/E1ykxI8vb3ZrpsY.png)

可以看到还有中文注释，可能就是加密的地方，埋下断点进行调试，发现看不到任何值，那么再尝试搜索一下 `valAesEncryptSet` 这个函数，在 jquery.fn-aes.min.js 可以找到，很明显这里是 AES 加密，return 回来的值就是加密后的密码，直接全部复制下来本地调试即可：

![07.png](https://i.loli.net/2021/08/09/CfpTFdlqxihynJs.png)

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
// 引用 crypto-js 加密模块
CryptoJS = require("crypto-js")

function aesEncrypt(e) {
    var a = CryptoJS.MD5("login.189.cn");
    var c = CryptoJS.enc.Utf8.parse(a);
    var b = CryptoJS.enc.Utf8.parse("1234567812345678");
    var d = CryptoJS.AES.encrypt(e, c, {
        iv: b
    });
    return d + ""
};

function aesDecrypt(e) {
    var b = CryptoJS.MD5("login.189.cn");
    var d = CryptoJS.enc.Utf8.parse(b);
    var c = CryptoJS.enc.Utf8.parse("1234567812345678");
    var a = CryptoJS.AES.decrypt(e, d, {
        iv: c
    }).toString(CryptoJS.enc.Utf8);
    return a
};

function valAesEncryptSet(d) {
    // var d = this.val();
    var a, c;
    try {
        a = aesDecrypt(d);
        if (a != "") {
            c = aesEncrypt(a);
            if (c != d) {
                a = ""
            }
        }
    } catch (b) {
        a = ""
    }
    if (a == "") {
        c = aesEncrypt(d)
    }
    // this.val(c);
    // return this.val()
    return c
};

// 测试样例
// console.log(valAesEncryptSet("123321"))
```
