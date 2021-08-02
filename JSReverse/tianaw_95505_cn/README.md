## 天安保险

- 目标：天安保险登录
- 主页：https://tianaw.95505.cn/tacpc/#/login
- 接口：https://tianaw.95505.cn/tacpc/tiananapp/customer_login/taPcLogin
- 逆向参数：
    - Request Payload：
        - `jsonKey: "1XTz1xa5L/+VEGvBnbl2fW9aPgHHN4rCz9GttaKt+RkRW4tY8TQOEyRQMvYxeaTMlR......UXH3euWkw=="`
    - Request Headers:
        - `key: bGqp9JCbOEWC+mCahAUe/+p/+cLArwFPy36CETFxuLaP47rgSinITHVvhn41DC2VJpf9ZIhsLg8apMynPafPag==`
    
## 分析过程

此站点在登录的过程中有滑动验证码，但是经过分析可以发现 Request Payload 里面携带的 `jsonKey` 是可以逆向出来的。

### Request Payload

Request Payload 里面有一个 `jsonKey`，全局搜索，可以在 main.f0409bc0315ca30a178d.js 里面找到关键代码：

![01.png](https://i.loli.net/2021/07/28/7Fig4nZ6rHzuIUl.png)

```javascript
var m = this.newEncrypt(JSON.stringify(h));
b = {
    jsonKey: m
},
m.length < 2e3 && (V = l + "?jsonKey=" + encodeURIComponent(m))
```

很明显 `jsonKey` 就是 `m` 的值，`m` 是经过 `newEncrypt` 函数加密得到的，`newEncrypt` 函数传的参数是字符串 `h`，我们可以在 `console` 里面打印出它的值，是一个字典，`body` 里面包含了明文账号密码，`head` 里面有一个时间戳，其他参数都是定值，那么这个 `h` 参数我们就可以使用 Python 构建好之后传过去即可。

跟进 `newEncrypt` 这个函数，可以看到很明显的是 AES 加密，这个算法可以直接用 Python 来实现，也可以引入加密模块 `crypto-js` 来实现：

![02.png](https://i.loli.net/2021/07/28/TxXMGSlFeLVkWoY.png)

注意到在加密过程中用到了一个 `privaKey`，全局搜索一下这个关键字：

![03.png](https://i.loli.net/2021/07/28/sByrg4HnkQWiC2a.png)

```javascript
this.privaKey = this.getAesKey(16)
```

继续跟进 `getAesKey` 这个函数，埋下断点，可以发现重新登录的时候并不会断下，由此可以怀疑是页面刚加载的时候就生成了，刷新一下页面即可断下，可以看到传入的参数就是经过一系列操作之后返回字符串的长度：

![04.png](https://i.loli.net/2021/07/28/r93uftacZqd6MK8.png)

### Request Headers

Request Headers 里面有一个 key，直接全局搜索，看到有个地方 `head`、`cookie`、`key` 之类的关键字同时出现，那么这个地方非常有可能是设置 header 的地方，埋下断点进行调试：

![05.png](https://i.loli.net/2021/07/28/Q52UJhNpMRg9jLF.png)

可以看到 `key` 的值就是 `g` 的值，往上看有一句 `var g = this.cmdRSAEncrypt(this.privaKey)`，`this.privaKey` 和前面 `jsonKey` 的是一样的获取方法，跟进 `cmdRSAEncrypt` 这个函数：

![06.png](https://i.loli.net/2021/07/28/xFrmOasXvzHVG4f.png)

非常明显这是一个 RSA 加密，给出了公钥 PublicKey，加密对象是 `privaKey`，如果想从源码中抠出整个加密代码的话，是比较复杂的，这里知道了公钥，就可以直接使用 Python 里面的 Cryptodome 库来还原这个加密过程就行了：

```python
import base64
from Cryptodome.PublicKey import RSA
from Cryptodome.Cipher import PKCS1_v1_5

public_key = "MFwwDQYJK+zH2Pa47VVr8PkZYnRa......Tgu0gp6VTNeNQkCAwEAAQ=="
priva_key = "bd6h3YbFtajxwszX"
rsa_key = RSA.import_key(base64.b64decode(public_key))   # 导入公钥
rsa_object = PKCS1_v1_5.new(rsa_key)                     # 生成对象
header_key = base64.b64encode(rsa_object.encrypt(priva_key.encode(encoding="utf-8")))
```

## 加密 JS 剥离

Request Headers 里面的 key 通过 Python 实现，privaKey 和 jsonKey 通过 JS 获取：

```javascript
// 引用 crypto-js 加密模块
var CryptoJS = require('crypto-js')

function getJsonKey(l, privaKey) {
    var n = CryptoJS.enc.Utf8.parse(privaKey),
    t = CryptoJS.enc.Utf8.parse(privaKey),
    e = CryptoJS.enc.Utf8.parse(l),
    a = CryptoJS.AES.encrypt(e, n, {
        iv: t,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return CryptoJS.enc.Base64.stringify(a.ciphertext)
}

function getPrivaKey(l) {
    l = l || 32;
    for (var n = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678", t = n.length, e = "", a = 0; a < l; a++)
        e += n.charAt(Math.floor(Math.random() * t));
    return e
}


// 测试样例
// var data = '{"body":{"loginMethod":"1","name":"13593335454","password":"123321111"},"head":{"userCode":null,"channelCode":"101","transTime":1627356016051,"transToken":"","customerId":null,"transSerialNumber":""}}'
// var privaKey = getPrivaKey(16)
// var jsonKey = getJsonKey(data, privaKey)
// console.log(privaKey)
// console.log(jsonKey)
```
