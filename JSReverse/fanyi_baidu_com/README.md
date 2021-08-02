## 百度翻译

- 目标：百度翻译接口参数
- 主页：https://fanyi.youdao.com/
- 接口：https://fanyi.baidu.com/v2transapi
- 逆向参数：
    - Form Data：
        - `sign: 706553.926920`
        - `token: d838e2bd3d5a3bb67100a7b789463022`

## 分析过程

token 的值直接搜索，在首页源码里面可以找到，全局搜索 sign，定位到 8392 行，这里数据比较完整，埋下断点进行调试，可以看到此时 sign 的值就是最终我们想要的，这里将待翻译字符串传入了 L 函数，直接跟进：

![01.png](https://i.loli.net/2021/07/13/gAweEa8dX1HCOT9.png)

![02.png](https://i.loli.net/2021/07/13/Y9akmlEzoI73VQe.png)

可以发现 sign 的值其实是 `function e(r)` 这个函数进行一系列操作之后得到的，直接复制这个函数进行本地调试，调试过程中可以发现缺少一个 i 的值和一个函数 n，在右边的 Closure 栏里，或者鼠标选中 i，可以看到 i 的值，多次调试发现它是固定的，函数 n，直接跟进：

![03.png](https://i.loli.net/2021/07/13/Xvqw8oVtQAkn2jf.png)

## 加密 JS 剥离

将 i 的值、函数 e，函数 n copy 下来，最终的 JS 加密核心代码剥离如下：

```javascript
var i = '320305.131321201'

function n(r, o) {
    for (var t = 0; t < o.length - 2; t += 3) {
        var a = o.charAt(t + 2);
        a = a >= "a" ? a.charCodeAt(0) - 87 : Number(a), a = "+" === o.charAt(t + 1) ? r >>> a : r << a, r = "+" === o.charAt(t) ? r + a & 4294967295 : r ^ a
    }
    return r
}

function e(r) {
    var o = r.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g);
    if (null === o) {
        var t = r.length;
        t > 30 && (r = "" + r.substr(0, 10) + r.substr(Math.floor(t / 2) - 5, 10) + r.substr(-10, 10))
    } else {
        for (var e = r.split(/[\uD800-\uDBFF][\uDC00-\uDFFF]/), C = 0, h = e.length, f = []; h > C; C++) "" !== e[C] && f.push.apply(f, a(e[C].split(""))), C !== h - 1 && f.push(o[C]);
        var g = f.length;
        g > 30 && (r = f.slice(0, 10).join("") + f.slice(Math.floor(g / 2) - 5, Math.floor(g / 2) + 5).join("") + f.slice(-10).join(""))
    }
    var u = void 0, l = "" + String.fromCharCode(103) + String.fromCharCode(116) + String.fromCharCode(107);
    u = null !== i ? i : (i = window[l] || "") || "";
    for (var d = u.split("."), m = Number(d[0]) || 0, s = Number(d[1]) || 0, S = [], c = 0, v = 0; v < r.length; v++) {
        var A = r.charCodeAt(v);
        128 > A ? S[c++] = A : (2048 > A ? S[c++] = A >> 6 | 192 : (55296 === (64512 & A) && v + 1 < r.length && 56320 === (64512 & r.charCodeAt(v + 1)) ? (A = 65536 + ((1023 & A) << 10) + (1023 & r.charCodeAt(++v)), S[c++] = A >> 18 | 240, S[c++] = A >> 12 & 63 | 128) : S[c++] = A >> 12 | 224, S[c++] = A >> 6 & 63 | 128), S[c++] = 63 & A | 128)
    }
    for (var p = m, F = "" + String.fromCharCode(43) + String.fromCharCode(45) + String.fromCharCode(97) + ("" + String.fromCharCode(94) + String.fromCharCode(43) + String.fromCharCode(54)), D = "" + String.fromCharCode(43) + String.fromCharCode(45) + String.fromCharCode(51) + ("" + String.fromCharCode(94) + String.fromCharCode(43) + String.fromCharCode(98)) + ("" + String.fromCharCode(43) + String.fromCharCode(45) + String.fromCharCode(102)), b = 0; b < S.length; b++) p += S[b], p = n(p, F);
    return p = n(p, D), p ^= s, 0 > p && (p = (2147483647 & p) + 2147483648), p %= 1e6, p.toString() + "." + (p ^ m)
}

// console.log(e('测试'))
```