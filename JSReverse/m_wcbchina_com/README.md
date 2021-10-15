<h2 align="center">【JS 逆向百例】Fiddler 插件 Hook 实战，某创帮登录逆向</h2>

> 关注微信公众号：K哥爬虫，QQ交流群：808574309，持续分享爬虫进阶、JS/安卓逆向等技术干货！

## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 逆向目标

- 目标：某创帮登录接口
- 主页：aHR0cHM6Ly9tLndjYmNoaW5hLmNvbS9sb2dpbi9vdGhlci1sb2dpbi5odG1s
- 接口：aHR0cHM6Ly9tLndjYmNoaW5hLmNvbS9hcGkvbG9naW4vbG9naW4=
- 逆向参数：
    - Query String Parameters：`rnd: 0.22465933864494048`
    - Request Payload：`password: "25D55AD283AA400AF464C76D713C07AD"`

## 准备工作

该站点的加密其实并不复杂，直接搜索加密参数也可以很快定位到加密代码，但是本文主要介绍使用 Fiddler 抓包软件，搭配插件，使用 Hook 的方式来定位加密位置，如果遇到加密参数搜索不到，或者搜索结果太多的情况，Hook 是比较高效的方法，能够帮助你快速定位加密入口，有关 Hook 的详细知识，在 K 哥前期的文章有详细介绍：xxxxxxxxxx，

