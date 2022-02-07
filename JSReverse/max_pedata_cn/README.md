![](https://i.loli.net/2021/08/07/JbP4zaS2TxU6Rkd.png)

> 关注微信公众号：K哥爬虫，持续分享爬虫进阶、JS/安卓逆向等技术干货！

## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 逆向目标

- 目标：某投资领域 SAAS 系统 PEDATA MAX 资讯，返回结果加密
- 主页：`aHR0cHM6Ly9tYXgucGVkYXRhLmNuL2NsaWVudC9uZXdzL25ld3NmbGFzaA==`
- 接口：`aHR0cHM6Ly9tYXgucGVkYXRhLmNuL2FwaS9xNHgvbmV3c2ZsYXNoL2xpc3Q=`
- 逆向参数：请求返回的加密结果，`data: "L+o+YmIyNDE..."`

## 抓包分析

我们在首页，点击查看全部24小时资讯，往下拉，资讯是以 Ajax 形式加载的，我们选中开发者工具 XHR 进行筛选，很容易找到一个 list 请求，其返回值 data 是一串经过加密后的字符串，exor 不知道是啥，但是后面可能有用，ts 是时间戳，如下图所示：

![01.png](https://s2.loli.net/2022/01/04/r7RGZsgw1M6JvdH.png)

Payload 里的参数没有什么特别的，就是一些翻页信息，我们再看看请求 header，这里注意 `Cookie` 和 `HTTP-X-TOKEN` 两个参数，访问这个页面需要登录账号，一般来说，Cookie 是用来标识不同用户的，但经过 K 哥测试发现，此案例中，这个 HTTP-X-TOKEN 参数才是用来识别用户的，所以不需要 Cookie 也行，随便提一嘴，Cookie 中我们经常看到有 `Hm_lvt_xxx` 和 `Hm_lpvt_xxx` 是用于百度联盟广告的数据统计的，与爬虫无关。

![02.png](https://s2.loli.net/2022/01/04/Mojc4SxJKtAr3yh.png)

## 加密逆向

我们注意到返回的是一个字典，在获取到加密数据后，肯定会有一个取值的过程，所以我们直接搜索键，搜索 exor 结果只有一个：

![03.png](https://s2.loli.net/2022/01/04/7hS9HNwUPzLYyDs.png)

这里  `e.data` 就是返回的字典，`e.data.data`、`e.data.exor` 依次取加密值和 exor，这里就可以猜测是将加密值取出来进行解密操作了，我们在此函数结尾处也打个断点，看看这段代码执行完毕后，data 的值是否变成了明文：

![04.png](https://s2.loli.net/2022/01/04/YfVGsmyRZbqWzOC.png)

不出所料，`Object(p["y"])(e.data.data, e.data.exor)` 这段代码就是解密函数了，`Object(p["y"])` 其实是调用了 M 方法，跟进去看看：

![05.png](https://s2.loli.net/2022/01/04/F3CkznfwIpuQyis.png)

传入的 t 和 n 分别是加密值和 exor，最后返回的 `JSON.parse(c)` 就是解密结果：

![06.png](https://s2.loli.net/2022/01/04/ivdA5eSPaJh91rt.png)

关键代码：

```javascript
function M(t, n) {
    var a = L(Object(s["a"])(), n)
    , r = Y(B(t), a)
    , c = o.a.gunzipSync(e.from(r)).toString("utf-8");
    return JSON.parse(c)
}
```

挨个函数扣下来，简单的就不讲了， 其中 `Object(s["a"])`，选中它，其实是调用了 c 方法，跟进 c 方法，实际上是取了 `loginToken`，这个 `loginToken` 就是我们前面分析的请求头中的 `HTTP-X-TOKEN`，包含了你的登录信息。

拓展知识：`window.localStorage` 属性用于在浏览器中存储键值对形式的数据，`localStorage` 与 `sessionStorage` 类似，区别在于：`localStorage` 中的数据可以长期保留，没有过期时间，直到被手动删除。`sessionStorage` 的数据仅保存在当前会话中，在关闭窗口或标签页之后将会删除这些数据。

![07.png](https://s2.loli.net/2022/01/04/8el92BxjsVQzhg1.png)

再往下看，有个 `o.a.gunzipSync()`，先放一下，先看看传入的参数 `e.from(r)`，跟进看可能看不出来什么，直接对比 `r` 和 `e.from(r)`，会发现都是 Uint8Array 的数据，一模一样的，如下图所示：

![08.png](https://s2.loli.net/2022/01/05/id4N1lt9KcYgHTJ.png)

再来看看 `o.a.gunzipSync()`，实际上调用的是 chunk-vendors.js 里的匿名函数，不知道这个 JS 不要紧，我们注意到 chunk-vendors.js 里面的代码有超过14万行，再加上这个奇怪的名字，什么模块供应商，不难想到这是一个系统或者第三方生成的 JS，事实上它是 vue 应用程序构建过程中创建的文件，对于我们爬虫工程师来讲，粗暴的将其理解为类似 jquery.js 一样的东西也行，我们一般是不会去扣 jquery.js 里面的代码的，同样这个 chunk-vendors.js 也不可能傻傻的去扣。

![09.png](https://s2.loli.net/2022/01/04/PAkbFhtoUGWeYmi.png)

我们重点看看这个函数名，gunzipSync，其他不认识，但认识 zip 吧，可以联想到应该与压缩有关，不了解同样不要紧，直接使出百度大法：

![10.png](https://s2.loli.net/2022/01/04/3qMUa9sgAF2X5KH.png)

这直接给出了 nodejs 里面的实现方法，用的是 zlib 模块，随便找个示例看看用法：

```javascript
var zlib = require('zlib');
var input = "Nidhi";
var gzi = zlib.gzipSync(input);
var decom = zlib.gunzipSync(new Buffer.from(gzi)).toString();

console.log(decom);
```

进一步学习，我们可以知道 `zlib.gunzipSync()` 方法是 zlib 模块的内置应用程序编程接口，用于使用 Gunzip 解压数据块。传入的数据可以是 Buffer、TypedArray、DataView、ArrayBuffer、string 类型，在官方文档中我们可以看到更新历史里面，在 v8.0.0 以后，传入的数据就支持 Uint8Array 了：

![11.png](https://s2.loli.net/2022/01/05/lLWxekSTArEuQXD.png)

结合前面我们对 r 值的分析，所以在 nodejs 里，直接把 r 值传入到 `zlib.gunzipSync()` 方法里就可以了，将用到的 L、V、B 三个方法扣出来，然后配合 zlib 库，改写一下就能拿到解压后的数据了：

```javascript
function getDecryptedData(encryptedData, exor, loginToken) {
    var a = L(loginToken, exor);
    var r = Y(B(encryptedData), a)
    var decryptedData = zlib.gunzipSync(r).toString();
    return decryptedData
}
```

![12.png](https://s2.loli.net/2022/01/05/BKywIhs7TUSjk2C.png)

## 完整代码

GitHub 关注 K 哥爬虫，持续分享爬虫相关代码！欢迎 star ！https://github.com/kgepachong/

**以下只演示部分关键代码，不能直接运行！** 完整代码仓库地址：https://github.com/kgepachong/crawler/

### JavaScript 加密代码

```javascript
/* ==================================
# @Time    : 2021-12-31
# @Author  : 微信公众号：K哥爬虫
# @FileName: main.js
# @Software: PyCharm
# ================================== */

var zlib = require('zlib');

function L(e, t) {
    if ("1" == t)
        return [7, 65, 75, 31, 71, 101, 57, 0];
    for (var n = [], a = 0, r = t.length; a < r; a += 2)
        n.push(e.substr(1 * t.substr(a, 2), 1).charCodeAt());
    return n
}

function Y(e, t) {
    for (var n, a = new Uint8Array(e.length), r = 0, c = e.length; r < c; r++)
        n = t[r % t.length],
            a[r] = e[r].charCodeAt() ^ n;
    return a
}

function B(e) {
    var t, n, a, r, c, u, i, o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", s = "", f = 0;
    e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (f < e.length)
        r = o.indexOf(e.charAt(f++)),
            c = o.indexOf(e.charAt(f++)),
            u = o.indexOf(e.charAt(f++)),
            i = o.indexOf(e.charAt(f++)),
            t = r << 2 | c >> 4,
            n = (15 & c) << 4 | u >> 2,
            a = (3 & u) << 6 | i,
            s += String.fromCharCode(t),
        64 != u && (s += String.fromCharCode(n)),
        64 != i && (s += String.fromCharCode(a));
    return s
}

function getDecryptedData(encryptedData, exor, loginToken) {
    var a = L(loginToken, exor);
    var r = Y(B(encryptedData), a)
    var decryptedData = zlib.gunzipSync(r).toString();
    return decryptedData
}
```

### Python 示例代码

```python
# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-12-31
# @Author  : 微信公众号：K哥爬虫
# @FileName: main.py
# @Software: PyCharm
# ==================================


import execjs
import requests

news_est_url = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
login_token = "token 换成你自己的！"
headers = {
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Host": "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler",
    "HTTP-X-TOKEN": login_token,
    "Origin": "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler",
    "Referer": "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
}


def get_decrypted_data(encrypted_data, exor):
    with open('pedata_decrypt.js', 'r', encoding='utf-8') as f:
        pedata_js = f.read()
    decrypted_data = execjs.compile(pedata_js).call('getDecryptedData', encrypted_data, exor, login_token)
    return decrypted_data


def get_encrypted_data():
    data = {
        "type": "",
        "module": "LP",
        "page":
            {
                "currentPage": 1,
                "pageSize": 10
            }
    }
    response = requests.post(url=news_est_url, headers=headers, json=data).json()
    encrypted_data, exor = response["data"], response["exor"]
    return encrypted_data, exor


def main():
    encrypted_data, exor = get_encrypted_data()
    decrypted_data = get_decrypted_data(encrypted_data, exor)
    print(decrypted_data)


if __name__ == '__main__':
    main()
```

