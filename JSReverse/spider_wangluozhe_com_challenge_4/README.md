![](https://i.loli.net/2021/08/07/JbP4zaS2TxU6Rkd.png)

> 关注微信公众号：K哥爬虫，持续分享爬虫进阶、JS/安卓逆向等技术干货！

## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 逆向目标

- 目标：网洛者反反爬虫练习平台第四题：JSFuck 加密
- 链接：http://spider.wangluozhe.com/challenge/4
- 简介：本题仍然是要求采集100页的全部数字，并计算所有数据加和，需要抠出源码进行计算，主要使用了 JSFuck 加密

![01.png](https://s2.loli.net/2021/12/13/DWul4LZ2qjBmwk6.png)

## JSFuck 简介

JSFuck、AAEncode、JJEncode 都是同一个作者，JSFuck 由日本的 Yosuke HASEGAWA 在 2010 创造，它可以将任意 JavaScript 编码为仅使用 6 个符号的混淆形式 `[]()!+`，2012 年，Martin Kleppe 在 GitHub 上创建了一个 jsfuck 项目和一个 JSFuck.com 网站，其中包含使用该编码器实现的 Web 应用程序。JSFuck 可用于绕过对网站上提交的恶意代码的检测，例如跨站点脚本（XSS）攻击。JSFuck 的另一个潜在用途在于代码混淆，目前的 jQuery 就已经有经过 JSFuck 混淆后的功能齐全的版本。

在线体验地址：https://utf-8.jp/public/jsfuck.html  http://www.jsfuck.com/

正常的一段 JS 代码：

```javascript
alert(1)
```

经过 JSFuck 混淆之后的代码类似于：

```javascript
[][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]][([][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]])[+!+[]+[+[]]]+([][[]]+[])[+!+[]]+(![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[+!+[]]+([][[]]+[])[+[]]+([][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]])[+!+[]+[+[]]]+(!![]+[])[+!+[]]]((!![]+[])[+!+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!+[]]+([][[]]+[])[+!+[]]+(+[![]]+[][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]])[+!+[]+[+!+[]]]+(!![]+[])[!+[]+!+[]+!+[]]+(+(!+[]+!+[]+!+[]+[+!+[]]))[(!![]+[])[+[]]+(!![]+[][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]])[+!+[]+[+[]]]+([]+[])[([][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]])[+!+[]+[+[]]]+([][[]]+[])[+!+[]]+(![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[+!+[]]+([][[]]+[])[+[]]+([][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]])[+!+[]+[+[]]]+(!![]+[])[+!+[]]][([][[]]+[])[+!+[]]+(![]+[])[+!+[]]+((+[])[([][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]])[+!+[]+[+[]]]+([][[]]+[])[+!+[]]+(![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[+!+[]]+([][[]]+[])[+[]]+([][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]])[+!+[]+[+[]]]+(!![]+[])[+!+[]]]+[])[+!+[]+[+!+[]]]+(!![]+[])[!+[]+!+[]+!+[]]]](!+[]+!+[]+!+[]+[!+[]+!+[]])+(![]+[])[+!+[]]+(![]+[])[!+[]+!+[]])()((![]+[])[+!+[]]+(![]+[])[!+[]+!+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]+(!![]+[])[+[]]+([][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]]+[])[+!+[]+[!+[]+!+[]+!+[]]]+[+!+[]]+([+[]]+![]+[][(![]+[])[+[]]+(![]+[])[!+[]+!+[]]+(![]+[])[+!+[]]+(!![]+[])[+[]]])[!+[]+!+[]+[+[]]])
```

JSFuck 中常见的元素、数字、符号转换如下表，更多元素可参考 [JSFuck 官方 GitHub](https://github.com/aemkei/jsfuck) 或 [JSFuck 维基百科](https://en.wikipedia.org/wiki/JSFuck)：

|   Value   |      JSFuck      |
| :-------: | :--------------: |
|   false   |      `![]`       |
|   true    | `!![]` or `!+[]` |
|    NaN    |      `+[![]]`      |
| undefined |      `[][[]]`      |
| Infinity | `+(+!+[]+(!+[]+[])[!+[]+!+[]+!+[]]+[+!+[]]+[+[]]+[+[]]+[+[]])` |
| Array | `[]` |
| Number | `+[]` |
| String | `[]+[]` |
| Boolean | `![]` |
| Function | `[]["filter"]` |
| eval | `[]["filter"]["constructor"]( CODE )()` |
| window | `[]["filter"]["constructor"]("return this")()` |
| + | `(+(+!+[]+(!+[]+[])[!+[]+!+[]+!+[]]+[+!+[]]+[+[]]+[+[]])+[])[!+[]+!+[]]` |
| . | `(+(+!+[]+[+!+[]]+(!![]+[])[!+[]+!+[]+!+[]]+[!+[]+!+[]]+[+[]])+[])[+!+[]]` |
| 0 | `+[]` |
| 1 | `+!![]` or `+!+[]` |
| 2 | `!![]+!![]` or `!+[]+!+[]` |
| 3 | `!![]+!![]+!![]` or `!+[]+!+[]+!+[]` |
|     a     |                      `(![]+[])[+!+[]]`                       |
| d | `([][[]]+[])[!+[]+!+[]]` |
| e | `(!![]+[])[!+[]+!+[]+!+[]]` |
| f | `(![]+[])[+[]]` |

我们以字母 a 为例，来演示一遍其混淆的流程：

1. `"false"[1]`：字母 a 取自字符串 false，在 false 中，a 的索引值是 1；
2. `(false+[])[1]`：false 可以写成  false+[]，即布尔常量 false 加上一个空数组；
3. `(![]+[])[1]`：false 又可以写成 ![]，即否定应用于空数组；
4. `(![]+[])[+true]`：1 是一个数字，我们可以把它写成 +true；
5. `(![]+[])[+!![]]`：由于 false 是 ![]，所以 true 就是 !![]，生成最终混淆代码。

## JSFuck 解混淆方法

JSFuck 在调用方法时通常都是通过 Function(xxx)() 和 eval(xxx) 的形式来执行，因此 JSFuck 常见解混淆的方式如下：

1. 使用在线工具直接解密，比如：https://lelinhtinh.github.io/de4js/ ；
2. 针对 Function 的情况，复制代码最外层倒数第二个括号内的内容，放到浏览器里面去直接执行就可以看到源码；
3. 针对 eval 的情况，复制代码最外层最后一个括号内的内容，放到浏览器里面去直接执行就可以看到源码；
3. 使用 Hook 的方式，分别 Hook Function 和 eval，打印输出源码；
3. 使用 AST 进行解混淆，AST 的教程 K 哥后续也会写，本文不详细介绍。

如前面 `alert(1)` 的混淆代码，复制最外层最后一个括号内的内容到浏览器，就可以看到源代码：

![02.png](https://s2.loli.net/2021/12/18/SRBmK5UHDVgCiAY.png)

## 逆向参数

逆向的目标主要是翻页接口 `_signature` 参数，调用的加密方法仍然是 `window.get_sign()`，和前面几题是一样的，本文不再赘述，不清楚的可以去看 K 哥上期的文章。

![03.png](https://s2.loli.net/2021/12/18/dX4TN69ALuykiGm.png)

继续跟进，会发现是一个 JSFuck 混淆：

![04.png](https://s2.loli.net/2021/12/18/qkIzSlBFTsHUgXO.png)

我们将这段代码复制出来，放到编辑器里面，这里以 PyCharm 为例，由于我们要选中匹配括号里的内容，所以我们可以设置一下 PyCharm 括号匹配高亮为红色，便于我们查找，依次点击 File - Settings - Editor - Color Scheme - General - Code - Matched brace，设置 Background 为显眼的颜色：

![05.png](https://s2.loli.net/2021/12/18/aVvPfnseiAYxElw.png)

此时我们选中最后一个括号，往上找，就可以非常明显地看到与之匹配的另一个括号，如下图所示：

![06.png](https://s2.loli.net/2021/12/18/4vQekgAJThKp5X2.png)

我们将括号里面的内容复制出来（可以包含括号，也可以不包含），放到浏览器控制台运行一下，就可以看到源码了：

![07.png](https://s2.loli.net/2021/12/18/KZeVaszDEnWcIoh.png)

除了这种方法以外，我们还可以使用 Hook 的方式，直接捕获源码然后打印输出，注意到这段混淆代码最后没有 `()` 括号，那就是 eval 的方式执行的，我们编写 Hook eval 代码如下：

```javascript
eval_ = eval;
eval = function (a){
    debugger;
    return eval_()
}


// 另外提供一个 Hook Function 的代码
// Function.prototype.constructor_ = Function.prototype.constructor;
// Function.prototype.constructor = function (a) {
//     debugger;
//     return Function.prototype.constructor_(a);
// };
```

刷新网页，直接断下，此时 a 的值就是源码：

![08.png](https://s2.loli.net/2021/12/18/2IrdQnCyYpzqR5h.png)

将源码复制下来，本地分析一下：

```javascript
(function () {
    let time_tmp = Date.now();
    let date = Date.parse(new Date());
    window = {};
    let click = window.document.onclick;
    let key_tmp;
    let iv_tmp;
    if (!click) {
        key_tmp = date * 1234;
    } else {
        key_tmp = date * 1244;
    }
    if (time_tmp - window.time < 1000) {
        iv_tmp = date * 4321;
    } else {
        iv_tmp = date * 4311;
    }
    const key = CryptoJS.enc.Utf8.parse(key_tmp);
    var iv = CryptoJS.enc.Utf8.parse(iv_tmp);
    (function tmp(date, key, iv) {
        function Encrypt(word) {
            let srcs = CryptoJS.enc.Utf8.parse(word);
            let encrypted = CryptoJS.AES.encrypt(srcs, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            return encrypted.ciphertext.toString().toUpperCase();
        }

        window.sign = Encrypt(date);
    })(date, key, iv);
})();
```

可以看到就是一个 AES 加密，这里主要注意有两个 if-else 语句，第一个判断是否存在 `window.document.onclick`，第二个是时间差的判断，我们可以在控制台去尝试取一下 `window.document.onclick` 和 `window.time`，看一下到底走的是 if 还是 else，在本地把这两个值也补全即可，实际上经过K哥测试 `window.document.onclick` 为 null，然后不管是走 if 还是 else 都是可以拿到结果的，所以对于本题来说，两个 window 对象都无所谓，直接去掉，`key_tmp` 和 `iv_tmp` 任意取值都可以。

自此本题分析完毕，本地改写之后，配合 Python 代码携带 _signature 挨个计算每一页的数据，最终提交成功：

![09.png](https://s2.loli.net/2021/12/18/T2cuM3FqsBQoa8Z.png)

## 完整代码

GitHub 关注 K 哥爬虫，持续分享爬虫相关代码！欢迎 star ！https://github.com/kgepachong/

**以下只演示部分关键代码，不能直接运行！** 完整代码仓库地址：https://github.com/kgepachong/crawler/

### JavaScript 加密代码

```javascript
/* ==================================
# @Time    : 2021-12-13
# @Author  : 微信公众号：K哥爬虫
# @FileName: challenge_4.js
# @Software: PyCharm
# ================================== */

var CryptoJS = require('crypto-js')

let date = Date.parse(new Date());
window = {};

let key_tmp = date * 1234;
// let key_tmp = date * 1244;
let iv_tmp = date * 4321;
// let iv_tmp = date * 4311;

const key = CryptoJS.enc.Utf8.parse(key_tmp);
var iv = CryptoJS.enc.Utf8.parse(iv_tmp);
(function tmp(date, key, iv) {
    function Encrypt(word) {
        let srcs = CryptoJS.enc.Utf8.parse(word);
        let encrypted = CryptoJS.AES.encrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.ciphertext.toString().toUpperCase();
    }

    window.sign = Encrypt(date);
})(date, key, iv);

function getSign() {
    return window.sign
}

// 测试输出
// console.log(getSign())
```

### Python 计算关键代码

```python
# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-12-13
# @Author  : 微信公众号：K哥爬虫
# @FileName: challenge_4.py
# @Software: PyCharm
# ==================================


import execjs
import requests


challenge_api = "http://spider.wangluozhe.com/challenge/api/4"
headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Cookie": "将 cookie 值改为你自己的！",
    "Host": "spider.wangluozhe.com",
    "Origin": "http://spider.wangluozhe.com",
    "Referer": "http://spider.wangluozhe.com/challenge/4",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest"
}


def get_signature():
    with open('challenge_4.js', 'r', encoding='utf-8') as f:
        ppdai_js = execjs.compile(f.read())
    signature = ppdai_js.call("getSign")
    print("signature: ", signature)
    return signature


def main():
    result = 0
    for page in range(1, 101):
        data = {
            "page": page,
            "count": 10,
            "_signature": get_signature()
        }
        response = requests.post(url=challenge_api, headers=headers, data=data).json()
        for d in response["data"]:
            result += d["value"]
    print("结果为: ", result)


if __name__ == '__main__':
    main()
```