本文用到的抓包软件，可在 [Fiddler 官网](https://www.telerik.com/fiddler)下载，官网提供了五个不同的版本/服务：

- Fiddler Everywhere：跨平台抓包软件，支持 MacOS、Windows 和 Linux，相当于 Classic 版本的改进增强版；
- Fiddler Classic：传统的 Fiddler，仅支持 Windows，一般 Windows 用户都是用的这个版本；
- Fiddler Jam：浏览器插件，收费，主要用于网站优化、安全故障排除等；
- Fiddler Cap：专为非技术用户而设计的轻量级抓包软件，仅支持 Windows；
- Fiddler Core：Fiddler 核心，可嵌入的 .NET 库，收费。

如果你是 MacOS 或者 Linux 用户，可以选择 Fiddler Everywhere，如果你是 Windows 用户，建议选择 Fiddler Classic，抓包软件的使用方法，证书配置等等，这里不做介绍，网上有很多教程可以参考。

需要注意的是，Fiddler 本身没有 Hook 功能，需要自己编写插件，而且只有 Fiddler Classic 版本是支持插件的，可以参考 [Fiddler Classic 插件编写文档](https://docs.telerik.com/fiddler/extend-fiddler/extendwithdotnet)，也就是说 MacOS 和 Linux 用户无法通过 Fiddler 插件进行 Hook，但是不用担心，MacOS 和 Linux 用户可以通过编写浏览器插件的方式来进行 Hook，后续 K 哥也会写一篇实战文章来演示如何编写浏览器插件进行 Hook，敬请关注！

关于 Fiddler Classic 的 Hook 插件，已经有大佬写好了，这里用到的是编程猫的插件，要求 Fiddler Classic 的版本必须 >= v4.6.3，除了 Hook 功能以外，还有 JS 调试、内存漫游、JSON 解析、常见数据加密解密等，插件可以在公众号输入关键字【**Fiddler插件**】获取，安装方法在压缩包里也有，这里不再赘述。

## 逆向过程

### 抓包分析

随便输入一个账号密码，点击登陆，抓包定位到登录接口为 aHR0cHM6Ly9tLndjYmNoaW5hLmNvbS9hcGkvbG9naW4vbG9naW4= ，POST 请求，Request Payload 里，密码 password 被加密处理了，此外，Query String Parameters 里还带有一个 rnd 的参数，每次请求都会改变。那么 password 和 rnd 就是本次要逆向的目标。

![01.png](https://i.loli.net/2021/09/27/4ReyFLMrYz61vSN.png)

### 参数逆向

#### password

我们知道在 JavaScript 中 `JSON.stringify()` 方法用于将 JavaScript 对象或值转换为 JSON 字符串，`JSON.parse()` 方法用于将一个 JSON 字符串转换为 JavaScript 对象，某些站点在向 web 服务器传输用户名密码时，会用到这两个方法，在本案例中，就用到了 `JSON.stringify()` 方法，针对该方法，我们编写一个 Hook 脚本：

```javascript
(function() {
    var stringify = JSON.stringify;
    JSON.stringify = function(params) {
        console.log("Hook JSON.stringify ——> ", params);
        debugger;
        return stringify(params);
    }
})();
```

整个 Hook 脚本是一个 IIFE 立即调用函数表达式（也叫自执行函数、立即执行函数等），借助 Fiddler 插件，它可以在整个网页加载之前运行，首先定义了一个变量 `stringify` 保留原始 `JSON.stringify` 方法，然后重写 `JSON.stringify` 方法，遇到 `JSON.stringify` 方法就会执行 debugger 语句，会立即断下，最后将接收到的参数返回给原始的 `JSON.stringify` 方法进行处理，确保数据正常传输。

将 Hook 脚本放到 Fiddler 插件里，F12 开启抓包，刷新网页，重新输入账号密码点击登录，就可以看到成功断下：

![02.png](https://i.loli.net/2021/09/27/9ZjCmno2JkTSrdI.png)

![03.png](https://i.loli.net/2021/09/27/S9IxADpbeQYLcB5.png)

此时的 password 已经是加密后的了，想要定位到加密的地方，就需要看右边的 Call Stack，即调用栈，显示的是走到 `JSON.stringify()` 方法之前，依次经过了哪些函数的处理，挨个往上调试，到 `loginAction` 方法时，可以看到变量 V 和 N 依次为明文账号密码，而后经过了 `a.hex_md5(N)` 处理后，密码被加密处理了，清晰明了，这就是关键的加密入口函数。

![04.png](https://i.loli.net/2021/09/27/UJRZcQvseBY5WM9.png)

跟进 `a.hex_md5()`，其实就是 `hex_md5()` 方法，由名称也可以看出是个简单的 MD5 加密，只不过后面把小写全部转为大写罢了，完全可以使用 Python 来实现：

```python
import hashlib


encrypted_password = hashlib.md5("12345678".encode('utf-8')).hexdigest().upper()
print(encrypted_password)

# 25D55AD283AA400AF464C76D713C07AD
```

为了练习 JS 代码的剥离，我们将其加密代码剥离下来：

![05.png](https://i.loli.net/2021/09/27/AiYwrnOeqQEzkRy.png)

![06.png](https://i.loli.net/2021/09/27/BQt1Dr95IepWmOG.png)

将整个 md5.js 文件里的代码复制下来，可以发现代码开头有个 `define` 关键字，这种写法在 JavaScript 中叫做 AMD 规范，全称 Asynchronous Module Definition，即异步模块加载机制；结尾有个 `module.exports = j`，它提供了暴露接口的方法，方便在其他文件中调用，感兴趣的朋友可以自行百度了解，在本地调试过程中，直接删除 `define` 和结尾的 `module.exports = j`，然后使用语句 `j.hex_md5()` 调用即可。

#### rnd

这个 rnd 参数是直接跟在登录 URL 后面的，一定是经过了某个方法将 rnd 参数与原始 URL 拼接在一起，所以我们可以 Hook 这个登录 URL，在 URL 生成之后断下来，与 password 类似，编写如下 Hook 脚本：

```javascript
(function () {
    var open = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (method, url, async) {
        if (url.indexOf("rnd") != -1) {
            debugger;
        }
        return open.apply(this, arguments);
    };
})();
```

`XMLHttpRequest` 对象用于在后台与服务器交换数据，可以同步或异步地返回 Web 服务器的响应，而 `XMLHttpRequest.open()` 方法会初始化一个请求，基本语法为：`XMLHttpRequest.open(method, url, async, user, password)`，具体可以参考 [MDN XMLHttpRequest.open()](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/open)，其中的 url 参数就是发出请求的完整的 url，这里有个原型对象 prototype，所有的 JavaScript 对象都会从一个 prototype 原型对象中继承属性和方法，具体可以参考[菜鸟教程 JavaScript prototype](https://www.runoob.com/js/js-object-prototype.html) 的介绍。

在以上 Hook 代码中，定义了一个变量 `open` 保留原始 `XMLHttpRequest.open` 方法，然后重写 `XMLHttpRequest.open` 方法，判断如果 rnd 字符串值在 URL 里首次出现的位置不为 -1，即 URL 里包含 rnd 字符串，则执行 debugger 语句，会立即断下。

同样的，将 Hook 脚本放到 Fiddler 插件里，F12 开启抓包，刷新网页，重新输入账号密码点击登录，就可以看到成功断下：

![07.png](https://i.loli.net/2021/09/27/QZojkUJzxEdTvnF.png)

![08.png](https://i.loli.net/2021/09/27/vR4KctegYV5MHsD.png)

和之前查找 password 加密入口一样的方法，依然是查看右边的 Call Stack 调用栈，挨个往上调试，到 a 方法的时候，可以看到有一句 `a.url = c.addUrlParam(a.url, "rnd", Math.random());`，在 JavaScript 中 `Math.random()` 函数返回介于 0（包含） ~ 1（不包含） 之间的一个伪随机数，不难看出 rnd 的值就是一个随机数。

![09.png](https://i.loli.net/2021/09/27/r4xRDKNY8mGlzyL.png)

那么在 Python 中，介于 0（包含） ~ 1（不包含） 之间的一个伪随机数可以使用 random 模块来实现：

```python
import random

random_number = random.uniform(0, 1)
print(random_number)
```

## 完整代码

GitHub 关注 K 哥爬虫，持续分享爬虫相关代码！欢迎 star ！https://github.com/kgepachong/

**以下只演示部分关键代码，不能直接运行！**完整代码仓库地址：https://github.com/kgepachong/crawler/

### JavaScript 加密代码

```javascript
function c(x, c) {
    x[c >> 5] |= 128 << c % 32,
        x[(c + 64 >>> 9 << 4) + 14] = c;
    for (var a = 1732584193, _ = -271733879, y = -1732584194, d = 271733878, i = 0; i < x.length; i += 16) {
        var b = a
            , B = _
            , D = y
            , E = d;
        a = h(a, _, y, d, x[i + 0], 7, -680876936),
            d = h(d, a, _, y, x[i + 1], 12, -389564586),
            y = h(y, d, a, _, x[i + 2], 17, 606105819),
            _ = h(_, y, d, a, x[i + 3], 22, -1044525330),
            a = h(a, _, y, d, x[i + 4], 7, -176418897),
            d = h(d, a, _, y, x[i + 5], 12, 1200080426),
            y = h(y, d, a, _, x[i + 6], 17, -1473231341),
            _ = h(_, y, d, a, x[i + 7], 22, -45705983),
            a = h(a, _, y, d, x[i + 8], 7, 1770035416),
            d = h(d, a, _, y, x[i + 9], 12, -1958414417),
            y = h(y, d, a, _, x[i + 10], 17, -42063),
            _ = h(_, y, d, a, x[i + 11], 22, -1990404162),
            a = h(a, _, y, d, x[i + 12], 7, 1804603682),
            d = h(d, a, _, y, x[i + 13], 12, -40341101),
            y = h(y, d, a, _, x[i + 14], 17, -1502002290),
            _ = h(_, y, d, a, x[i + 15], 22, 1236535329),
            a = g(a, _, y, d, x[i + 1], 5, -165796510),
            d = g(d, a, _, y, x[i + 6], 9, -1069501632),
            y = g(y, d, a, _, x[i + 11], 14, 643717713),
            _ = g(_, y, d, a, x[i + 0], 20, -373897302),
            a = g(a, _, y, d, x[i + 5], 5, -701558691),
            d = g(d, a, _, y, x[i + 10], 9, 38016083),
            y = g(y, d, a, _, x[i + 15], 14, -660478335),
            _ = g(_, y, d, a, x[i + 4], 20, -405537848),
            a = g(a, _, y, d, x[i + 9], 5, 568446438),
            d = g(d, a, _, y, x[i + 14], 9, -1019803690),
            y = g(y, d, a, _, x[i + 3], 14, -187363961),
            _ = g(_, y, d, a, x[i + 8], 20, 1163531501),
            a = g(a, _, y, d, x[i + 13], 5, -1444681467),
            d = g(d, a, _, y, x[i + 2], 9, -51403784),
            y = g(y, d, a, _, x[i + 7], 14, 1735328473),
            _ = g(_, y, d, a, x[i + 12], 20, -1926607734),
            a = v(a, _, y, d, x[i + 5], 4, -378558),
            d = v(d, a, _, y, x[i + 8], 11, -2022574463),
            y = v(y, d, a, _, x[i + 11], 16, 1839030562),
            _ = v(_, y, d, a, x[i + 14], 23, -35309556),
            a = v(a, _, y, d, x[i + 1], 4, -1530992060),
            d = v(d, a, _, y, x[i + 4], 11, 1272893353),
            y = v(y, d, a, _, x[i + 7], 16, -155497632),
            _ = v(_, y, d, a, x[i + 10], 23, -1094730640),
            a = v(a, _, y, d, x[i + 13], 4, 681279174),
            d = v(d, a, _, y, x[i + 0], 11, -358537222),
            y = v(y, d, a, _, x[i + 3], 16, -722521979),
            _ = v(_, y, d, a, x[i + 6], 23, 76029189),
            a = v(a, _, y, d, x[i + 9], 4, -640364487),
            d = v(d, a, _, y, x[i + 12], 11, -421815835),
            y = v(y, d, a, _, x[i + 15], 16, 530742520),
            _ = v(_, y, d, a, x[i + 2], 23, -995338651),
            a = A(a, _, y, d, x[i + 0], 6, -198630844),
            d = A(d, a, _, y, x[i + 7], 10, 1126891415),
            y = A(y, d, a, _, x[i + 14], 15, -1416354905),
            _ = A(_, y, d, a, x[i + 5], 21, -57434055),
            a = A(a, _, y, d, x[i + 12], 6, 1700485571),
            d = A(d, a, _, y, x[i + 3], 10, -1894986606),
            y = A(y, d, a, _, x[i + 10], 15, -1051523),
            _ = A(_, y, d, a, x[i + 1], 21, -2054922799),
            a = A(a, _, y, d, x[i + 8], 6, 1873313359),
            d = A(d, a, _, y, x[i + 15], 10, -30611744),
            y = A(y, d, a, _, x[i + 6], 15, -1560198380),
            _ = A(_, y, d, a, x[i + 13], 21, 1309151649),
            a = A(a, _, y, d, x[i + 4], 6, -145523070),
            d = A(d, a, _, y, x[i + 11], 10, -1120210379),
            y = A(y, d, a, _, x[i + 2], 15, 718787259),
            _ = A(_, y, d, a, x[i + 9], 21, -343485551),
            a = C(a, b),
            _ = C(_, B),
            y = C(y, D),
            d = C(d, E)
    }
    return Array(a, _, y, d)
}

function a(q, c, a, x, s, t) {
    return C(y(C(C(c, q), C(x, t)), s), a)
}

function h(c, h, g, d, x, s, t) {
    return a(h & g | ~h & d, c, h, x, s, t)
}

function g(c, h, g, d, x, s, t) {
    return a(h & d | g & ~d, c, h, x, s, t)
}

function v(c, h, g, d, x, s, t) {
    return a(h ^ g ^ d, c, h, x, s, t)
}

function A(c, h, g, d, x, s, t) {
    return a(g ^ (h | ~d), c, h, x, s, t)
}

function _(a, h) {
    var g = b(a);
    g.length > 16 && (g = c(g, a.length * U));
    for (var v = Array(16), A = Array(16), i = 0; 16 > i; i++)
        v[i] = 909522486 ^ g[i],
            A[i] = 1549556828 ^ g[i];
    var _ = c(v.concat(b(h)), 512 + h.length * U);
    return c(A.concat(_), 640)
}

function C(x, c) {
    var a = (65535 & x) + (65535 & c)
        , h = (x >> 16) + (c >> 16) + (a >> 16);
    return h << 16 | 65535 & a
}

function y(c, a) {
    return c << a | c >>> 32 - a
}

function b(c) {
    for (var a = Array(), h = (1 << U) - 1, i = 0; i < c.length * U; i += U)
        a[i >> 5] |= (c.charCodeAt(i / U) & h) << i % 32;
    return a
}

function B(c) {
    for (var a = "", h = (1 << U) - 1, i = 0; i < 32 * c.length; i += U)
        a += String.fromCharCode(c[i >> 5] >>> i % 32 & h);
    return a
}

function D(c) {
    for (var a = F ? "0123456789ABCDEF" : "0123456789abcdef", h = "", i = 0; i < 4 * c.length; i++)
        h += a.charAt(c[i >> 2] >> i % 4 * 8 + 4 & 15) + a.charAt(c[i >> 2] >> i % 4 * 8 & 15);
    return h
}

function E(c) {
    for (var a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", h = "", i = 0; i < 4 * c.length; i += 3)
        for (var g = (c[i >> 2] >> 8 * (i % 4) & 255) << 16 | (c[i + 1 >> 2] >> 8 * ((i + 1) % 4) & 255) << 8 | c[i + 2 >> 2] >> 8 * ((i + 2) % 4) & 255, v = 0; 4 > v; v++)
            h += 8 * i + 6 * v > 32 * c.length ? S : a.charAt(g >> 6 * (3 - v) & 63);
    return h
}

var F = 0
    , S = ""
    , U = 8
    , j = {
    hex_md5: function (s) {
        return D(c(b(s), s.length * U)).toUpperCase()
    },
    b64_md5: function (s) {
        return E(c(b(s), s.length * U))
    },
    str_md5: function (s) {
        return B(c(b(s), s.length * U))
    },
    hex_hmac_md5: function (c, a) {
        return D(_(c, a))
    },
    b64_hmac_md5: function (c, a) {
        return E(_(c, a))
    },
    str_hmac_md5: function (c, a) {
        return B(_(c, a))
    }
};

function getSign(){
    var c = (new Date).getTime();
    var N = j.hex_md5(c).toUpperCase();
    return N
}

function getEncryptedPassword(password) {
    return j.hex_md5(password)
}

// 测试样例
// console.log(getEncryptedPassword("12345678"))
// console.log(getSign())
```
