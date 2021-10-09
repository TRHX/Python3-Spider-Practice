## 【JS 逆向百例】webpack 改写实战，G 某游戏 RSA 加密

![](https://i.loli.net/2021/08/07/JbP4zaS2TxU6Rkd.png)

> 关注微信公众号：K哥爬虫，QQ交流群：808574309，持续分享爬虫进阶、JS/安卓逆向等技术干货！

## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 逆向目标

- 目标：G某游戏登录
- 主页：`aHR0cHM6Ly93d3cuZ205OS5jb20v`
- 接口：`aHR0cHM6Ly9wYXNzcG9ydC5nbTk5LmNvbS9sb2dpbi9sb2dpbjM=`
- 逆向参数：
    Query String Parameters：
    ```text
    password: kRtqfg41ogc8btwGlEw6nWLg8cHcCW6R8JaeM......
    ```

## 逆向过程

### 抓包分析

来到首页，随便输入一个账号密码，点击登陆，抓包定位到登录接口为 `aHR0cHM6Ly9wYXNzcG9ydC5nbTk5LmNvbS9sb2dpbi9sb2dpbjM=`，GET 请求，Query String Parameters 里，密码 password 被加密处理了。

![01.png](https://i.loli.net/2021/10/08/xH4FLN5f2Chq9e1.png)

### 加密入口

直接搜索关键字 password 会发现结果太多不好定位，使用 XHR 断点比较容易定位到加密入口，有关 XHR 断点调试可以查看 K 哥往期的教程：[【JS 逆向百例】XHR 断点调试，Steam 登录逆向](https://mp.weixin.qq.com/s/DPNtkF9e1pvFVa1m-DsyJw)，如下图所示，在 home.min.js 里可以看到关键语句 `a.encode(t.password, s)`，`t.password` 是明文密码，`s` 是时间戳。

![02.png](https://i.loli.net/2021/10/09/Dwoni5PhNRJxjBl.png)

跟进 `a.encode()` 函数，此函数仍然在 home.min.js 里，观察这部分代码，可以发现使用了 JSEncrypt，并且有 setPublicKey 设置公钥方法，由此可以看出应该是 RSA 加密，具体步骤是将明文密码和时间戳组合成用 | 组合，经过 RSA 加密后再进行 URL 编码得到最终结果，如下图所示：

![03.png](https://i.loli.net/2021/10/09/4y3rCeRxEFjWAXl.png)

RSA 加密找到了公钥，其实就可以直接使用 Python 的 Cryptodome 模块来实现加密过程了，代码如下所示：

```python
import time
import base64
from urllib import parse
from Cryptodome.PublicKey import RSA
from Cryptodome.Cipher import PKCS1_v1_5


password = "12345678"
timestamp = str(int(time.time() * 1000))
encrypted_object = timestamp + "|" + password
public_key = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDq04c6My441Gj0UFKgrqUhAUg+kQZeUeWSPlAU9fr4HBPDldAeqzx1UR92KJHuQh/zs1HOamE2dgX9z/2oXcJaqoRIA/FXysx+z2YlJkSk8XQLcQ8EBOkp//MZrixam7lCYpNOjadQBb2Ot0U/Ky+jF2p+Ie8gSZ7/u+Wnr5grywIDAQAB"
rsa_key = RSA.import_key(base64.b64decode(public_key))  # 导入读取到的公钥
cipher = PKCS1_v1_5.new(rsa_key)                        # 生成对象
encrypted_password = base64.b64encode(cipher.encrypt(encrypted_object.encode(encoding="utf-8")))
encrypted_password = parse.quote(encrypted_password)
print(encrypted_password)
```

即便是不使用 Python，我们同样可以自己引用 JSEncrypt 模块来实现这个加密过程（该模块使用方法可参考 [JSEncrypt GitHub](https://github.com/travist/jsencrypt)），如下所示：

```javascript
/*
引用 jsencrypt 加密模块，如果在 PyCharm 里直接使用 require 引用最新版 jsencrypt，
运行可能会提示 jsencrypt.js 里 window 未定义，直接在该文件定义 var window = this; 即可，
也可以使用和网站用的一样的 2.3.1 版本：https://npmcdn.com/jsencrypt@2.3.1/bin/jsencrypt.js
也可以将 jsencrypt.js 直接粘贴到此脚本中使用，如果提示未定义，直接在该脚本中定义即可。
*/

JSEncrypt = require("jsencrypt")

function getEncryptedPassword(t, e) {
    var jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey('MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDq04c6My441Gj0UFKgrqUhAUg+kQZeUeWSPlAU9fr4HBPDldAeqzx1UR92KJHuQh/zs1HOamE2dgX9z/2oXcJaqoRIA/FXysx+z2YlJkSk8XQLcQ8EBOkp//MZrixam7lCYpNOjadQBb2Ot0U/Ky+jF2p+Ie8gSZ7/u+Wnr5grywIDAQAB');
    var i = e ? e + "|" + t : t;
    return encodeURIComponent(jsEncrypt.encrypt(i));
}

var password = "12345678";
var timestamp = (new Date).getTime();
console.log(getEncryptedPassword(password, timestamp));
```

### webpack 改写

本文的标题是 webpack 改写实战，所以很显然本文的目的是为了练习 JavaScript 模块化编程 webpack 代码的改写，现在大多数站点都使用了这种写法，然而并不是所有站点都像本文遇到的站点一样，可以很容易使用其他方法来实现的，往往大多数站点需要你自己扒下他的源码来还原加密过程，有关 JavaScript 模块化编程，即 webpack，在 K 哥往期的文章中有过详细的介绍：xxxxxxxxx

一个标准的 webpack 整体是一个 IIFE 立即调用函数表达式，其中有一个模块加载器，也就是调用模块的函数，该函数中一般具有 `function.call()` 或者 `function.apply()` 方法，IIFE 传递的参数是一个列表或者字典，里面是一些需要调用的模块，写法类似于：

```javascript
!function (allModule) {
    function useModule(whichModule) {
        allModule[whichModule].call(null, "hello world!");
    }
}([
    function module0(param) {console.log("module0: " + param)},
    function module1(param) {console.log("module1: " + param)},
    function module2(param) {console.log("module2: " + param)},
]);
```

观察这次站点的加密代码，会发现所有加密方法都在 home.min.js 里面，在此文件开头可以看到整个是一个 IIFE 立即调用函数表达式，`function e` 里面有关键方法 `.call()`，由此可以判断该函数为模块加载器，后面传递的参数是一个字典，里面是一个个的对象方法，也就是需要调用的模块函数，这就是一个典型的 webpack 写法，如下图所示：

![04.png](https://i.loli.net/2021/10/09/RYaDy2N7gTofFQe.png)

接下来我们通过 4 步完成对 webpack 代码的改写，将原始代码扒下来实现加密的过程。

#### 1、找到 IIFE

IIFE 立即调用函数表达式，也称为立即执行函数，自执行函数，将源码中的 IIFE 框架抠出来，后续将有用的代码再往里面放：

```javascript
!function (t) {
    
}({
    
})
```

#### 2、找到模块加载器

前面我们已经讲过，带有 `function.call()` 或者 `function.apply()` 方法的就是模块加载器，也就是调用模块的方法，在本例中，`function e` 就是模块加载器，将其抠下来即可，其他多余的代码可以直接删除，注意里面用到了 `i`，所以定义 `i` 的语句也要抠下来：

```javascript
!function (t) {
    function e(s) {
        if (i[s])
            return i[s].exports;
        var n = i[s] = {
            exports: {},
            id: s,
            loaded: !1
        };
        return t[s].call(n.exports, n, n.exports, e),
            n.loaded = !0,
            n.exports
    }
    var i = {};
}({
    
})
```

#### 3、找到调用的模块

重新来到加密的地方，第一个模块是 3，`n` 里面的 `encode` 方法最终返回的就是加密后的结果，如下图所示：

![05.png](https://i.loli.net/2021/10/09/7v4hztVGX2Hrga8.png)

第二个模块是 4，可以看到模块 3 里面的 `this.jsencrypt.encrypt(i)` 方法实际上是调用的第 3340 行的方法，该方法在模块 4 里面，这里定位在模块 4 的方法，可以在浏览器开发者工具 source 页面，将鼠标光标放到该函数前面，一直往上滑动，直到模块开头，也可以使用 VS Code 等编辑器，将整个 home.min.js 代码粘贴过去，然后选择折叠所有代码，再搜索这个函数，即可快速定位在哪个模块。

![06.png](https://i.loli.net/2021/10/09/sqBTKxgHSnzcN4V.png)

确定使用了 3 和 4 模块后，将这两个模块的所有代码扣下来即可，大致代码架构如下（模块 4 具体的代码太长，已删除）：

```javascript
!function (t) {
    function e(s) {
        if (i[s])
            return i[s].exports;
        var n = i[s] = {
            exports: {},
            id: s,
            loaded: !1
        };
        return t[s].call(n.exports, n, n.exports, e),
            n.loaded = !0,
            n.exports
    }
    var i = {};
}(
    {
        4: function (t, e, i) {},
        3: function (t, e, i) {
            var s;
            s = function (t, e, s) {
                function n() {
                    "undefined" != typeof r && (this.jsencrypt = new r.JSEncrypt,
                        this.jsencrypt.setPublicKey("-----BEGIN PUBLIC KEY-----略-----END PUBLIC KEY-----"))
                }

                var r = i(4);
                n.prototype.encode = function (t, e) {
                    var i = e ? e + "|" + t : t;
                    return encodeURIComponent(this.jsencrypt.encrypt(i))
                },
                    s.exports = n
            }.call(e, i, e, t),
                !(void 0 !== s && (t.exports = s))
        }
    }
)
```

这里需要我们理解一个地方，那就是模块 3 的代码里有一行 `var r = i(4);`，这里的 `i` 是 `3: function (t, e, i) {}`，传递过来的 `i`，而模块 3 又是由模块加载器调用的，即 `.call(n.exports, n, n.exports, e)` 里面的某个参数就是 `i`，观察代码，`i` 是一个函数，`.call(n.exports, n, n.exports, e)` 里面只有 `e` 是函数，所以 `var r = i(4);` 实际上就是模块加载器 `function e` 调用了模块 4，由于这里模块 4 是个对象，所以这里最好写成 `var r = i("4");`，这里是数字，所以可以成功运行，如果模块 4 名字变成 func4 或者其他名字，那么调用时就必须要加引号了。

#### 4、导出加密函数

目前关键的加密代码已经剥离完毕了，最后一步就是需要把加密函数导出来供我们调用了，首先定义一个全局变量，如 eFunc，然后在模块加载器后面使用语句 `eFunc = e`，把模块加载器导出来：

```javascript
var eFunc;

!function (t) {
    function e(s) {
        if (i[s])
            return i[s].exports;
        var n = i[s] = {
            exports: {},
            id: s,
            loaded: !1
        };
        return t[s].call(n.exports, n, n.exports, e),
            n.loaded = !0,
            n.exports
    }
    var i = {};
    eFunc = e
}(
    {
        4: function (t, e, i) {},
        3: function (t, e, i) {}
    }
)
```

然后定义一个函数，传入明文密码，返回加密后的密码：

```javascript
function getEncryptedPassword(password) {
    var timestamp = (new Date).getTime();
    var encryptFunc = eFunc("3");
    var encrypt = new encryptFunc;
    return encrypt.encode(password, timestamp)
}
```

其中 timestamp 为时间戳，因为我们最终需要调用的是模块 3 里面的 `n.prototype.encode` 这个方法，所以首先调用模块 3，返回的是模块 3 里面的 n 函数（可以在浏览器运行代码，一步一步查看结果），然后将其 new 出来，调用 n 的 encode 方法，返回加密后的结果。

自此，webpack 的加密代码就剥离完毕了，最后调试会发现 navigator 和 window 未定义，定义一下即可：

```javascript
var navigator = {};
var window = global;
```

这里扩展一下，在浏览器里面 window 其实就是 global，在 nodejs 里没有 window，但是有个 global，与浏览器的 window 对象类型相似，是全局可访问的对象，因此在 nodejs 环境中可以将 window 定义为 global，如果定义为空，可能会引起其他错误。

## 完整代码

GitHub 关注 K 哥爬虫，持续分享爬虫相关代码！欢迎 star ！https://github.com/kgepachong/

**以下只演示部分关键代码，不能直接运行！**完整代码仓库地址：https://github.com/kgepachong/crawler/

### JavaScript 加密关键代码架构

方法一：webpack 改写源码实现 RSA 加密：

```javascript
var navigator = {};
var window = global;
var eFunc;

!function (t) {
    function e(s) {
        if (i[s])
            return i[s].exports;
        var n = i[s] = {
            exports: {},
            id: s,
            loaded: !1
        };
        return t[s].call(n.exports, n, n.exports, e),
            n.loaded = !0,
            n.exports
    }

    var i = {};
    eFunc = e;
}(
    {
        4: function (t, e, i) {},
        3: function (t, e, i) {}
    }
)

function getEncryptedPassword(password) {
    var timestamp = (new Date).getTime();
    var encryptFunc = eFunc("3");
    var encrypt = new encryptFunc;
    return encrypt.encode(password, timestamp)
}

// 测试样例
// console.log(getEncryptedPassword("12345678"))
```

方法二：直接使用 JSEncrypt 模块实现 RSA 加密：

```javascript
/*
引用 jsencrypt 加密模块，此脚适合在 nodejs 环境下运行。
1、使用 require 语句引用，前提是使用 npm 安装过；
2、将 jsencrypt.js 直接粘贴到此脚本中使用，同时要将结尾 exports.JSEncrypt = JSEncrypt; 改为 je = JSEncrypt 导出方法。
PS：需要定义 var navigator = {}; var window = global;，否则提示未定义。
*/

// ========================= 1、require 方式引用 =========================
// var je = require("jsencrypt")

// =================== 2、直接将 jsencrypt.js 复制过来 ===================
/*! JSEncrypt v2.3.1 | https://npmcdn.com/jsencrypt@2.3.1/LICENSE.txt */
var navigator = {};
var window = global;

// 这里是 jsencrypt.js 代码

function getEncryptedPassword(t) {
    var jsEncrypt = new je();
    jsEncrypt.setPublicKey('MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDq04c6My441Gj0UFKgrqUhAUg+kQZeUeWSPlAU9fr4HBPDldAeqzx1UR92KJHuQh/zs1HOamE2dgX9z/2oXcJaqoRIA/FXysx+z2YlJkSk8XQLcQ8EBOkp//MZrixam7lCYpNOjadQBb2Ot0U/Ky+jF2p+Ie8gSZ7/u+Wnr5grywIDAQAB');
    var e = (new Date).getTime();
    var i = e ? e + "|" + t : t;
    return encodeURIComponent(jsEncrypt.encrypt(i));
}

// 测试样例
// console.log(getEncryptedPassword("12345678"));
```

### Python 登录关键代码

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-


import re
import json
import time
import random
import base64
from urllib import parse

import execjs
import requests
from PIL import Image
from Cryptodome.PublicKey import RSA
from Cryptodome.Cipher import PKCS1_v1_5

login_url = '脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler'
verify_image_url = '脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler'
check_code_url = '脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler'

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
session = requests.session()


def get_jquery():
    jsonp = ''
    for _ in range(21):
        jsonp += str(random.randint(0, 9))
    jquery = 'jQuery' + jsonp + '_'
    return jquery


def get_dict_from_jquery(text):
    result = re.findall(r'\((.*?)\)', text)[0]
    return json.loads(result)


def get_encrypted_password_by_javascript(password):
    # 两个 JavaScript 脚本，两种方法均可
    with open('gm99_encrypt.js', 'r', encoding='utf-8') as f:
    # with open('gm99_encrypt_2.js', 'r', encoding='utf-8') as f:
        exec_js = f.read()
    encrypted_password = execjs.compile(exec_js).call('getEncryptedPassword', password)
    return encrypted_password


def get_encrypted_password_by_python(password):
    timestamp = str(int(time.time() * 1000))
    encrypted_object = timestamp + "|" + password
    public_key = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
    rsa_key = RSA.import_key(base64.b64decode(public_key))  # 导入读取到的公钥
    cipher = PKCS1_v1_5.new(rsa_key)                        # 生成对象
    encrypted_password = base64.b64encode(cipher.encrypt(encrypted_object.encode(encoding="utf-8")))
    encrypted_password = parse.quote(encrypted_password)
    return encrypted_password


def get_verify_code():
    response = session.get(url=verify_image_url, headers=headers)
    with open('code.png', 'wb') as f:
        f.write(response.content)
    image = Image.open('code.png')
    image.show()
    code = input('请输入图片验证码: ')
    return code


def check_code(code):
    timestamp = str(int(time.time() * 1000))
    params = {
        'callback': get_jquery() + timestamp,
        'ckcode': code,
        '_': timestamp,
    }
    response = session.get(url=check_code_url, params=params, headers=headers)
    result = get_dict_from_jquery(response.text)
    if result['result'] == 1:
        pass
    else:
        raise Exception('验证码输入错误！')


def login(username, encrypted_password, code):
    timestamp = str(int(time.time() * 1000))
    params = {
        'callback': get_jquery() + timestamp,
        'encrypt': 1,
        'uname': username,
        'password': encrypted_password,
        'remember': 'checked',
        'ckcode': code,
        '_': timestamp
    }
    response = session.get(url=login_url, params=params, headers=headers)
    result = get_dict_from_jquery(response.text)
    print(result)


def main():
    # 测试账号：15434947408，密码：iXqC@aJt8fi@VwV
    username = input('请输入登录账号: ')
    password = input('请输入登录密码: ')

    # 获取加密后的密码，使用 Python 或者 JavaScript 实现均可
    encrypted_password = get_encrypted_password_by_javascript(password)
    # encrypted_password = get_encrypted_password_by_python(password)

    # 获取验证码
    code = get_verify_code()

    # 校验验证码
    check_code(code)

    # 登录
    login(username, encrypted_password, code)


if __name__ == '__main__':
    main()
```
