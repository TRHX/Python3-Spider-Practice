![](https://i.loli.net/2021/08/07/JbP4zaS2TxU6Rkd.png)

> 关注微信公众号：K哥爬虫，持续分享爬虫进阶、JS/安卓逆向等技术干货！

## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 逆向目标

- 目标：某鹏教育登录接口加密，含有简单的 JS 混淆
- 主页：`aHR0cHM6Ly9sZWFybi5vcGVuLmNvbS5jbi8=`
- 接口：`aHR0cHM6Ly9sZWFybi5vcGVuLmNvbS5jbi9BY2NvdW50L1VuaXRMb2dpbg==`
- 逆向参数：Form Data：`black_box: eyJ2IjoiR01KM0VWWkVxMG0ydVh4WUd...`

## 逆向过程

本次逆向的目标同样是一个登录接口，其中的加密 JS 使用了简单的混淆，可作为混淆还原的入门级教程，来到登录页面，随便输入账号密码进行登录，其中登录的 POST 请求里， Form Data 有个加密参数 black_box，也就是本次逆向的目标，抓包如下：

![01.png](https://i.loli.net/2021/11/11/PNgaT3RV2u8LfbQ.png)

直接搜索 black_box，在 login.js 里可以很容易找到加密的地方，如下图所示：

![02.png](https://i.loli.net/2021/11/11/YUkl7bvTMEzdhSQ.png)

看一下 `_fmOpt.getinfo()` 这个方法，是调用了 fm.js 里的 `OO0O0()` 方法，看这个又是 0 又是 O 的，多半是混淆了，如下图所示：

![03.png](https://i.loli.net/2021/11/11/bANcsgTDErGICZK.png)

点进去看一下，整个 fm.js 都是混淆代码，我们选中类似 `OQoOo[251]` 的代码，可以看到实际上是一个字符串对象，也可以直接在 Console 里输出看到其实际值，这个 `OO0O0` 方法返回的 `oOoo0[OQoOo[448]](JSON[OQoOo[35]](O0oOo[OQoOo[460]]))`，就是 black_box 的值，如下图所示：

![04.png](https://i.loli.net/2021/11/11/k7nxz5qUIKFYa4V.png)

仔细观察，可以发现 `OQoOo` 应该是一个类似数组的东西，通过传入元素下标来依次取其真实值，随便搜索一个值，可以在代码最后面找到一个数组，这个数组其实就是 `OQoOo`，可以传入下标来验证一下，如下图所示：

![05.png](https://i.loli.net/2021/11/11/1L9uSgd3M8qQwYe.png)

到这里其实就知道了其大致混淆原理，我们可以把这个JS 拿下来，到本地写个小脚本，将这些值替换一下：

```python
# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-11-09
# @Author  : 微信公众号：K哥爬虫
# @FileName: replace_js.py
# @Software: PyCharm
# @describe: 混淆还原小脚本
# ==================================


# 待替换的值（太多了，仅列出少部分）
# 以实际列表为准，要和 fm_old.js 里的列表一致
item = ['referrer', 'absolute', 'replace',...]

# 混淆后的 JS
with open("fm_old.js", "r", encoding="utf-8") as f:
    js_lines = f.readlines()

js = ""
for j in js_lines:
    js += j

for i in item:
    # Qo00o 需要根据你 fm_old.js 具体的字符串进行替换
    str_old = "Qo00o[{}]".format(item.index(i))
    js = js.replace(str_old, '"' + i + '"')

# 还原后的 JS
with open("fm_new.js", "w", encoding="utf-8") as f:
    f.write(js)
```

**使用此脚本替换后，可能会发现 JS 会报错，原因是一些换行符、斜杠解析错误，以及双引号重复使用的问题，可以自己手动修改一下。**

这里需要注意的一点，fm.js 后面还有个后缀，类似 t=454594，t=454570 等，不同的后缀得到的 JS 内容也有差异，各种函数变量名和那个列表元素顺序不同，实际上调用的方法是同一个，所以影响不大，只需要注意替换时列表内容、需要替换的那个字符串和你下载的 JS 文件里的一致即可。

将 JS 还原后，我们可以将还原后的 JS 替换掉网站本身经过混淆后的 JS，这里替换方法有很多，比如使用 Fiddler 等抓包工具替换响应、使用 ReRes 之类的插件进行替换、使用浏览器开发者工具自带的 Overrides 功能进行替换（Chrome 64 之后才有的功能）等，这里我们使用 Fiddler 的 Autoresponder 功能来替换。

实测这个 fm.js 的后缀短时间内不会改变，所以可以直接复制其完整地址来替换，要严谨一点的话，我们可以用正则表达式来匹配这个 t 值，在 Fiddler 里面选择 AutoResponder，点击 Add Rule，添加替换规则，正则表达式的方法写法如下：`regex:https:\/\/static\.tongdun\.net\/v3\/fm\.js\?t=\d+`，注意 regex 前缀必不可少，上方依次选中 Enable rules（应用规则）、Accept all CONNECTs（接受所有连接）、Unmatched requests passthrough（不匹配规则的就按照之前的请求地址发送过去），Enable Latency 是设置延迟生效时间，不用勾选，如下图所示：

![06.png](https://i.loli.net/2021/11/12/q6kDBPE3r2UfeHy.png)

替换后再次登录，下断点，可以看到现在的 JS 已经清晰了不少，再看看这个函数最后的 return 语句，`oQOQ0["blackBox"]` 包含了 `it`、`os`、`t`、`v` 三个参数，使用 JSON 的 stringify 方法将其转换成字符串，然后调用 `QQo0` 方法进行加密，如下图所示：

![07.png](https://i.loli.net/2021/11/12/IRMOjQJPAsu4vYW.png)

我们先来看看 `oQOQ0["blackBox"]` 里的四个参数，其中 `it`、`os`、`v` 三个参数在这个函数开始就已经有定义，`v` 就是 `Q0oQQ["version"]`，是定值，直接搜索可以发现这个值是在最开始的那个大列表里，`os` 为定值，`it` 是两个时间戳相减的值，`O000o` 这个方法就是两个值进行相减，`oQOQo` 这个时间戳可以搜索 `var oQOQo`，是一开始加载就生成的时间戳，JS 一开始加载到点击登陆进入加密函数，也就一分钟左右，所以这里我们可以直接生成一个五位随机数（一分钟左右在毫秒上的差值在五位数左右）。

![08.png](https://i.loli.net/2021/11/12/pGdV2ZQR7cxtsMu.png)

现在就剩下一个 `t` 参数了，往下看 `t` 其实就是 `Q0oQQ["tokens"]`，中间经过了一个 if-else 语句，可以埋下断点进行调试，发现其实只执行了 else 语句，对 `t` 赋值也就这一句，所以剩下的代码其实在扣的时候都可以删掉。

![09.png](https://i.loli.net/2021/11/12/MCvXQHntf7jGANV.png)

这个 tokens 多次测试发现是不变的，尝试直接搜索一下 token 关键字，可以发现其赋值的地方，对 `id` 按照 | 符号进行分割，取其第 1 个索引值就是 tokens，再看看 `id` 的值，并没有找到明显的生成逻辑，复制其值搜索一下，发现是通过一个接口返回的，可以直接写死，也可以自己先去请求一下这个接口，取其返回的值，如下图所示：

![10.png](https://i.loli.net/2021/11/12/uAlXNygoqspOK3c.png)

![11.png](https://i.loli.net/2021/11/12/ozV2GF4XQRIT5ZD.png)

自此所有参数都找完了，回到原来的 return 位置，还差一个加密函数，即 `ooOoO["encode"]()`，直接跟进去，将这个方法扣下来即可，本地调试缺啥补啥，将用到的函数补全就行了。

![12.png](https://i.loli.net/2021/11/12/ri3JU8cGHTBNnOh.png)

## 完整代码

GitHub 关注 K 哥爬虫，持续分享爬虫相关代码！欢迎 star ！https://github.com/kgepachong/

**以下只演示部分关键代码，不能直接运行！** 完整代码仓库地址：https://github.com/kgepachong/crawler/

### JavaScript 加密关键代码架构

```javascript
function oQ0OQ(Q0o0, o0OQ) {
    return Q0o0 < o0OQ;
}

function O000O(Q0o0, o0OQ) {
    return Q0o0 >> o0OQ;
}

function Qo0oo(Q0o0, o0OQ) {
    return Q0o0 | o0OQ;
}

function OOO0Q(Q0o0, o0OQ) {
    return Q0o0 << o0OQ;
}

function OooQo(Q0o0, o0OQ) {
    return Q0o0 & o0OQ;
}

function Oo0OO(Q0o0, o0OQ) {
    return Q0o0 + o0OQ;
}

var oQoo0 = {};
oQoo0["_keyStr"] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
oQoo0["encode"] = function QQQ0(Q0o0) {
        var o0OQ = 62;
        while (o0OQ) {
            switch (o0OQ) {
                case 116 + 13 - 65: {}
                case 118 + 8 - 63: {}
                case 94 + 8 - 40: {}
                case 122 + 6 - 63: {}
            }
        }
    };
oQoo0["_utf8_encode"] = function oOQ0(Q0o0) {}

function OOoO0() {
    var tokens = "e0ia+fB5zvGuTjFDgcKahQwg2UEH8b0k7EK/Ukt4KwzyCbpm11jjy8Au64MC6s7HvLRacUxd7ka4AdDidJmYAA==";
    var version = "+X+3JWoUVBc12xtmgMpwzjAone3cp6/4QuFj7oWKNk+C4tqy4un/e29cODlhRmDy";
    var Oo0O0 = {};
    Oo0O0["blackBox"] = {};
    Oo0O0["blackBox"]["v"] = version;
    Oo0O0["blackBox"]["os"] = "web";
    Oo0O0["blackBox"]["it"] = parseInt(Math.random() * 100000);
    Oo0O0["blackBox"]["t"] = tokens;
    return oQoo0["encode"](JSON.stringify(Oo0O0["blackBox"]));
}

// 测试样例
console.log(OOoO0())
```

### Python 登录关键代码

```python
# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-11-10
# @Author  : 微信公众号：K哥爬虫
# @FileName: open_login.py
# @Software: PyCharm
# ==================================


import time
import execjs
import requests


login_url = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"


def get_black_box():
    with open('get_black_box.js', 'r', encoding='utf-8') as f:
        exec_js = f.read()
    black_box = execjs.compile(exec_js).call('OOoO0')
    return black_box


def login(black_box, username, password):
    params = {"bust": str(int(time.time() * 1000))}
    data = {
        "loginName": username,
        "passWord": password,
        "validateNum": "",
        "black_box": black_box
    }
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36"
    }
    response = requests.post(url=login_url, params=params, data=data, headers=headers)
    print(response.json())


def main():
    username = input("请输入登录账号: ")
    password = input("请输入登录密码: ")
    black_box = get_black_box()
    login(black_box, username, password)


if __name__ == '__main__':
    main()
```

