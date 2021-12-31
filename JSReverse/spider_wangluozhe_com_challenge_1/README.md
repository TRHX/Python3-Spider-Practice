![](https://i.loli.net/2021/08/07/JbP4zaS2TxU6Rkd.png)

> 关注微信公众号：K哥爬虫，持续分享爬虫进阶、JS/安卓逆向等技术干货！


## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 写在前面

题目本身不是很难，但是其中有很多坑，主要是反 Hook 操作和本地联调补环境，本文会详细介绍每一个坑，并不只是一笔带过，写得非常详细！

通过本文你将学到：

1. Hook Function 和定时器来消除无限 debugger；
2. 解决反 Hook，通过 Hook 的方式找到加密参数 _signature；
3. 分析浏览器与本地环境差异，如何寻找 navigator、document、location 等对象，如何本地补环境；
4. 如何利用 PyCharm 进行本地联调，定位本地和浏览器环境的差异，从而过掉检测。

## 逆向目标

- 目标：网洛者反反爬虫练习平台第一题：JS 混淆加密，反 Hook 操作
- 链接：http://spider.wangluozhe.com/challenge/1
- 简介：本题要提交的答案是100页的所有数据并加和，要求以 Hook 的方式完成此题，不要以 AST、扣代码等方式解决，不要使用 JS 反混淆工具进行解密。（Hook 代码的写法和用法，K哥以前文章有，本文不再详细介绍）

![01.png](https://i.loli.net/2021/12/01/Dl5nHPkbWFoSuqA.png)

## 绕过无限 debugger

首先观察到点击翻页，URL 并没有发生变化，那么一般就是 Ajax 请求，每一次请求有些参数会改变，熟练的按下 F12 准备查找加密参数，会发现立马断住，进入无限 debugger 状态，往上跟一个栈，可以发现 debugger 字样，如下图所示：

![02.png](https://i.loli.net/2021/12/01/gxGapwsETNykFjm.png)

这种情况在K哥以前的案例中也有，当时我们是直接重写这个 JS，把 debugger 字样给替换掉就行了，但是本题很显然是希望我们以 Hook 的方法来过掉无限 debugger，除了 debugger 以外，我们注意到前面还有个 constructor 字样，在 JavaScript 中它叫构造方法，一般在对象创建或者实例化时候被调用，它的基本语法是：`constructor([arguments]) { ... }`，详细介绍可参考 [MDN 构造方法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/constructor)，在本案例中，很明显 debugger 就是 constructor 的 arguments 参数，因此我们可以写出以下 Hook 代码来过掉无限 debugger：

```javascript
// 先保留原 constructor
Function.prototype.constructor_ = Function.prototype.constructor;
Function.prototype.constructor = function (a) {
    // 如果参数为 debugger，就返回空方法
    if(a == "debugger") {
        return function (){};
    }
    // 如果参数不为 debugger，还是返回原方法
    return Function.prototype.constructor_(a);
};
```

注入 Hook 代码的方法也有很多，比如直接在浏览器开发者工具控制台输入代码（刷新网页会失效）、Fiddler 插件注入、油猴插件注入、自写浏览器插件注入等，这些方法在K哥以前的文章都有介绍，今天就不再赘述。

本次我们使用 Fiddler 插件注入，注入以上 Hook 代码后，会发现会再次进入无限 debugger，setInterval，很明显的定时器，他有两个必须的参数，第一个是要执行的方法，第二个是时间参数，即周期性调用方法的时间间隔，以毫秒为单位，详细介绍可参考[菜鸟教程 Window setInterval()](https://www.runoob.com/jsref/met-win-setinterval.html)，同样我们也可以将其 Hook 掉：

```javascript
// 先保留原定时器
var setInterval_ = setInterval
setInterval = function (func, time){
    // 如果时间参数为 0x7d0，就返回空方法
    // 当然也可以不判断，直接返回空，有很多种写法
    if(time == 0x7d0)
    {
        return function () {};
    }
    // 如果时间参数不为 0x7d0，还是返回原方法
    return setInterval_(func, time)
}
```

![03.png](https://i.loli.net/2021/12/01/wMTA1ltFDzmCRs6.png)

将两段 Hook 代码粘贴到浏览器插件里，开启 Hook，重新刷新页面就会发现已经过掉了无限 debugger。

![04.png](https://i.loli.net/2021/12/01/WAIrKJZkFX9iufH.png)

## Hook 参数

过掉无限 debugger 后，我们随便点击一页，抓包可以看到是个 POST 请求，Form Data 里，`page` 是页数，`count` 是每一页数据量，`_signature` 是我们要逆向的参数，如下图所示：

![05.png](https://i.loli.net/2021/12/02/AfWqUbjB3HaxDke.png)

我们直接搜索 `_signature`，只有一个结果，其中有个 `window.get_sign()` 方法就是设置 `_signature` 的函数，如下图所示：

![06.png](https://i.loli.net/2021/12/02/Nx8O6tTSAP13b4j.png)

这里问题来了！！！我们再看看本题的题目，JS 混淆加密，反 Hook 操作，作者也再三强调本题是考验 Hook 能力！并且到目前为止，我们好像还没有遇到什么反 Hook 手段，所以，这样直接搜索 `_signature` 很显然太简单了，肯定是要通过 Hook 的方式来获取 `_signature`，并且后续的 Hook 操作肯定不会一帆风顺！

话不多说，我们直接写一个 Hook `window._signature` 的代码，如下所示：

```javascript
(function() {
    //严谨模式 检查所有错误
    'use strict';
    //window 为要 hook 的对象，这里是 hook 的 _signature
	var _signatureTemp = "";
    Object.defineProperty(window, '_signature', {
		//hook set 方法也就是赋值的方法 
		set: function(val) {
				console.log('Hook 捕获到 _signature 设置->', val);
                debugger;
				_signatureTemp = val;
				return val;
		},
		//hook get 方法也就是取值的方法 
		get: function()
		{
			return _signatureTemp;
		}
    });
})();
```

将两个绕过无限 debugger 的 Hook 代码，和这个 Hook `_signature` 的代码一起，使用 Fiddler 插件一同注入（这里注意要把绕过 debugger 的代码放在 Hook `_signature` 代码的后面，否则有可能不起作用，这可能是插件的 BUG），重新刷新网页，可以发现前端的一排页面的按钮不见了，打开开发者工具，可以看到右上角提示有两个错误，点击可跳转到出错的代码，在控制台也可以看到报错信息，如下图所示：

![07.png](https://i.loli.net/2021/12/02/WoSVFgNBajHek2O.png)

整个 1.js 代码是经过了 sojson jsjiami v6 版本混淆了的，我们将里面的一些混淆代码在控制台输出一下，然后手动还原一下这段代码，有两个变量 `i1I1i1li` 和 `illllli1`，看起来费劲，直接用 `a` 和 `b` 代替，如下所示：

```javascript
(function() {
    'use strict';
    var a = '';
    Object["defineProperty"](window, "_signature", {
        set: function(b) {
            a = b;
            return b;
        },
        get: function() {
            return a;
        }
    });
}());
```

是不是很熟悉？有 get 和 set 方法，这不就是在进行 Hook `window._signature` 操作吗？整个逻辑就是当 set 方法设置 `_signature` 时，将其赋值给 a，get 方法获取 `_signature` 时，返回 a，这么操作一番，实际上对于 `_signature` 没有任何影响，那这段代码存在的意义是啥？为什么我们添加了自己的 Hook 代码就会报错？

来看看报错信息：`Uncaught TypeError: Cannot redefine property: _signature`，不能重新定义 `_signature`？我们的 Hook 代码在页面一加载就运行了 `Object.defineProperty(window, '_signature', {})`，等到网站的 JS 再次 `defineProperty` 时就会报错，那很简单嘛，既然不让重新定义，而且网站自己的 JS Hook 代码不会影响 `_signature`，直接将其删掉不就行了嘛！这个地方大概就是反 Hook 操作了。

保存原 1.js 到本地，删除其 Hook 代码，使用 Fiddler 的 AutoResponder 功能替换响应（替换方法有很多，K哥以前的文章同样有介绍），再次刷新发现异常解除，并且成功 Hook 到了  `_signature`。

![08.png](https://i.loli.net/2021/12/02/3kLVGwhfDlCsWNx.png)

![09.png](https://i.loli.net/2021/12/02/7c5HC4yiuFVKo8k.png)

## 逆向参数

成功 Hook 之后，直接跟栈，直接把方法暴露出来了：`window._signature = window.byted_acrawler(window.sign())`

![10.png](https://i.loli.net/2021/12/02/gzuJKOiXAa3UIZc.png)

先来看看 `window.sign()`，选中它其实就可以看到是 13 位毫秒级时间戳，我们跟进 1.js 去看看他的实现代码：

![11.png](https://i.loli.net/2021/12/03/aWsj2qfVY8Lyw5N.png)

我们将部分混淆代码手动还原一下：

```javascript
window["sign"] = function sign() {
    try {
        div = document["createElement"];
        return Date["parse"](new Date())["toString"]();
    } catch (IIl1lI1i) {
        return "123456789abcdefghigklmnopqrstuvwxyz";
    }
}
```

这里就要注意了，有个坑给我们埋下了，如果直接略过，觉得就一个时间戳没啥好看的，那你就大错特错了！注意这是一个 try-catch 语句，其中有一句 `div = document["createElement"];`，有一个 HTML DOM Document 对象，创建了 div 标签，这段代码如果放到浏览器执行，没有任何问题，直接走 try 语句，返回时间戳，如果在我们本地 node 执行，就会捕获到 `document is not defined`，然后走 catch 语句，返回的是那一串数字加字母，最后的结果肯定是不正确的！

解决方法也很简单，在本地代码里，要么去掉 try-catch 语句，直接 return 时间戳，要么在开头定义一下 document，再或者直接注释掉创建 div 标签的这行代码，但是K哥在这里推荐直接定义一下 document，因为谁能保证在其他地方也有类似的坑呢？万一隐藏得很深，没发现，岂不是白费力气了？

然后再来看看  `window.byted_acrawler()`，return 语句里主要用到了 `sign()` 也就是 `window.sign()` 方法和 `IIl1llI1()` 方法，我们跟进  `IIl1llI1()` 方法可以看到同样使用了 try-catch 语句，`nav = navigator[liIIIi11('2b')];` 和前面 div 的情况如出一辙，同样的这里也建议直接定义一下 navigator，如下图所示：

![14.png](https://s2.loli.net/2021/12/08/dGmLCQTBH2lptR1.png)

![15.png](https://s2.loli.net/2021/12/08/V7sJdKFfuIY5o1r.png)

到这里用到的方法基本上分析完毕，我们将 window、document、navigator 都定义一下后，本地运行一下，会提示 `window[liIIIi11(...)] is not a function`：

![16.png](https://s2.loli.net/2021/12/08/g7MUING2Ft4LbWw.png)

我们去网页里看看，会发现这个方法其实就是一个定时器，没有太大作用，直接注释掉即可：

![17.png](https://s2.loli.net/2021/12/08/wV1XADy4jqoQEYW.png)

## PyCharm 本地联调

经过以上操作以后，再次本地运行，会提示 `window.signs is not a function`，出错的地方是一个 eval 语句，我们去浏览器看一下这个 eval 语句，发现明明是 `window.sign()`，为什么本地就变成了 `window.signs()`，平白无故多了个 s 呢？

![18.png](https://s2.loli.net/2021/12/08/3NFwIuhpQTzAXDf.png)

![19.png](https://s2.loli.net/2021/12/08/WoswIX96gvRLTle.png)

造成这种情况的原因只有一个，那就是本地与浏览器的环境差异，混淆的代码里肯定有环境检测，如果不是浏览器环境的话，就会修改 eval 里的代码，多加了一个 s，这里如果你直接删掉包含 eval 语句的整个函数和上面的 setInterval 定时器，代码也能正常运行，但是，K哥一向是追求细节的！多加个 s 的原因咱必须得搞清楚呀！

我们在本地使用 PyCharm 进行调试，看看到底是哪里给加了个 s，出错的地方是这个 eval 语句，我们点击这一行，下个断点，右键 debug 运行，进入调试界面（PS：原代码有无限 debugger，如果不做处理，PyCharm 里调试同样也会进入无限 debugger，可以直接把前面的 Hook 代码加到本地代码前面，也可以直接删除对应的函数或变量）：

![20.png](https://s2.loli.net/2021/12/08/vAKwDeXM4m5cqRo.png)

左侧是调用栈，右侧是变量值，整体上和 Chrome 里面的开发者工具差不多，详细用法可参考 [JetBrains 官方文档](https://www.jetbrains.com/help/pycharm/debugging-code.html)，主要介绍一下图中的 8 个按钮：

1. Show Execution Point (Alt + F10)：如果你的光标在其它行或其它页面，点击这个按钮可跳转到当前断点所在的行；
2. Step Over (F8)：步过，一行一行地往下走，如果这一行上有方法也不会进入方法；
3. Step Into (F7)：步入，如果当前行有方法，可以进入方法内部，一般用于进入用户编写的自定义方法内，不会进入官方类库的方法；
4. Force Step Into (Alt + Shift + F7)：强制步入，能进入任何方法，查看底层源码的时候可以用这个进入官方类库的方法；
5. Step Out (Shift + F8)：步出，从步入的方法内退出到方法调用处，此时方法已执行完毕，只是还没有完成赋值；
6. Restart Frame：放弃当前断点，重新执行断点；
7. Run to Cursor (Alt + F9)：运行到光标处，代码会运行至光标行，不需要打断点；
8. Evaluate Expression (Alt + F8)：计算表达式，可以直接运行表达式，不需要在命令行输入。

我们点击步入按钮（Step Into），会进入到 `function IIlIliii()`，这里同样使用了 try-catch 语句，继续下一步，会发现捕获到了异常，提示 `Cannot read property 'location' of undefined`，如下图所示：

![21.png](https://s2.loli.net/2021/12/08/KWtGkZw5Us9lARY.png)

我们输出一下各个变量的值，手动还原一下代码，如下：

```javascript
function IIlIliii(II1, iIIiIIi1) {
    try {
        href = window["document"]["location"]["href"];
        check_screen = screen["availHeight"];
        window["code"] = "gnature = window.byted_acrawler(window.sign())";
        return '';
    } catch (I1IiI1il) {
        window["code"] = "gnature = window.byted_acrawlers(window.signs())";
        return '';
    }
}
```

这么一来，就发现了端倪，在本地我们并没有 document、location、href、availHeight 对象，所以就会走 catch 语句，变成了 `window.signs()`，就会报错，这里解决方法也很简单，可以直接删掉多余代码，直接定义为不带 s 的那串语句，或者也可以选择补一下环境，在浏览器里看一下 href 和 screen 的值，定义一下即可：

```javascript
var window = {
    "document": {
        "location": {
            "href": "http://spider.wangluozhe.com/challenge/1"
        }
    },
}

var screen = {
    "availHeight": 1040
}
```

然后再次运行，又会提示 `sign is not defined`，这里的 `sign()` 其实就是 `window.sign()`，也就是下面的 `window[liIIIi11('a')]` 方法，任意改一种写法即可：

![22.png](https://s2.loli.net/2021/12/08/xSQL7FrsMtyUGk3.png)

再次运行，没有错误了，我们可以自己写一个方法来获取 `_signature`：以下写法二选一，都可以：

```javascript
function getSign(){
    return window[liIIIi11('9')](window[liIIIi11('a')]())
}

function getSign(){
    return window.byted_acrawler(window.sign())
}

// 测试输出
console.log(getSign())
```

我们运行一下，发现在 Pycharm 里并没有任何输出，同样的我们在题目页面的控制台输出一下 `console.log`，发现被置空了，如下图所示：

![23.png](https://s2.loli.net/2021/12/08/5X1BwyqvfoR7l6h.png)

看来他还对  `console.log` 做了处理，其实这种情况问题不大，我们直接使用 Python 脚本来调用前面我们写的 `getSign()` 方法就能得到 `_signature` 的值了，但是，再次重申，K哥一向是追求细节的！我就得找到处理 `console.log` 的地方，把它变为正常！

这里我们仍然使用 Pycharm 来调试，进一步熟悉本地联调，在 `console.log(getSign())` 语句处下个断点，一步一步跟进，会发现进到了语句 `var IlII1li1 = function() {};`，查看此时变量值，发现 `console.log`、`console.warn` 等方法都被置空了，如下图所示：

![24.png](https://s2.loli.net/2021/12/08/w6q3A5xDypVWSzG.png)

再往下一步跟进，发现直接返回了，这里有可能第一次运行 JS 时就会对 console 相关命令进行方法置空处理，所以先在疑似对 console 处理的方法里面下几个断点，再重新调试，会发现会走到 else 语句，然后直接将 IlII1li1 也就是空方法，赋值给 console 相关命令，如下图所示：

![25.png](https://s2.loli.net/2021/12/08/grjXMAowxzYWEmD.png)

定位到了问题所在，我们直接把 if-else 语句注释掉，不让它置空即可，然后再次调试，发现就可以直接输出结果了：

![26.png](https://s2.loli.net/2021/12/08/AUV6kgurWdC1Thz.png)

调用 Python 携带 _signature 挨个计算每一页的数据，最终提交成功：

![2.png](https://s2.loli.net/2021/12/08/qcgCRweXfSPphoD.png)

## 完整代码

GitHub 关注 K 哥爬虫，持续分享爬虫相关代码！欢迎 star ！https://github.com/kgepachong/

**以下只演示部分关键代码，不能直接运行！**完整代码仓库地址：https://github.com/kgepachong/crawler/

### JavaScript 加密关键代码架构

```javascript
var window = {
    "document": {
        "location": {
            "href": "http://spider.wangluozhe.com/challenge/1"
        }
    },
}

var screen = {
    "availHeight": 1040
}
var document = {}
var navigator = {}
var location = {}

// 先保留原 constructor
Function.prototype.constructor_ = Function.prototype.constructor;
Function.prototype.constructor = function (a) {
    // 如果参数为 debugger，就返回空方法
    if(a == "debugger") {
        return function (){};
    }
    // 如果参数不为 debugger，还是返回原方法
    return Function.prototype.constructor_(a);
};

// 先保留原定时器
var setInterval_ = setInterval
setInterval = function (func, time){
    // 如果时间参数为 0x7d0，就返回空方法
    // 当然也可以不判断，直接返回空，有很多种写法
    if(time == 0x7d0)
    {
        return function () {};
    }
    // 如果时间参数不为 0x7d0，还是返回原方法
    return setInterval_(func, time)
}

var iｉl = 'jsjiami.com.v6'
  , iiIIilii = [iｉl, '\x73\x65\x74\x49\x6e\x74\x65\x72\x76\x61\x6c', '\x6a\x73\x6a', ...];
var liIIIi11 = function(_0x11145e, _0x3cbe90) {
    _0x11145e = ~~'0x'['concat'](_0x11145e);
    var _0x636e4d = iiIIilii[_0x11145e];
    return _0x636e4d;
};
(function(_0x52284d, _0xfd26eb) {
    var _0x1bba22 = 0x0;
    for (_0xfd26eb = _0x52284d['shift'](_0x1bba22 >> 0x2); _0xfd26eb && _0xfd26eb !== (_0x52284d['pop'](_0x1bba22 >> 0x3) + '')['replace'](/[fnwRwdGKbwKrRFCtSC=]/g, ''); _0x1bba22++) {
        _0x1bba22 = _0x1bba22 ^ 0x661c2;
    }
}(iiIIilii, liIIIi11));
// window[liIIIi11('0')](function() {
//     var l111IlII = liIIIi11('1') + liIIIi11('2');
//     if (typeof iｉl == liIIIi11('3') + liIIIi11('4') || iｉl != l111IlII + liIIIi11('5') + l111IlII[liIIIi11('6')]) {
//         var Ilil11iI = [];
//         while (Ilil11iI[liIIIi11('6')] > -0x1) {
//             Ilil11iI[liIIIi11('7')](Ilil11iI[liIIIi11('6')] ^ 0x2);
//         }
//     }
//     iliI1lli();
// }, 0x7d0);
(function() {
    var iiIIiil = function() {}();
    var l1liii11 = function() {}();
    window[liIIIi11('9')] = function byted_acrawler() {};
    window[liIIIi11('a')] = function sign() {};
    (function() {}());
    // (function() {
    //     'use strict';
    //     var i1I1i1li = '';
    //     Object[liIIIi11('1f')](window, liIIIi11('21'), {
    //         '\x73\x65\x74': function(illllli1) {
    //             i1I1i1li = illllli1;
    //             return illllli1;
    //         },
    //         '\x67\x65\x74': function() {
    //             return i1I1i1li;
    //         }
    //     });
    // }());
    var iiil1 = 0x0;
    var l11il1l1 = '';
    var ii1Ii = 0x8;
    function i1Il11i(iiIll1i) {}
    function I1lIIlil(l11l1iIi) {}
    function lllIIiI(IIi1lIil) {}

    // 此处省略 N 个函数
    
    window[liIIIi11('37')]();
}());

function iliI1lli(lil1I1) {
    function lili11I(l11I11l1) {
        if (typeof l11I11l1 === liIIIi11('38')) {
            return function(lllI11i) {}
            [liIIIi11('39')](liIIIi11('3a'))[liIIIi11('8')](liIIIi11('3b'));
        } else {
            if (('' + l11I11l1 / l11I11l1)[liIIIi11('6')] !== 0x1 || l11I11l1 % 0x14 === 0x0) {
                (function() {
                    return !![];
                }
                [liIIIi11('39')](liIIIi11('3c') + liIIIi11('3d'))[liIIIi11('3e')](liIIIi11('3f')));
            } else {
                (function() {
                    return ![];
                }
                [liIIIi11('39')](liIIIi11('3c') + liIIIi11('3d'))[liIIIi11('8')](liIIIi11('40')));
            }
        }
        lili11I(++l11I11l1);
    }
    try {
        if (lil1I1) {
            return lili11I;
        } else {
            lili11I(0x0);
        }
    } catch (liIlI1il) {}
}
;iｉl = 'jsjiami.com.v6';

// function getSign(){
//     return window[liIIIi11('9')](window[liIIIi11('a')]())
// }

function getSign(){
    return window.byted_acrawler(window.sign())
}

console.log(getSign())

```

### Python 计算关键代码

```python
# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-12-01
# @Author  : 微信公众号：K哥爬虫
# @FileName: challenge_1.py
# @Software: PyCharm
# ==================================


import execjs
import requests

challenge_api = "http://spider.wangluozhe.com/challenge/api/1"
headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Cookie": "将 cookie 值改为你自己的！",
    "Host": "spider.wangluozhe.com",
    "Origin": "http://spider.wangluozhe.com",
    "Referer": "http://spider.wangluozhe.com/challenge/1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest"
}


def get_signature():
    with open('challenge_1.js', 'r', encoding='utf-8') as f:
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

