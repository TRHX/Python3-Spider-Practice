![](https://i.loli.net/2021/08/07/JbP4zaS2TxU6Rkd.png)

> 关注微信公众号：K哥爬虫，持续分享爬虫进阶、JS/安卓逆向等技术干货！


## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 逆向目标

- 目标：社会主义核心价值观加密原理分析
- 主页：`aHR0cHM6Ly93d3cuYXBwbWl1LmNvbS9rZXkv`

## 逆向分析

K哥的同事今天发来一个比较有趣的加密，不管你输入什么字符串，加密后的结果都是由 24 个字的社会主义核心价值观随机组合而成，如下图所示：

![01.png](https://i.loli.net/2021/11/24/KB28cI1S3pZOuyF.png)

首先我们尝试抓包，看看是否有网络上的发包操作，实际上是没有的，这说明加密解密的逻辑都在已加载完毕的 JavaScript 代码里，这里有两个方法去定位加密入口：

1、我们注意到加密结果始终由社会主义核心价值观组成，肯定是在原 24 字的基础上做了一些操作，也就是说在某个地方肯定定义了这 24 个字，我们任意全局搜索其中一个词即可，如下图所示：

![02.png](https://i.loli.net/2021/11/24/DBCAV5EN4KJWk1u.png)

2、加密解密的结果都是点击了按钮才生成的，那么这个按钮肯定绑定了某些事件，比如鼠标点击事件，我们可以通过 DOM 事件断点的方式定位加密入口，如下图所示：

![03.png](https://i.loli.net/2021/11/24/TLl8pCPx6n1udFk.png)

3、我们注意到加密解密的 button 都有一个 id，那么有可能 JavaScript 里会获取到这个 id 后，使用 `addEventListener()` 方法向这个元素添加鼠标点击事件句柄，所以也可以全局搜索其 id，即 encode-btn 和 decode-btn，也可以搜索 `getElementById("encode-btn")` 或者 `getElementById("decode-btn")`，当然也可以搜索方法关键字 addEventListener。如下图所示：

![04.png](https://i.loli.net/2021/11/24/xlWsjv1hokcdLZO.png)

定位到加密位置后，埋下断点进行调试，我们来看看加密的逻辑：

![06.png](https://i.loli.net/2021/11/24/E7GwyLSRjIdNJcT.png)

加密过程：变量 v 通过元素 id（decoded-area）拿到明文文本区域（textarea），点击加密按钮（encode-btn）会触发事件，进入后面的函数，`v.value` 就是明文值，经过 `l()` 函数加密后赋值给 n，然后再把 n 赋值给 `p.value`，也就是显示在密文的文本区域（encoded-area）。

解密过程：变量 p 通过元素 id（encoded-area）拿到密文文本区域（textarea），点击解密按钮（decode-btn）会触发事件，进入后面的函数，`p.value` 就是密文值，经过 `s()` 函数解密后赋值给 n，然后再把 n 赋值给 `v.value`，也就是显示在明文的文本区域（decoded-area）。

整个代码逻辑比较简单，用到的这些函数也都在一起，直接全部 copy 下来即可。

## 完整代码

GitHub 关注 K 哥爬虫，持续分享爬虫相关代码！欢迎 star ！https://github.com/kgepachong/

### JavaScript 加密解密代码

```javascript
var e = function () {
    for (var t = arguments.length, n = Array(t), r = 0; r < t; r++)
        n[r] = arguments[r];
    var e = n.length
        , i = "string" == typeof n[e - 1] ? n[e - 1] : "Assert Error"
        , o = !0
        , u = !1
        , c = void 0;
    try {
        for (var f, a = n[Symbol.iterator](); !(o = (f = a.next()).done); o = !0) {
            if (!f.value)
                throw new Error(i)
        }
    } catch (t) {
        u = !0,
            c = t
    } finally {
        try {
            !o && a.return && a.return()
        } finally {
            if (u)
                throw c
        }
    }
}
    , i = function () {
    return Math.random() >= .5
}
    , o = function (t) {
    var n = /[A-Za-z0-9\-\_\.\!\~\*\'\(\)]/g
        , r = t.replace(n, function (t) {
        return t.codePointAt(0).toString(16)
    });
    return encodeURIComponent(r).replace(/%/g, "").toUpperCase()
}
    , u = function (t) {
    e("string" == typeof t, "utfs Error");
    var n = t.length;
    e(0 == (1 & n));
    for (var r = [], i = 0; i < n; i++)
        0 == (1 & i) && r.push("%"),
            r.push(t[i]);
    return decodeURIComponent(r.join(""))
}
    , c = function (t) {
    e("string" == typeof t);
    var n = []
        , r = !0
        , o = !1
        , u = void 0;
    try {
        for (var c, f = t[Symbol.iterator](); !(r = (c = f.next()).done); r = !0) {
            var a = c.value
                , s = Number.parseInt(a, 16);
            s < 10 ? n.push(s) : i() ? (n.push(10),
                n.push(s - 10)) : (n.push(11),
                n.push(s - 6))
        }
    } catch (t) {
        o = !0,
            u = t
    } finally {
        try {
            !r && f.return && f.return()
        } finally {
            if (o)
                throw u
        }
    }
    return n
}
    , f = function (t) {
    e(t instanceof Array);
    for (var n = [], r = t.length, i = 0; i < r;)
        t[i] < 10 ? n.push(t[i]) : 10 === t[i] ? (i++,
            n.push(t[i] + 10)) : (i++,
            n.push(t[i] + 6)),
            i++;
    return n.map(function (t) {
        return t.toString(16).toUpperCase()
    }).join("")
}
    , a = function (t) {
    return t.map(function (t) {
        return h[2 * t] + h[2 * t + 1]
    }).join("")
}
    , s = function (t) {
    var n = []
        , r = !0
        , i = !1
        , o = void 0;
    try {
        for (var c, a = t[Symbol.iterator](); !(r = (c = a.next()).done); r = !0) {
            var s = c.value
                , l = h.indexOf(s);
            -1 !== l && (1 & l || n.push(l >> 1))
        }
    } catch (t) {
        i = !0,
            o = t
    } finally {
        try {
            !r && a.return && a.return()
        } finally {
            if (i)
                throw o
        }
    }
    var v = f(n);
    e(0 == (1 & v.length));
    var p = void 0;
    try {
        p = u(v)
    } catch (t) {
        throw t
    }
    return p
}
    , h = "富强民主文明和谐自由平等公正法治爱国敬业诚信友善"

function encrypt(t) {
    return a(c(o(t)))
}

function decrypt(t) {
    return s(t)
}

// 测试样例
// console.log(encrypt("1234"))
// console.log(decrypt("和谐民主和谐文明和谐和谐和谐自由"))
```

