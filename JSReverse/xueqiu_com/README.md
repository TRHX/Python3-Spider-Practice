![](https://i.loli.net/2021/08/07/JbP4zaS2TxU6Rkd.png)

> 关注微信公众号：K哥爬虫，持续分享爬虫进阶、JS/安卓逆向等技术干货！

## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 逆向目标

- 目标：X 球投资者社区 cookie 参数 `acw_sc__v2` 加密分析
- 主页：`aHR0cHM6Ly94dWVxaXUuY29tL3RvZGF5`
- 逆向参数：Cookie：`acw_tc=27608267164066250867189...`

## 抓包分析

我们的爬虫目标是：精华 —> 今日话题 —> X球热帖，热帖是 Ajax 加载的，很容易找到数据接口，接口没有其他的加密参数，主要是 cookie 里有一些值，没有 cookie 是无法访问的，其中，cookie 里又有一个 `acw_sc__v2` 的值，是通过 JS 生成的，其他值都是首次访问首页得到的，抓包如下：

![01.png](https://s2.loli.net/2021/12/28/LifyWbZ3FSNItYk.png)

## 加密查找

我们清除一下 cookie，打开 F12 开发者工具，刷新页面，发现会进入反调试，出现了无限 debugger，往上跟调用栈，可以看到这个方法里有一大串混淆后的代码，拼接起来其实就是 debugger，如下图所示：

![02.png](https://s2.loli.net/2021/12/28/2SHnK3l1r6qXMUG.png)

过掉 debugger 也很简单，需要注意的是这个站比较刁钻，第一次访问首页直接是混淆的 JS 代码，后面才会跳转到正常的 HTML 页面，如果你想本地替换 JS 的话，debugger 倒是过掉了，不过后续就有可能无法调试了，感兴趣的朋友可以自己试试，这里K哥就直接右键 Never pause here 永不在此处断下了：

![03.png](https://s2.loli.net/2021/12/28/UyVtP63aImFhNvX.png)

我们观察这个混淆代码，直接搜索 `acw_sc__v2`，可以看到最后面有设置 cookie 的操作，其中 x 就是 `acw_sc__v2` 的值：

![04.png](https://s2.loli.net/2021/12/28/i2puMfh8BPU5Ok9.png)

## 参数逆向

我们往上跟调用栈，看看 x 是怎么得来的，这里 setTimeout 时间一到就会执行 `'\x72\x65\x6c\x6f\x61\x64\x28\x61\x72\x67\x32\x29'`，控制台输出一下会发现就是 reload 方法，传入的参数是 arg2，arg2 的值就是 `acw_sc__v2` 的值，如下图所示：

![05.png](https://s2.loli.net/2021/12/28/IqUdklQtsmAPXgw.png)

arg1 在头部定义了，需要注意的是，每次刷新，这个 arg1 会变，所以我们在后面取值时要动态获取，我们把关键代码单独拿出来分析一下：

```javascript
var arg1 = '6A6BE0CAF2D2305297951C9A2ADBC2E8D21D48FD';
var _0x5e8b26 = _0x55f3('0x3', '\x6a\x53\x31\x59');
var _0x23a392 = arg1[_0x55f3('0x19', '\x50\x67\x35\x34')]();
arg2 = _0x23a392[_0x55f3('0x1b', '\x7a\x35\x4f\x26')](_0x5e8b26);
```

可以看到主要就是这个 `_0x55f3()` 方法，如果你直接把这个方法扣下来的话，本地运行会直接进入死循环，多调试几遍就会发现 `_0x5e8b26` 调用函数传参每次都是一样的，每次的结果也是一样的，所以可以直接写成定值，arg2 的 `_0x23a392[_0x55f3('0x1b', '\x7a\x35\x4f\x26')]` 其实就是用了一个匿名函数，如下图所示：

![06.png](https://s2.loli.net/2021/12/28/RWIeFakGvxi1wJu.png)

我们直接跟进这个匿名函数，可以看到里面同样调用了很多 `_0x55f3()` 方法，我们直接在控制台输出一下，然后把结果直接拿到本地即可：

![07.png](https://s2.loli.net/2021/12/28/RBzimIWuKZh27yN.png)

所有结果替换掉后，会发现还会依赖另一个匿名函数，最后将这两个匿名函数全部扣下来即可：

![08.png](https://s2.loli.net/2021/12/28/8EhalCDWjBJOUc7.png)

当然如果遇到调用非常多 `_0x55f3()` 方法的情况，那就不可能挨个替换了，就需要进一步分析该函数里面的逻辑，在本地单步调试，看是由于什么原因进入了死循环，里面非常多的 if-else 语句，肯定是缺少某个环境导致进入 else 语句，从而导致死循环了，直接删除 else 语句、补环境走 if 语句等做法都是可以的。

## 完整代码

GitHub 关注 K 哥爬虫，持续分享爬虫相关代码！欢迎 star ！https://github.com/kgepachong/

**以下只演示部分关键代码，不能直接运行！** 完整代码仓库地址：https://github.com/kgepachong/crawler/

### JavaScript 加密代码

```javascript
/* ==================================
# @Time    : 2021-12-29
# @Author  : 微信公众号：K哥爬虫
# @FileName: get_acw_sc_v2.js
# @Software: PyCharm
# ================================== */

var _0x5e8b26 = '3000176000856006061501533003690027800375'

var getAcwScV2 = function (arg1) {
    String['prototype']['hexXor'] = function (_0x4e08d8) {
        var _0x5a5d3b = '';
        for (var _0xe89588 = 0x0; _0xe89588 < this['length'] && _0xe89588 < _0x4e08d8['length']; _0xe89588 += 0x2) {
            var _0x401af1 = parseInt(this['slice'](_0xe89588, _0xe89588 + 0x2), 0x10);
            var _0x105f59 = parseInt(_0x4e08d8['slice'](_0xe89588, _0xe89588 + 0x2), 0x10);
            var _0x189e2c = (_0x401af1 ^ _0x105f59)['toString'](0x10);
            if (_0x189e2c['length'] == 0x1) {
                _0x189e2c = '0' + _0x189e2c;
            }
            _0x5a5d3b += _0x189e2c;
        }
        return _0x5a5d3b;
    };
    String['prototype']['unsbox'] = function () {
        var _0x4b082b = [0xf, 0x23, 0x1d, 0x18, 0x21, 0x10, 0x1, 0x26, 0xa, 0x9, 0x13, 0x1f, 0x28, 0x1b, 0x16, 0x17, 0x19, 0xd, 0x6, 0xb, 0x27, 0x12, 0x14, 0x8, 0xe, 0x15, 0x20, 0x1a, 0x2, 0x1e, 0x7, 0x4, 0x11, 0x5, 0x3, 0x1c, 0x22, 0x25, 0xc, 0x24];
        var _0x4da0dc = [];
        var _0x12605e = '';
        for (var _0x20a7bf = 0x0; _0x20a7bf < this['length']; _0x20a7bf++) {
            var _0x385ee3 = this[_0x20a7bf];
            for (var _0x217721 = 0x0; _0x217721 < _0x4b082b['length']; _0x217721++) {
                if (_0x4b082b[_0x217721] == _0x20a7bf + 0x1) {
                    _0x4da0dc[_0x217721] = _0x385ee3;
                }
            }
        }
        _0x12605e = _0x4da0dc['join']('');
        return _0x12605e;
    };
    var _0x23a392 = arg1['unsbox']();
    arg2 = _0x23a392['hexXor'](_0x5e8b26);
    return arg2
};

// 测试输出
// var arg1 = '2410463826D86A52A5BB43A13A80BAE6C4122A73';
// console.log(getAcwScV2(arg1))
```

## Python 测试代码

```python
# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-12-29
# @Author  : 微信公众号：K哥爬虫
# @FileName: main.py
# @Software: PyCharm
# ==================================


import re
import execjs
import requests


index_url = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
news_test_url = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
headers = {
    "Host": "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler",
    "Referer": "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
}


def get_complete_cookie():
    complete_cookie = {}
    # 第一次不带参数访问首页，获取 acw_tc 和 acw_sc__v2
    response = requests.get(url=index_url, headers=headers)
    complete_cookie.update(response.cookies.get_dict())
    arg1 = re.findall("arg1='(.*?)'", response.text)[0]
    with open('get_acw_sc_v2.js', 'r', encoding='utf-8') as f:
        acw_sc_v2_js = f.read()
    acw_sc__v2 = execjs.compile(acw_sc_v2_js).call('getAcwScV2', arg1)
    complete_cookie.update({"acw_sc__v2": acw_sc__v2})
    # 第二次访问首页，获取其他 cookies
    response2 = requests.get(url=index_url, headers=headers, cookies=complete_cookie)
    complete_cookie.update(response2.cookies.get_dict())
    return complete_cookie


def news_test(cookies):
    response = requests.get(url=news_test_url, headers=headers, cookies=cookies)
    print(response.json())


if __name__ == '__main__':
    complete_cookie = get_complete_cookie()
    news_test(complete_cookie)
```

