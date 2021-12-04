![](https://i.loli.net/2021/08/07/JbP4zaS2TxU6Rkd.png)

> 关注微信公众号：K哥爬虫，持续分享爬虫进阶、JS/安卓逆向等技术干货！


## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 逆向目标

- 目标：某易支付密码加密
- 主页：`aHR0cHM6Ly9lcGF5LjE2My5jb20vaDVDYXNoaWVyL2JlZm9yZS12YWxpZGF0aW9u`
- 接口：`aHR0cHM6Ly9lcGF5LjE2My5jb20vY2FzaGllci9tL3NlY3VyaXR5L3ZlcmlmeVBheUl0ZW1z`
- 逆向参数：Form Data：`"shortPayPassword":"ZY4iJQkXwvhMwlw2hvpZQ9T%2Fc1S7wRfcfQrpe6bmnlA3hy5PJTJqeYY%2Bj372D70i"`

## 逆向过程

本期逆向素材来源于K哥爬虫交流群里某位群友的求助：

![01.png](https://i.loli.net/2021/11/05/JgSpVQ7M4TU3LjO.png)

### 抓包分析

粉丝发来的链接是某宝阁平台，一个游戏角色的购买链接，购买方式是某易支付，逆向的对象是购买时加密后的支付密码，需要注意的是要将界面调成手机模式，点击支付，来到输入密码页面，随便输入一个 6 位密码，点击确定，抓包到支付密码是加密后的，如下图所示：

![02.png](https://i.loli.net/2021/11/05/YWTQb81rA3JcgfM.png)

![03.png](https://i.loli.net/2021/11/05/taSdD4RecyLO1Wj.png)

### 参数逆向

直接搜索关键字 shortPayPassword，可以在 common.e94aeed9.js 里找到加密函数，如下图所示：

![04.png](https://i.loli.net/2021/11/05/RF9nVB5o3l1NUiM.png)

重点就是这句 `Object(n.b)(Object(c.MD5)(this.input).toString(), e)`，依次在 console 打印一下各个部分，观察其含义。

- `(this.input).toString()`：明文密码；
- `e`：一串字符串，前后找不到其生成的地方，可以直接搜索一下这个字符串，发现是通过一个接口返回的 peEnSeed 值；
- `Object(c.MD5)`：一个方法，看名字就知道是 MD5，将密码传进去得到的结果确实是 MD5；
- `Object(n.b)`：是一个 s 方法，需要进一步跟进分析。

![05.png](https://i.loli.net/2021/11/05/QdL4vXEW8lPtgYb.png)

![06.png](https://i.loli.net/2021/11/05/jy69gXO3pDMGrcQ.png)

总的来说就是密码的 MD5 值和 e 的值，一起传入到 s 方法里，继续往后跟，看看 s 函数，如下图所示：

![07.png](https://i.loli.net/2021/11/05/yaDMwKOVsJYxntQ.png)

很明显的 AES 加密了，密码的 MD5 值是待加密对象，peEnSeed 是 key，iv 偏移量是 0123456789012345，最后的加密结果还经过了一次 URL 编码，可以直接引入 crypto-js 加密包，传入对应的值即可，代码如下所示：

```javascript
// 引用 crypto-js 加密模块
var CryptoJS = require('crypto-js')

function getEncryptedPassword(password, peEnSeed) {
    var pwd = CryptoJS.enc.Utf8.parse(CryptoJS.MD5(password));
    var key = CryptoJS.enc.Utf8.parse(peEnSeed);
    var iv = CryptoJS.enc.Utf8.parse("0123456789012345");
    var encrypted = CryptoJS.AES.encrypt(pwd, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return pwd ? key ? encodeURIComponent(encrypted.toString()) : pwd : ""
}

// 测试样例
var password = "123456"
var peEnSeed = "2F63CCD861E4397F1C2181006904BAB2"
console.log(getEncryptedPassword(password, peEnSeed))

// ZY4iJQkXwvhMwlw2hvpZQ9T%2Fc1S7wRfcfQrpe6bmnlA3hy5PJTJqeYY%2Bj372D70i
```

