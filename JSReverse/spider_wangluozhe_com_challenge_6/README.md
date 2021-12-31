![](https://i.loli.net/2021/08/07/JbP4zaS2TxU6Rkd.png)

> 关注微信公众号：K哥爬虫，持续分享爬虫进阶、JS/安卓逆向等技术干货！

## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 逆向目标

- 目标：网洛者反反爬虫练习平台第六题：JS加密，环境模拟检测
- 链接：http://spider.wangluozhe.com/challenge/6
- 简介：同样是要求采集100页的全部数字，并计算所有数据加和。请注意！不要重复使用一个参数值，不要欺骗自己哦！

![01.png](https://s2.loli.net/2021/12/21/xPdpgkXaseClB9m.png)

## 抓包分析

通过抓包分析，可以发现本题不像前面几题一样 Payload 中参数有变化，而是在 Request Headers 里有个 hexin-v 的，每次请求都会变化，如果有朋友做过某花顺财经爬虫的话，会发现这个参数在某花顺的站点里也大量使用，如下图所示：

![02.png](https://s2.loli.net/2021/12/21/wxOlUG3nPJ7K4Zs.png)

![03.png](https://s2.loli.net/2021/12/21/tAF3epCI9HPE6KM.png)

## 查找加密

首先尝试直接搜索一下 hexin-v，只在 6.js 里有值，很明显这个 JS 是被混淆了的，无法定位，仔细观察一下，整个 6.js 为一个自执行函数（IIFE），传入的参数是7个数组，分别对应 n，t，r，e，a，u，c，如下所示：

```javascript
!function (n, t, r, e, a, u, c) {
}(
    [],[],[],[],[],[],[]
);
```

6.js 在调用值的时候都是通过元素下标取值的，所以这个混淆也很简单，如果你想去还原的话，直接写个脚本将数组对应的值进行替换即可，当然在本例中比较简单，不用解混淆。

因为 hexin-v 的值在 Request Headers 里，所以我们可以通过 Hook 的方式，捕获到设置 header 的 hexin-v 值时就 debugger 住（注入 Hook 代码的方法K哥以前的文章有详细讲解，本文不再赘述）：

```javascript
(function () {
    'use strict';
    var org = window.XMLHttpRequest.prototype.setRequestHeader;
    window.XMLHttpRequest.prototype.setRequestHeader = function (key, value) {
        if (key == 'hexin-v') {
            debugger;
        }
        return org.apply(this, arguments);
    };
})();
```

![04.png](https://s2.loli.net/2021/12/22/MXSKrGwkynJpECb.png)

接下来就是跟栈了，往上跟一个就可以在 6.js 里看到 h 的值就是我们想要的值，`h = ct.update()`，`ct.update()` 实际上又是 `x()`，如下图所示：

![05.png](https://s2.loli.net/2021/12/22/8steMfgDGNh1S64.png)

继续跟进 `x()`，t 是我们想要的值，`t = N()`：

![06.png](https://s2.loli.net/2021/12/22/mfFh2Zi5pedw4Ky.png)

继续跟进 `N()`，`et.encode(n)` 就是最终值，可以看到有一些类似鼠标移动、点击等函数：

![07.png](https://s2.loli.net/2021/12/22/Pit57O3FxVyBedc.png)

前面我们已经分析过，6.js 是个自执行方法，而且代码量也不是很多，所以我们这里直接定义一个全局变量，把这个 N 方法导出即可，就不再挨个方法扣了，伪代码如下：

```javascript
// 定义全局变量
var Hexin;

!function (n, t, r, e, a, u, c) {
    // 省略 N 多代码
    function N() {
        S[T]++,
        S[f] = ot.serverTimeNow(),
        S[l] = ot.timeNow(),
        S[k] = zn,
        S[I] = it.getMouseMove(),
        S[_] = it.getMouseClick(),
        S[y] = it.getMouseWhell(),
        S[E] = it.getKeyDown(),
        S[A] = it.getClickPos().x,
        S[C] = it.getClickPos().y;
        var n = S.toBuffer();
        return et.encode(n)
    }
    // 将 N 方法赋值给全局变量
    Hexin = N
}(
    [],[],[],[],[],[],[]
);

// 自定义函数获取最终的 hexin-v 值
function getHexinV(){
    return Hexin()
}
```

## 环境补齐

经过如上改写后，我们在本地调试一下，会发现 window、document 之类的未定义，我们先按照以前的方法，直接定义为空，后续还会报错 `getElementsByTagName is not a function`，我们知道 getElementsByTagName 获取指定标签名的对象，属于 HTML DOM 的内容，我们本地 node 执行肯定是没有这个环境的。

这里我们介绍一种能够直接在 Node.js 创建 DOM 环境的方法，使用的是 jsdom 这个库，官方是这么介绍的：

jsdom 是许多 Web 标准的纯 JavaScript 实现，特别是 WHATWG DOM 和 HTML 标准，用于 Node.js。一般来说，该项目的目标是模拟足够多的 Web 浏览器子集，以用于测试和抓取真实的 Web 应用程序。最新版本的 jsdom 需要 Node.js v12 或更新版本。（低于 v17 的 jsdom 版本仍然适用于以前的 Node.js 版本，但不受支持。）具体的用法可以参考 [jsdom 文档](https://www.npmjs.com/package/jsdom)。

需要注意的是，jsdom 也依赖 canvas，所以也需要另外安装 canvas 这个库，HTML canvas 标签用于通过脚本（通常是 JavaScript）动态绘制图形，具体介绍和用法可以参考 [canvas 文档](https://www.npmjs.com/package/canvas)。

我们在本地 JS 中添加以下代码后，就有了 DOM 环境，即可成功运行：

```javascript
// var canvas = require("canvas");
var jsdom = require("jsdom");
var {JSDOM} = jsdom;
var dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
window = dom.window;
document = window.document;
navigator = window.navigator;
```

配合 Python 代码，在请求头中，每次携带不同的 hexin-v，挨个计算每一页的数据，最终提交成功：

![08.png](https://s2.loli.net/2021/12/22/v1Z6G5EAfqa7iMB.png)

## 完整代码

GitHub 关注 K 哥爬虫，持续分享爬虫相关代码！欢迎 star ！https://github.com/kgepachong/

**以下只演示部分关键代码，不能直接运行！** 完整代码仓库地址：https://github.com/kgepachong/crawler/

### JavaScript 加密关键代码

```javascript
/* ==================================
# @Time    : 2021-12-20
# @Author  : 微信公众号：K哥爬虫
# @FileName: challenge_6.js
# @Software: PyCharm
# ================================== */


var TOKEN_SERVER_TIME = 1611313000.340;
var Hexin;
var jsdom = require("jsdom");
var {JSDOM} = jsdom;
var dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
window = dom.window;
document = window.document;
navigator = window.navigator;

!function(n, t, r, e, a, u, c) {
    !function() {
        function Gn() {}
        var Qn = [new a[23](n[20]), new e[3](f + l + d + p)];
        function Zn() {}
        var Jn = [new t[16](c[13]), new u[9](e[19])], qn = a[24][u[16]] || a[24].getElementsByTagName(st(r[19], r[20]))[a[25]], nt;
        !function(o) {}(nt || (nt = {}));
        var tt;
        !function(o) {}(tt || (tt = {}));
        var rt = function() {}(), et;
        RT = rt
        !function(o) {}(et || (et = {}));
        function at() {}
        var ot;
        !function(o) {}(ot || (ot = {}));
        var it;
        !function(o) {}(it || (it = {}));
        var ut;
        !function(s) {}(ut || (ut = {}));
        var ct;
        !function(o) {
            function x() {}
            function L() {}
            function M() {}
            o[a[105]] = M;
            
            function N() {
                S[T]++,
                S[f] = ot.serverTimeNow(),
                S[l] = ot.timeNow(),
                S[k] = zn,
                S[I] = it.getMouseMove(),
                S[_] = it.getMouseClick(),
                S[y] = it.getMouseWhell(),
                S[E] = it.getKeyDown(),
                S[A] = it.getClickPos().x,
                S[C] = it.getClickPos().y;
                var n = S.toBuffer();
                return et.encode(n)
            }
            Hexin = N
            o[r[81]] = x
        }(ct || (ct = {}));

        function st() {}
        var vt;
        !function(o) {}(vt || (vt = {}));
        var ft;
        !function(r) {}(ft || (ft = {}))
    }()
}(
    [],[],[],[],[],[],[]
);


function getHexinV(){
    return Hexin()
}

// 测试输出
// console.log(getHexinV())
```

### Python 计算关键代码

```python
# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-12-20
# @Author  : 微信公众号：K哥爬虫
# @FileName: challenge_6.py
# @Software: PyCharm
# ==================================


import execjs
import requests


challenge_api = "http://spider.wangluozhe.com/challenge/api/6"
headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Cookie": "cookie 换成你自己的！",
    "Host": "spider.wangluozhe.com",
    "Origin": "http://spider.wangluozhe.com",
    "Referer": "http://spider.wangluozhe.com/challenge/6",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest"
}


def get_hexin_v():
    with open('challenge_6.js', 'r', encoding='utf-8') as f:
        wlz_js = execjs.compile(f.read())
    hexin_v = wlz_js.call("getHexinV")
    print("hexin-v: ", hexin_v)
    return hexin_v


def main():
    result = 0
    for page in range(1, 101):
        data = {
            "page": page,
            "count": 10,
        }
        headers["hexin-v"] = get_hexin_v()
        response = requests.post(url=challenge_api, headers=headers, data=data).json()
        for d in response["data"]:
            result += d["value"]
    print("结果为: ", result)


if __name__ == '__main__':
    main()
```

