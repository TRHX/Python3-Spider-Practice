![](https://i.loli.net/2021/08/07/JbP4zaS2TxU6Rkd.png)

> 关注微信公众号：K哥爬虫，持续分享爬虫进阶、JS/安卓逆向等技术干货！

## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 逆向目标

- 目标：W 店登录接口 UA 参数加密，JS 代码经过了 OB 混淆
- 主页：`aHR0cHM6Ly9kLndlaWRpYW4uY29tLw==`
- 接口：`aHR0cHM6Ly9zc28xLndlaWRpYW4uY29tL3VzZXIvbG9naW4=`
- 逆向参数：Form Data：`ua: H4sIAAAAAAAAA91ViZUbMQhtiVOIcnRRxRafr%2FGuN5ukgoyfLUZC...`

## OB 混淆简介

OB 混淆全称 Obfuscator，Obfuscator 其实就是混淆的意思，官网：https://obfuscator.io/ ，其作者是一位叫 Timofey Kachalov 的俄罗斯 JavaScript 开发工程师，早在 2016 年就发布了第一个版本。

一段正常的代码如下：

```javascript
function hi() {
  console.log("Hello World!");
}
hi();
```

经过 OB 混淆后的结果：

```javascript
function _0x3f26() {
    var _0x2dad75 = ['5881925kTCKCP', 'Hello\x20World!', '600mDvfGa', '699564jYNxbu', '1083271cEvuvT', 'log', '18sKjcFY', '214857eMgFSU', '77856FUKcuE', '736425OzpdFI', '737172JqcGMg'];
    _0x3f26 = function () {
        return _0x2dad75;
    };
    return _0x3f26();
}

(function (_0x307c88, _0x4f8223) {
    var _0x32807d = _0x1fe9, _0x330c58 = _0x307c88();
    while (!![]) {
        try {
            var _0x5d6354 = parseInt(_0x32807d(0x6f)) / 0x1 + parseInt(_0x32807d(0x6e)) / 0x2 + parseInt(_0x32807d(0x70)) / 0x3 + -parseInt(_0x32807d(0x69)) / 0x4 + parseInt(_0x32807d(0x71)) / 0x5 + parseInt(_0x32807d(0x6c)) / 0x6 * (parseInt(_0x32807d(0x6a)) / 0x7) + -parseInt(_0x32807d(0x73)) / 0x8 * (parseInt(_0x32807d(0x6d)) / 0x9);
            if (_0x5d6354 === _0x4f8223) break; else _0x330c58['push'](_0x330c58['shift']());
        } catch (_0x3f18e4) {
            _0x330c58['push'](_0x330c58['shift']());
        }
    }
}(_0x3f26, 0xaa023));

function _0x1fe9(_0xa907e7, _0x410a46) {
    var _0x3f261f = _0x3f26();
    return _0x1fe9 = function (_0x1fe950, _0x5a08da) {
        _0x1fe950 = _0x1fe950 - 0x69;
        var _0x82a06 = _0x3f261f[_0x1fe950];
        return _0x82a06;
    }, _0x1fe9(_0xa907e7, _0x410a46);
}

function hi() {
    var _0x12a222 = _0x1fe9;
    console[_0x12a222(0x6b)](_0x12a222(0x72));
}

hi();
```

OB 混淆具有以下特征：

1、一般由一个大数组或者含有大数组的函数、一个自执行函数、解密函数和加密后的函数四部分组成；

2、函数名和变量名通常以 `_0x` 或者 `0x` 开头，后接 1~6 位数字或字母组合；

3、自执行函数，进行移位操作，有明显的 push、shift 关键字；

例如在上面的例子中，`_0x3f26()` 方法就定义了一个大数组，自执行函数里有 push、shift 关键字，主要是对大数组进行移位操作，`_0x1fe9()` 就是解密函数，`hi()` 就是加密后的函数。

## 抓包分析

点击登陆抓包，可以看到有个 ua 参数，经过了加密，每次登陆是会改变的，如下图所示：

![01.png](https://i.loli.net/2021/11/18/WJlSbMo1259cLPi.png)

如果直接搜索 ua 的话，结果太多，不方便筛选，通过 XHR 断点比较容易找到加密的位置，如下图所示，最后提交的 r 参数包含 ua 值，往上找可以看到是 i 的值经过了 URL 编码，再往上看，i 的值通过 `window.getUa()` 获取，这个实际上是 uad.js 里面的一个匿名函数。

![02.png](https://i.loli.net/2021/11/18/TnrwZA3WOyj8oKz.png)

跟进到 uad.js，可以看到调用了 `window[_0x4651('0x710')]` 这个方法，最后返回的 `_0x261229` 就是加密后的 ua 值，用鼠标把类似 `_0x4651('0x710')`、`_0x4651('0x440')` 的值选中，可以看到实际上是一些字符串，这些字符串通过直接搜索，可以发现是在头部的一个大数组里，如下图所示：

![03.png](https://i.loli.net/2021/11/18/3duByXziQqpeOoM.png)

![04.png](https://i.loli.net/2021/11/18/fu2Dt1SyIR5kZoB.png)

## 混淆还原与替换

一个大数组，一个有明显的 push、shift 关键字的进行移位操作的自执行函数，是 OB 混淆无疑了，那么我们应该怎样去处理，让其看起来更顺眼一些呢？

你可以手动在浏览器选中查看值，在本地去替换，当然不用全部去替换，跟栈走，用到的地方替换就行了，不要傻傻的全部去挨个手动替换，这种方法适用于不太复杂的代码。

如果遇到代码很多的情况，建议使用反混淆工具去处理，这里推荐国内的[猿人学OB混淆专解工具](http://tool.yuanrenxue.com/decode_obfuscator)和国外的 [de4js](https://lelinhtinh.github.io/de4js/)，猿人学的工具还原程度很高，但是部分 OB 混淆还原后运行会报错，实测本案例的 OB 混淆经过猿人学的工具处理后就不能正常运行，可能需要自己预先处理一下才行，de4js 这个工具是越南的一个作者开发的，开源的，你可以部署到自己的机器上，它支持多种混淆还原，包括 Eval、OB、JSFuck、AA、JJ 等，可以直接粘贴代码，自动识别混淆方式，本案例推荐使用 de4js，如下图所示：

![05.png](https://i.loli.net/2021/11/19/zpQrx4EhwNl16St.png)

我们将还原后的结果复制到本地文件，使用 Fiddler 的 Autoresponder 功能对响应进行替换，如下图所示：

![06.png](https://i.loli.net/2021/11/19/5wxQcH2ba9CgIR7.png)

如果此时开启抓包，刷新页面，你会发现请求状态 status 显示的是 CORS error，JS 替换不成功，在控制台里还可以看到报错 `No 'Access-Control-Allow-Origin' header is present on the requested resource.` 如下图所示：

![14.png](https://i.loli.net/2021/11/23/aj6gyBIdnMYv21s.png)

## CORS 跨域错误

CORS （Cross-Origin Resource Sharing，跨域资源共享）是一个 W3C 标准，该标准使用附加的 HTTP 头来告诉浏览器，允许运行在一个源上的 Web 应用访问位于另一不同源的资源。一个请求 URL 的协议、域名、端口三者之间任意与当前页面地址不同即为跨域。常见的跨域问题就是浏览器提示在 A 域名下不可以访问 B 域名的 API，有关 CORS 的进一步理解，可以参考 [W3C CORS Enabled](https://www.w3.org/wiki/CORS_Enabled)。

简要流程如下：

1、消费者发送一个 Origin 报头到提供者端：Origin: http://www.site.com；
2、提供者发送一个 `Access-Control-Allow-Origin` 响应报头给消费者，如果值为 `*` 或 Origin 对应的站点，则表示允许共享资源给消费者，如果值为 null 或者不存在，则表示不允许共享资源给消费者；
3、除了 `Access-Control-Allow-Origin` 以外，部分站点还有可能检测 `Access-Control-Allow-Credentials`，为 true 表示允许；
4、浏览器根据提供者的响应报文判断是否允许消费者跨域访问到提供者源；

我们根据前面在控制台的报错信息，可以知道是响应头缺少 `Access-Control-Allow-Origin` 导致的，在 Fiddler 里面有两种方法为响应头添加此参数，下面分别介绍一下：

第一种是利用 Fiddler 的 Filter 功能，在 Response Headers 里设置即可，分别填入 Access-Control-Allow-Origin 和允许的域名，如下图所示：

![15.png](https://i.loli.net/2021/11/23/nlA296QxH8u4hIk.png)

第二种是修改 CustomRules.js 文件，依次选择 Rules —> Customize Rules，在 `static function OnBeforeResponse(oSession: Session)` 模块下增加以下代码：

```javascript
if(oSession.uriContains("要处理的 URL")){
    oSession.oResponse["Access-Control-Allow-Origin"] =  "允许的域名";
}
```

![16.png](https://i.loli.net/2021/11/24/vEUSsbVaAOcl4rj.png)

两种方法二选一，设置完毕后，就可以成功替换了，刷新再次调试就可以看到是还原后的 JS 了，如下图所示：

![07.png](https://i.loli.net/2021/11/19/MXiPtpRCdS81ThB.png)

## 逆向分析

很明显 `window.getUa` 是主要的加密函数，所以我们先来分析一下这个函数：

```javascript
window.getUa = function() {
    var _0x7dfc34 = new Date().getTime();
    if (_0x4a9622) {
        _0x2644f4();
    }
    _0x55b608();
    var _0x261229 = _0x1722c3(_0x2e98dd) + '|' + _0x1722c3(_0x420004) + '|' + _0x7dfc34.toString(0x10);
    _0x261229 = btoa(_0x570bef.gzip(_0x261229, {
        'to': 'string'
    }));
    return _0x261229;
};
```

`_0x7dfc34` 是时间戳，接着一个 if 判断，我们可以鼠标放到判断里去看看，发现判断的 `_0x4a9622` 是 false，那么 `_0x2644f4()` 就不会被执行，然后执行了 `_0x55b608()` 方法，`_0x261229` 的值，主要调用了 `_0x1722c3()` 方法得到的，前后依次传入了 `_0x2e98dd` 和 `_0x420004`，很明显这两个值比较关键，分别搜索一下，可以发现：

`_0x2e98dd` 定义了一些 header、浏览器的信息、屏幕信息、系统字体信息等，这些信息可以作为定值直接传入，如下图所示：

![09.png](https://i.loli.net/2021/11/23/mfqpv5lSxE36jiO.png)

![10.png](https://i.loli.net/2021/11/23/pnJS74xZAIlq5ht.png)

 `_0x420004` 搜索有用的结果就是仅定义了一个空对象，在控制台输出一下可以看到实际上包含了一些键盘、鼠标点击移动的数据，实际上经过测试发现， `_0x420004` 的值并不是强校验的，可以使用随机数模拟生成，也可以直接复制一个定值。

![11.png](https://i.loli.net/2021/11/23/fQ7XPZFHLlaybEI.png)

`_0x2e98dd` 和 `_0x420004` 这两个参数都没有进行强校验，完全可以以定值的方式传入，这两个值都是 JSON 格式，我们可以直接在控制台使用 `copy` 语句复制其值，或者使用 `JSON.stringify()` 语句输出结果再手动复制。

![12.png](https://i.loli.net/2021/11/23/nz9fp3dyb5Rtkai.png)

## 本地联调

里面各个函数相互调用，比较多，可以直接把整个 JS copy 下来，我们注意到整个函数是一个自执行函数，在本地调用时，我们可以定义一个全局变量，然后在 `window.getUa` 函数里，将 `_0x261229` 的值赋值给全局变量，也就相当于导出值，最后取这个全局变量即可，还有一种方法就是不让它自执行，改写成正常一般的函数，然后调用 `window.getUa` 方法得到 ua 值。

首先我们把 `_0x2e98dd` 和 `_0x420004` 的值在本地定义一下，这里有个小细节，需要把原 JS 代码里这两个值定义的地方注释掉，防止起冲突。

在本地调试时，会提示 `window`、`location`、`document` 未定义，定义一下为空对象即可，然后又提示 `attachEvent` 未定义，搜索一下，是 `_0x13cd5a` 的一个原型对象，除了 `attachEvent` 以外，还有个 `addEventListener`，`addEventListener()` 方法用于向指定元素添加事件句柄，在 IE 中使用 `attachEvent()` 方法来实现，我们在 Google Chrome 里面埋下断点调试一下，刷新页面会直接进入 `addEventListener()` 方法，其中的事件是 `keydown`，即键盘按下，就调用后面的 `_0x5cec90` 方法，输出一下后面返回的 this，实际上并没有产生什么有用的值，所以 `_0x13cd5a.prototype.bind` 方法我们可以直接将其注释掉，实际测试也没有影响。

![08.png](https://i.loli.net/2021/11/23/P9e5CYKFkyu4VSR.png)

接着本地调试，又会提示 `btoa` 未定义，`btoa` 和 `atob` 是 window 对象的两个函数，其中 `btoa` 是 binary to ascii，用于将 binary 的数据用 ascii 码表示，即 Base64 的编码过程，而 `atob` 则是 ascii to binary，用于将 ascii 码解析成 binary 数据，即 Base64 的解码过程。

在 NodeJS 里，提供了一个称为 `Buffer` 的本地模块，可用于执行 Base64 编码和解码，这里不做详细介绍，可自行百度，`window.getUa` 方法里的原 `btoa` 语句是这样的：

```javascript
_0x261229 = btoa(_0x570bef.gzip(_0x261229, {'to': 'string'}));
```

在 NodeJS 里，我们可以这样写：

```javascript
_0x261229 = Buffer.from(_0x570bef.gzip(_0x261229, {'to': 'string'}), "latin1").toString('base64');
```

注意：`Buffer.from()` 传入了一个 `latin1` 参数，这是由于 `_0x570bef.gzip(_0x261229, {'to': 'string'})` 的结果是 Latin1（ISO-8859-1 的别名）编码，如果不传，或者传入其他参数，则最终结果可能和 `btoa` 方法得出的结果不一样！

自此，本地联调完毕，就可以得到正确的 ua 值了！

## 完整代码

GitHub 关注 K 哥爬虫，持续分享爬虫相关代码！欢迎 star ！https://github.com/kgepachong/

**以下只演示部分关键代码，不能直接运行！** 完整代码仓库地址：https://github.com/kgepachong/crawler/

### JavaScript 加密关键代码架构

```javascript
var window = {};
var location = {};
var document = {};
var _0x5a577d = function () {}();
var _0xe26ae = function () {}();
var _0x3204b9 = function () {}();
var _0x3c7e70 = function () {}();
var _0x4a649b = function () {}();
var _0x21524f = function () {}();
var _0x2b0d61 = function () {}();
var _0x53634a = function () {}();
var _0x570bef = function () {}();
var _0xd05c32 = function (_0x5c6c0c) {};
window.CHLOROFP_STATUS = 'start';

// 此处省略 N 个函数

var _0x2e98dd = {
    // 对象具体的值已省略
    "basic": {},
    "header": {},
    "navigator": {},
    "screenData": {},
    "sysfonts": [],
    "geoAndISP": {},
    "browserType": {},
    "performanceTiming": {},
    "canvasFp": {},
    "visTime": [],
    "other": {}
}
var _0x420004 = {
    // 对象具体的值已省略
    "keypress": true,
    "scroll": true,
    "click": true,
    "mousemove": true,
    "mousemoveData": [],
    "keypressData": [],
    "mouseclickData": [],
    "wheelDeltaData": []
}

window.getUa = function () {
    var _0x7dfc34 = new Date().getTime();
    if (_0x4a9622) {
        _0x2644f4();
    }
    _0x55b608();
    var _0x261229 = _0x1722c3(_0x2e98dd) + '|' + _0x1722c3(_0x420004) + '|' + _0x7dfc34.toString(0x10);
    // _0x261229 = btoa(_0x570bef.gzip(_0x261229, {'to': 'string'}));
    _0x261229 = Buffer.from(_0x570bef.gzip(_0x261229, {'to': 'string'}), "latin1").toString('base64');
    return _0x261229;
};

// 测试输出
// console.log(window.getUa())
```

### Python 登录关键代码

```python
# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-11-15
# @Author  : 微信公众号：K哥爬虫
# @FileName: weidian_login.py
# @Software: PyCharm
# ==================================


import execjs
import requests
from urllib import parse


index_url = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
login_url = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36"
session = requests.session()


def get_encrypted_ua():
    with open('get_encrypted_ua.js', 'r', encoding='utf-8') as f:
        uad_js = f.read()
    ua = execjs.compile(uad_js).call('window.getUa')
    ua = parse.quote(ua)
    return ua


def get_wd_token():
    headers = {"User-Agent": UserAgent}
    response = session.get(url=index_url, headers=headers)
    wd_token = response.cookies.get_dict()["wdtoken"]
    return wd_token


def login(phone, password, ua, wd_token):
    headers = {
        "user-agent": UserAgent,
        "origin": "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler",
        "referer": "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler",
    }
    data = {
        "phone": phone,
        "countryCode": "86",
        "password": password,
        "version": "1",
        "subaccountId": "",
        "clientInfo": '{"clientType": 1}',
        "captcha_session": "",
        "captcha_answer": "",
        "vcode": "",
        "mediaVcode": "",
        "ua": ua,
        "scene": "PCLogin",
        "wdtoken": wd_token
    }
    response = session.post(url=login_url, headers=headers, data=data)
    print(response.json())


def main():
    phone = input("请输入登录手机号: ")
    password = input("请输入登录密码: ")
    ua = get_encrypted_ua()
    wd_token = get_wd_token()
    login(phone, password, ua, wd_token)


if __name__ == '__main__':
    main()
```



