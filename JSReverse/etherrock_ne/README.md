![](https://i.loli.net/2021/08/07/JbP4zaS2TxU6Rkd.png)

> 关注微信公众号：K哥爬虫，持续分享爬虫进阶、JS/安卓逆向等技术干货！


## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 逆向目标

- 目标：Ether Rock（一种数字货币）空投接口 AES256 加密分析
- 主页：`aHR0cHM6Ly9ldGhlcnJvY2submV0L2FpcmRyb3Av`
- 接口：`aHR0cHM6Ly9ldGhlcnJvY2submV0L2FpcmRyb3Atc3VibWl0`
- 逆向参数：Form Data：`content: U2FsdGVkX1/XnffSPZONOHb...` `key: jrwBwX2ll38bu/FFql+bAUYrRG8Ij...`

## 逆向分析

来到空投页面，随便输入一个 ETH 钱包地址，点击提交，可抓包到提交接口，POST 请求，Form Data 里 content 和 key 参数均经过了加密处理，如下图所示：

![01.png](https://i.loli.net/2021/11/24/rNUJyVjDXc5YuPO.png)

老方法，尝试直接搜索，结果很多，不利于快速定位，XHR 断点，很容易定位到加密位置，如下图所示：

![02.png](https://i.loli.net/2021/11/24/ahGKQjXiHq7IdkB.png)

一步一步分析，首先定义了 content 对象：

```javascript
var content={
    address:$(this).find('input[name=address]').val(),
    ref:$(this).find('input[name=ref]').val(),
    uuid:uuid,
    tz:tz,
    tz_offset:tz_offset,
    screen:window.screen.width+'x'+window.screen.height+'x'+window.screen.colorDepth,
    user_agent:navigator.userAgent,
    cpu:navigator.hardwareConcurrency,
    lang:navigator.language||navigator.userLanguage,
};
```

address 是钱包地址，ref、uuid 为空，tz 是时区，tz_offset 是时区偏移量，即当前时区与格林尼治标准时间（GMT）的差，screen 是屏幕相关信息，user_agent 是浏览器信息，cpu 是处理器数量，lang 是语言。这些值除了 address 以外都可以固定。

接下来定义了一个 key：`var key=random_string(36);`，跟进 `random_string()` 方法，可以看到是进行了一些取随机值和幂运算，可以直接 copy 下来，如下图所示：

![03.png](https://i.loli.net/2021/11/24/CXqmcR72BW6vbeg.png)

接着将定义的 content 和生成的 key 进行了一个叫做 AES256 的加密：`content=AES256.encrypt(JSON.stringify(content),key);` 这里 AES256 一般是指的密钥长度为 32 bytes（256 bit / 8）的 AES 加密，但是不要被名称迷惑，我们跟进去看看：

![04.png](https://i.loli.net/2021/11/24/LbIscA7yRZHXGMU.png)

![05.png](https://i.loli.net/2021/11/24/wSYOEhcXHkTj98G.png)

可以看到实际上是调用了 `h.AES.encrypt()` 方法，往上看这个 h，可以看到是引用了 [node-cryptojs-aes](https://www.npmjs.com/package/node-cryptojs-aes)，支持 AES 对称密钥加密，这里就比较简单了，我们在本地也直接引入这个库即可，至此，content 的加密方式就找到了。

接下来看 key 值，这个就更简单了，很明显用的是 jsencrypt 库，对原来生成的 36 位字符串的 key 进行了 RSA 加密，同样在本地直接引用库即可。

![06.png](https://i.loli.net/2021/11/24/rD9AKscq5jXwWTm.png)

## 完整代码

GitHub 关注 K 哥爬虫，持续分享爬虫相关代码！欢迎 star ！https://github.com/kgepachong/

**以下只演示部分关键代码，不能直接运行！** 完整代码仓库地址：https://github.com/kgepachong/crawler/

### JavaScript 加密代码

```javascript
function randomString(N) {
    if (!parseInt(N, 10)) N = 6;
    var rs = Math.floor(Math.pow(36, N) * Math.random()).toString(36);
    return (Math.pow(10, N) + rs).substr(-N);
}

var h = require("node-cryptojs-aes").CryptoJS
    , p = {
    stringify: function (b) {
        var e = h.enc.Hex.parse(b.salt.toString()).toString(h.enc.Latin1);
        b = b.ciphertext.toString(h.enc.Latin1);
        return h.enc.Latin1.parse("Salted__" + e + b).toString(h.enc.Base64)
    },
    parse: function (b) {
        b = h.enc.Base64.parse(b).toString(h.enc.Latin1);
        if ("Salted__" !== b.substr(0, 8))
            throw Error("Error parsing salt");
        var e = b.substr(8, 8);
        b = b.substr(16);
        return h.lib.CipherParams.create({
            ciphertext: h.enc.Latin1.parse(b),
            salt: h.enc.Latin1.parse(e)
        })
    }
};

var e = randomString(36);

function getContent(address) {
    var b = JSON.stringify({
        "address": address,
        "ref": "",
        "uuid": "",
        "tz": "Asia/Shanghai",
        "tz_offset": 8,
        "screen": "1920x1080x24",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36",
        "cpu": 8,
        "lang": "zh"
    })
    return h.AES.encrypt(b, e, {
        format: p
    }).toString()
}

function getKey() {
    JSEncrypt = require("jsencrypt")
    var crypt = new JSEncrypt();
    var pub = [
        '-----BEGIN PUBLIC KEY-----',
        'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDVmYQhCYTnnkTPRMI5Ad3vfad9',
        'lhjzOU92FZ3reUiN/vmqP/wC1DKKExYDsqa+w5xBP0AjGkfDWk3q4PlWu0UsBGZx',
        '62Gvt0ds75u8FnmLv+ufMimF4962/9Lx7uyh9g1H3/ze5ZXscWYy3gtts9d2Ga0R',
        'pl0X49Cz0JhYYicuGwIDAQAB',
        '-----END PUBLIC KEY-----',
    ];
    crypt.setPublicKey(pub.join('\n'));
    key = crypt.encrypt(e);
    return key
}

function getContentAndKey(address) {
    result = {
        "key": getKey(),
        "content": getContent(address)
    }
    return result
}

// 测试样例
// console.log(getContentAndKey("xxxxxxxxxxxxxxxx"))
```

## Python 代码

```python
# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-11-24
# @Author  : 微信公众号：K哥爬虫
# @FileName: airdrop_submit.py
# @Software: PyCharm
# ==================================


import execjs
import requests


def get_content_and_key(address):
    with open("get_content_and_key.js", encoding="utf-8") as f:
        ether_rock_js = f.read()
    content_and_key_dict = execjs.compile(ether_rock_js).call('getContentAndKey', address)
    return content_and_key_dict


def airdrop_submit(content_and_key_dict):
    submit_url = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
    headers = {
        "Accept": "text/html, */*; q=0.01",
        "Accept-Language": "zh,zh-CN;q=0.9,en-US;q=0.8,en;q=0.7",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "Host": "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler",
        "Origin": "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler",
    }
    data = {
        "content": content_and_key_dict["content"],
        "key": content_and_key_dict["key"]
    }
    response = requests.post(url=submit_url, data=data, headers=headers)
    print(response.text)


def main():
    address = input("请输入ETH钱包地址领取空投: ")
    content_and_key_dict = get_content_and_key(address)
    airdrop_submit(content_and_key_dict)


if __name__ == '__main__':
    main()
```

